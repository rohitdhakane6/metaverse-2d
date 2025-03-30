import { types as MediasoupTypes } from "mediasoup";

export class Peer {
  public id: string;
  public name: string;
  private transports: Map<string, MediasoupTypes.Transport>;
  private consumers: Map<string, MediasoupTypes.Consumer>;
  private producers: Map<string, MediasoupTypes.Producer>;

  constructor(socketId: string, name: string) {
    this.id = socketId;
    this.name = name;
    this.transports = new Map();
    this.consumers = new Map();
    this.producers = new Map();
  }

  addTransport(transport: MediasoupTypes.Transport) {
    this.transports.set(transport.id, transport);
  }

  async connectTransport(
    transportId: string,
    dtlsParameters: MediasoupTypes.DtlsParameters
  ) {
    if (!this.transports.has(transportId)) {
      return;
    }
    const transport = this.transports.get(transportId);
    if (!transport) {
      throw new Error(`Transport with id ${transportId} not found`);
    }
    await transport.connect({ dtlsParameters });
  }

  async createProducer(
    producerTransportId: string,
    rtpParameters: MediasoupTypes.RtpParameters,
    kind: MediasoupTypes.MediaKind
  ) {
    //TODO:  handle null errors
    const transport = this.transports.get(producerTransportId);
    if (!transport) {
      throw new Error(`Transport with id ${producerTransportId} not found`);
    }
    let producer = await transport.produce({
      kind,
      rtpParameters,
    });

    this.producers.set(producer.id, producer);

    producer.on("transportclose", () => {
      console.log("Producer transport close", {
        name: `${this.name}`,
        consumer_id: `${producer.id}`,
      });
      producer.close();
      this.producers.delete(producer.id);
    });

    return producer;
  }

  async createConsumer(
    consumerTransportId: string,
    producerId: string,
    rtpCapabilities: MediasoupTypes.RtpCapabilities
  ) {
    let consumerTransport = this.transports.get(consumerTransportId);
    if (!consumerTransport) {
      throw new Error(`Transport with id ${consumerTransportId} not found`);
    }

    let consumer = null;
    try {
      consumer = await consumerTransport.consume({
        producerId,
        rtpCapabilities,
        paused: false, //producer.kind === 'video',
      });
    } catch (error) {
      console.error("Consume failed", error);
      return;
    }

    if (consumer.type === "simulcast") {
      await consumer.setPreferredLayers({
        spatialLayer: 2,
        temporalLayer: 2,
      });
    }

    this.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      console.log("Consumer transport close", {
        name: `${this.name}`,
        consumer_id: `${consumer.id}`,
      });
      this.consumers.delete(consumer.id);
    });

    return {
      consumer,
      params: {
        producerId,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused,
      },
    };
  }

  closeProducer(producerId: string) {
    try {
      const producer = this.producers.get(producerId);
      if (producer) {
        producer.close();
        5;
      }
    } catch (e) {
      console.warn(e);
    }

    this.producers.delete(producerId);
  }

  getProducer(producerId: string) {
    return this.producers.get(producerId);
  }
  close() {
    this.transports.forEach((transport) => transport.close());
  }
  removeConsumer(consumerId: string) {
    this.consumers.delete(consumerId);
  }
}
