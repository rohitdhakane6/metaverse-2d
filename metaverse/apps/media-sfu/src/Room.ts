import { Server } from "socket.io";
import { config } from "./config";
import { types as MediasoupTypes } from "mediasoup";
import { Peer } from "./Peer";

export class Room {
  private roomId: string;
  private router!: MediasoupTypes.Router;
  private peers: Map<string, any> = new Map();
  private io: Server;

  constructor(roomId: string, worker: MediasoupTypes.Worker, io: Server) {
    this.roomId = roomId;
    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    worker.createRouter({ mediaCodecs }).then((router) => {
      this.router = router;
    });
    this.peers = new Map();
    this.io = io;
  }

  addPeer(peer:Peer) {
    this.peers.set(peer.id, peer);
  }

  getProducerListForPeer() {
    let producerList: any = [];
    this.peers.forEach((peer) => {
      peer.producers.forEach((producer: any) => {
        producerList.push({
          producerId: producer.id,
        });
      });
    });
    return producerList;
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  async createWebRtcTransport(socketId: string) {
    const { listenIps, initialAvailableOutgoingBitrate, maxIncomingBitrate } =
      config.mediasoup.webRtcTransport;
    const transport = await this.router.createWebRtcTransport({
      listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    });

    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (e) {
        console.error(e);
      }
    }

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        console.log("---transport close---");
        transport.close();
      }
    });
    transport.on("@close", () => {
      console.log("---transport close---");
    });

    this.peers.get(socketId).addTransport(transport);
    return {
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      },
    };
  }
  async connectPeerTransport(
    socketId: string,
    transportId: string,
    dtlsParameters: MediasoupTypes.DtlsParameters
  ) {
    if (!this.peers.has(socketId)) {
      return;
    }
    await this.peers
      .get(socketId)
      .connectTransport(transportId, dtlsParameters);
  }
  async produce(
    socketId: string,
    producerTransportId: string,
    rtpParameters: MediasoupTypes.RtpParameters,
    kind: MediasoupTypes.MediaKind
  ) {
    return new Promise(async (resolve, reject) => {
      let producer = await this.peers
        .get(socketId)
        .createProducer(producerTransportId, rtpParameters, kind);
      resolve(producer.id);
      this.broadcastProducers(socketId, "newProducers", [
        {
          producerId: producer.id,
          socketId,
        },
      ]);
    });
  }
  async consume(
    socketId: string,
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: MediasoupTypes.RtpCapabilities
  ) {
    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      console.error("can not consume");
      return;
    }

    let { consumer, params } = await this.peers
      .get(socketId)
      .createConsumer(consumerTransportId, producerId, rtpCapabilities);

    consumer.on("producerclose", () => {
      console.log("----consumer closed---", {
        name: `${this.peers.get(socketId).name}`,
        consumer_id: `${consumer.id}`,
      });
      this.peers.get(socketId).removeConsumer(consumer.id);
      this.io.to(socketId).emit("consumerClosed", { consumerId: consumer.id });
    });
    return params;
  }
  removePeer(socketId: string) {
    this.peers.get(socketId).close();
    this.peers.delete(socketId);
  }

  closeProducer(socketId: string, producerId: string) {
    console.log("close producer", {
      name: `${this.peers.get(socketId).name}`,
      producerId: `${producerId}`,
    });
    this.peers.get(socketId).closeProducer(producerId);
  }

  broadcastProducers(socketId: string, name: string, data: any) {
    for (let otherID of Array.from(this.peers.keys()).filter(
      (id) => id !== socketId
    )) {
      this.send(otherID, name, data);
    }
  }

  send(socketId: string, name: string, data: any) {
    this.io.to(socketId).emit(name, data);
  }

  getPeers() {
    return this.peers;
  }

  toJson() {
    return {
      id: this.roomId,
      peers: JSON.stringify([...this.peers]),
    };
  }
}
