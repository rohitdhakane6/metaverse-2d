import { Server } from "socket.io";
import * as mediasoup from "mediasoup";
import express from "express";
import { createServer } from "node:http";

import { config } from "./config";
import { Room } from "./Room";
import { Peer } from "./Peer";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(config.listenPort, () => {
  console.log("server running at http://localhost:3016");
});

// all mediasoup workers
let workers: mediasoup.types.Worker[] = [];
let nextMediasoupWorkerIdx: number = 0;

/**
 * roomList
 * {
 *  room_id: Room {
 *      id:
 *      router:
 *      peers: {
 *          id:,
 *          name:,
 *          master: [boolean],
 *          transports: [Map],
 *          producers: [Map],
 *          consumers: [Map],
 *          rtpCapabilities:
 *      }
 *  }
 * }
 */
let roomList: Map<string, Room> = new Map();

(async () => {
  await createWorkers();
})();

async function createWorkers() {
  let { numWorkers } = config.mediasoup;

  for (let i = 0; i < numWorkers; i++) {
    let worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker
        .logLevel as mediasoup.types.WorkerLogLevel,
      logTags: config.mediasoup.worker
        .logTags as mediasoup.types.WorkerLogTag[],
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    });

    worker.on("died", () => {
      console.error(
        "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
        worker.pid
      );
      setTimeout(() => process.exit(1), 2000);
    });
    workers.push(worker);

    // log worker resource usage
    /*setInterval(async () => {
            const usage = await worker.getResourceUsage();

            console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
        }, 120000);*/
  }
}

io.on("connection", (socket) => {
  console.log("New connection", { id: socket.id });
  socket.on("createRoom", async ({ roomId }, callback) => {
    if (roomList.has(roomId)) {
      callback("already exists");
    } else {
      console.log("Created room", { room_id: roomId });
      let worker = getMediasoupWorker();
      roomList.set(roomId, new Room(roomId, worker, io));
      callback(roomId);
    }
  });
  socket.on("join", async ({ roomId, name }, callback) => {
    if (!roomId) {
      callback({
        error: "roomId is required",
      });
      return;
    }
    if (!name) {
      callback({
        error: "name is required",
      });
      return;
    }
    if (!roomList.has(roomId)) {
      callback({
        error: "room does not exist",
      });
      return;
    }
    const room = roomList.get(roomId);
    if (room) {
      room.addPeer(new Peer(socket.id, name));
    } else {
      callback({ error: "room does not exist" });
      return;
    }
    socket.data.roomId = roomId;
    callback(room.toJson());
  });

  socket.on("getProducers", () => {
    if (!roomList.has(socket.data.roomId)) return;
    console.log("Get producers", {
      name: `${roomList.get(socket.data.roomId)?.getPeers().get(socket.id)?.name}`,
    });

    // send all the current producer to newly joined member
    let producerList = roomList
      .get(socket.data.roomId)
      ?.getProducerListForPeer();

    if (producerList && producerList.length > 0) {
      socket.emit("newProducers", producerList);
    }
  });

  socket.on("getRouterRtpCapabilities", (_, callback) => {
    const room = roomList.get(socket.data.roomId);

    if (!room) {
      callback({
        error: "Room not found",
      });
      return;
    }
    console.log("Get RouterRtpCapabilities", {
      name: `${room.getPeers().get(socket.id)?.name}`,
    });

    try {
      callback(room.getRtpCapabilities());
    } catch (e) {
      callback({
        error: e instanceof Error ? e.message : "Unknown error",
      });
    }
  });

  socket.on("createWebRtcTransport", async (_, callback) => {
    const room = roomList.get(socket.data.roomId);
    if (!room) {
      callback({
        error: "Room not found",
      });
      return;
    }
    console.log("Create webrtc transport", {
      name: `${room.getPeers().get(socket.id).name}`,
    });

    try {
      const { params } = await room.createWebRtcTransport(socket.id);
      callback(params);
    } catch (err) {
      console.error(err);
      callback({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });
  socket.on(
    "connectTransport",
    async ({ transport_id, dtlsParameters }, callback) => {
      if (!roomList.has(socket.data.roomId)) return;
      const room = roomList.get(socket.data.roomId);
      if (!room) {
        callback({
          error: "Room not found",
        });
        return;
      }
      console.log("Connect transport", {
        name: `${room.getPeers().get(socket.id).name}`,
      });

      await room.connectPeerTransport(socket.id, transport_id, dtlsParameters);

      callback("success");
    }
  );

  socket.on(
    "produce",
    async ({ kind, rtpParameters, producerTransportId }, callback) => {
      if (!roomList.has(socket.data.roomId)) {
        return callback({ error: "not is a room" });
      }
      const room = roomList.get(socket.data.roomId);
      if (!room) {
        callback({
          error: "Room not found",
        });
        return;
      }

      let producerId = await room.produce(
        socket.id,
        producerTransportId,
        rtpParameters,
        kind
      );

      console.log("Produce", {
        type: `${kind}`,
        name: `${room.getPeers().get(socket.id).name}`,
        id: `${producerId}`,
      });

      callback(producerId);
    }
  );

  socket.on(
    "consume",
    async ({ consumerTransportId, producerId, rtpCapabilities }, callback) => {
      //TODO null handling
      const room = roomList.get(socket.data.roomId);
      if (!room) {
        callback({
          error: "Room not found",
        });
        return;
      }
      let params = await room.consume(
        socket.id,
        consumerTransportId,
        producerId,
        rtpCapabilities
      );

      console.log("Consuming", {
        name: `${room && room.getPeers().get(socket.id).name}`,
        producer_id: `${producerId}`,
        consumer_id: `${params.id}`,
      });

      callback(params);
    }
  );

  socket.on("resume", async (data, callback) => {
    // await consumer.resume();
    callback();
  });

  socket.on("getMyRoomInfo", (_, callback) => {
    const room = roomList.get(socket.data.roomId);
    if (!room) {
      callback({
        error: "Room not found",
      });
      return;
    }
    callback(room.toJson());
  });

  socket.on("disconnect", () => {
    if (!socket.data.roomId) return;
    const room = roomList.get(socket.data.roomId);
    if (!room) {
      return;
    }
    console.log("Disconnect", {
      name: `${room && room.getPeers().get(socket.id).name}`,
    });

    room.removePeer(socket.id);
  });

  socket.on("producerClosed", ( producerId ) => {
    const room = roomList.get(socket.data.roomId);
    if (!room) {
      return;
    }
    console.log("Producer close", {
      name: `${room && room.getPeers().get(socket.id).name}`,
    });

    console.log(producerId);

    room.closeProducer(socket.id, producerId);
  });

  socket.on("exitRoom", async (_, callback) => {
    const room = roomList.get(socket.data.roomId);
    if (!room) {
      callback({
        error: "Room not found",
      });
      return;
    }
    console.log("Exit room", {
      name: `${room && room.getPeers().get(socket.id).name}`,
    });

    if (!roomList.has(socket.data.roomId)) {
      callback({
        error: "not currently in a room",
      });
      return;
    }
    // close transports
    await room.removePeer(socket.id);
    if (room.getPeers().size === 0) {
      roomList.delete(socket.data.roomId);
    }

    socket.data.roomId = null;

    callback("successfully exited room");
  });
});

/**
 * Get next mediasoup Worker.
 */
function getMediasoupWorker() {
  const worker = workers[nextMediasoupWorkerIdx];

  nextMediasoupWorkerIdx = ++nextMediasoupWorkerIdx % workers.length;

  return worker;
}
