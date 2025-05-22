/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Socket } from "socket.io-client";
import { types as mediasoupTypes } from "mediasoup-client";
import React from "react";
import { AppData } from "mediasoup-client/types";

export enum MediaType {
  Audio = "audioType",
  Video = "videoType",
  Screen = "screenType",
}

export enum RoomEvents {
  ExitRoom = "exitRoom",
  OpenRoom = "openRoom",
  StartVideo = "startVideo",
  StopVideo = "stopVideo",
  StartAudio = "startAudio",
  StopAudio = "stopAudio",
  StartScreen = "startScreen",
  StopScreen = "stopScreen",
}

interface RoomClientConstructorParams {
  localMediaRef: React.RefObject<HTMLDivElement | null>;
  remoteMediaRef: React.RefObject<HTMLDivElement | null>;
  remoteAudioEl: React.RefObject<HTMLAudioElement | null>;
  mediasoupClient: any;
  socket: Socket;
  roomId: string;
  name: string;
  successCallback: () => void;
}

export class SFURoomClient {
  private localMediaRef: React.RefObject<HTMLDivElement | null>;
  private remoteMediaRef: React.RefObject<HTMLDivElement | null>;
  private mediasoupClient;

  private socket: Socket;
  private producerTransport!: mediasoupTypes.Transport;
  private consumerTransport!: mediasoupTypes.Transport;
  private device!: mediasoupTypes.Device;


  private consumers = new Map<string, mediasoupTypes.Consumer>();
  private producers = new Map<string, mediasoupTypes.Producer>();
  private producerLabel = new Map<MediaType, string>();

  private _isOpen = false;
  private eventListeners = new Map<RoomEvents, Array<() => void>>();

  constructor({
    localMediaRef,
    remoteMediaRef,
    mediasoupClient,
    socket,
    roomId,
    name,
    successCallback,
  }: RoomClientConstructorParams) {
    this.localMediaRef = localMediaRef;
    this.remoteMediaRef = remoteMediaRef;
    this.mediasoupClient = mediasoupClient;

    this.socket = socket;

    // Initialize event listeners
    Object.values(RoomEvents).forEach((evt) => {
      this.eventListeners.set(evt as RoomEvents, []);
    });

    this.createRoom(roomId).then(() => {
      this.join(roomId, name);
      this.initSockets();
      this._isOpen = true;
      successCallback();
    });
  }

  // Main methods from the original implementation would be added here
  // (createRoom, join, loadDevice, initTransports, etc.)
  // The conversion would involve translating the JavaScript to TypeScript
  // and adding type annotations

  private async createRoom(roomId: string) {
    this.socket.emit("createRoom", { roomId }, (response: string) => {
      if (response === "already exists") {
        console.error(`Room ${roomId} already exists`);
      } else {
        console.log(`Created room ${roomId}`);
      }
    });
  }

  private async join(roomId: string, name: string) {
    this.socket.emit("join", { roomId, name }, (res: any) => {
      if (res.error) {
        console.error(res.error);
        return;
      }
      console.log("Joined room", res);
      this.socket.emit(
        "getRouterRtpCapabilities",
        {},
        async (rtpCapabilities: mediasoupTypes.RtpCapabilities) => {
          this.device = await this.loadDevice(rtpCapabilities);
          await this.initTransports();
          this.socket.emit("getProducers");
        }
      );
    });
  }

  private async loadDevice(
    routerRtpCapabilities: mediasoupTypes.RtpCapabilities
  ) {
    try {
      const device = new this.mediasoupClient.Device();
      await device.load({ routerRtpCapabilities });
      return device;
    } catch (err) {
      // @ts-expect-error
      if (err.name === "UnsupportedError") {
        console.error("browser not supported");
      }
    }
  }

  async initTransports() {
    // Initialize producer transport
    try {
      const producerResponse: mediasoupTypes.TransportOptions<AppData> =
        await new Promise((resolve, reject) => {
          this.socket.emit(
            "createWebRtcTransport",
            {
              forceTcp: false,
              rtpCapabilities: this.device.rtpCapabilities,
            },
            (response: unknown) => {
              if (
                typeof response === "object" &&
                response !== null &&
                !("error" in response)
              ) {
                resolve(response as mediasoupTypes.TransportOptions<AppData>);
              } else {
                reject(new Error("Failed to create producer transport"));
              }
            }
          );
        });

      this.producerTransport =
        this.device.createSendTransport(producerResponse);
      console.log("Producer transport initialized:", this.producerTransport);

      // Handle producer transport events
      this.producerTransport.on(
        "connect",
        (
          { dtlsParameters }: { dtlsParameters: mediasoupTypes.DtlsParameters },
          callback: any
        ) => {
          this.socket.emit(
            "connectTransport",
            { dtlsParameters, transport_id: producerResponse.id },
            callback
          );
        }
      );

      this.producerTransport.on(
        "produce",
        async (
          {
            kind,
            rtpParameters,
          }: {
            kind: mediasoupTypes.MediaKind;
            rtpParameters: mediasoupTypes.RtpParameters;
          },
          callback: any,
          errback: any
        ) => {
          try {
            this.socket.emit(
              "produce",
              {
                producerTransportId: this.producerTransport.id,
                kind,
                rtpParameters,
              },
              (producerId: string) => {
                console.log("Producer ID:", producerId);
                callback({ id: producerId });
              }
            );
          } catch (error) {
            errback(error);
          }
        }
      );

      this.producerTransport.on("connectionstatechange", (state) => {
        switch (state) {
          case "connecting":
            console.log("Producer transport connecting...");
            break;
          case "connected":
            console.log("Producer transport connected.");
            break;
          case "failed":
            console.error("Producer transport connection failed.");
            this.producerTransport.close();
            break;
        }
      });
    } catch (error) {
      console.error("Error initializing producer transport:", error);
    }

    // Initialize consumer transport
    try {
      const consumerResponse: mediasoupTypes.TransportOptions<AppData> =
        await new Promise((resolve, reject) => {
          this.socket.emit("createWebRtcTransport", {}, (response: any) => {
            if (response.error) {
              return reject(response.error);
            }
            resolve(response);
          });
        });

      this.consumerTransport =
        this.device.createRecvTransport(consumerResponse);
      console.log("Consumer transport initialized:", this.consumerTransport);

      // Handle consumer transport events
      this.consumerTransport.on(
        "connect",
        (
          { dtlsParameters }: { dtlsParameters: mediasoupTypes.DtlsParameters },
          callback: any
        ) => {
          this.socket.emit(
            "connectTransport",
            { dtlsParameters, transport_id: consumerResponse.id },
            callback
          );
        }
      );

      this.consumerTransport.on("connectionstatechange", (state) => {
        switch (state) {
          case "connecting":
            console.log("Consumer transport connecting...");
            break;
          case "connected":
            console.log("Consumer transport connected.");
            break;
          case "failed":
            console.error("Consumer transport connection failed.");
            this.consumerTransport.close();
            break;
        }
      });
    } catch (error) {
      console.error("Error initializing consumer transport:", error);
    }
  }

  initSockets() {
    this.socket.on("consumerClosed", ({ consumerId }) => {
      console.log("Closing consumer:", consumerId);
      this.removeConsumer(consumerId);
    });

    this.socket.on("newProducers", async (data) => {
      console.log("New producers:", data);
      for (const { producerId } of data) {
        await this.consume(producerId);
      }
    });
  }

  async produce(type: MediaType, deviceId?: string) {
    let mediaConstraints = {};
    let audio = false;
    let screen = false;

    switch (type) {
      case MediaType.Audio:
        mediaConstraints = {
          audio: {
            deviceId: deviceId,
          },
          video: false,
        };
        audio = true;
        break;
      case MediaType.Video:
        mediaConstraints = {
          audio: false,
          video: {
            width: {
              min: 640,
              ideal: 1920,
            },
            height: {
              min: 400,
              ideal: 1080,
            },
            deviceId: deviceId,
            /*aspectRatio: {
                              ideal: 1.7777777778
                          }*/
          },
        };
        break;
      case MediaType.Screen:
        mediaConstraints = false;
        screen = true;
        break;
      default:
        return;
    }
    if (!this.device.canProduce("video") && !this.device.canProduce("audio")) {
      console.error("cannot produce");
      return;
    }
    if (this.producerLabel.has(type)) {
      console.error("already producing");
      return;
    }
    let stream;
    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia()
        : await navigator.mediaDevices.getUserMedia(mediaConstraints);
      const track = audio
        ? stream.getAudioTracks()[0]
        : stream.getVideoTracks()[0];
      const params: mediasoupTypes.ProducerOptions = { track };
      if (!audio && !screen) {
        params.encodings = [
          {
            rid: "r0",
            maxBitrate: 100000,
            //scaleResolutionDownBy: 10.0,
            scalabilityMode: "S1T3",
          },
          {
            rid: "r1",
            maxBitrate: 300000,
            scalabilityMode: "S1T3",
          },
          {
            rid: "r2",
            maxBitrate: 900000,
            scalabilityMode: "S1T3",
          },
        ];
        params.codecOptions = {
          videoGoogleStartBitrate: 1000,
        };
      }
      const producer = await this.producerTransport.produce(params);
      this.producers.set(producer.id, producer);
      if (!audio) {
        const videoEl = document.createElement("video");
        videoEl.srcObject = stream;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.id = `${producer.id}`;
        if (this.localMediaRef.current) {
          this.localMediaRef.current.appendChild(videoEl);
        }
      }
      producer.on("trackended", () => {
        this.closeProducer(type);
      });
      producer.on("transportclose", () => {
        this.producers.delete(producer.id);
      });
      producer.on("@close", () => {
        this.producers.delete(producer.id);
      });
      this.producerLabel.set(type, producer.id);
    } catch (error) {
      console.error("media error", error);
    }
  }

  async consume(producerId: string) {
    try {
      // Call the method to get the consumer stream for the given producer
      const {
        consumer,
        stream,
        kind,
      }: {
        consumer: mediasoupTypes.Consumer;
        stream: MediaStream;
        kind: string;
      } = await this.getConsumerStream(producerId);

      // Store the consumer so we can manage it later
      this.consumers.set(consumer.id, consumer);

      let elm;

      // Handle video stream
      if (kind === "video") {
        const videoEl = document.createElement("video");
        videoEl.srcObject = stream;
        videoEl.id = `${consumer.id}`;
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.muted = true;
        if (this.remoteMediaRef.current) {
          this.remoteMediaRef.current.appendChild(videoEl);
        }
      }

      // Handle audio stream
      if (kind === "audio") {
        elm = document.createElement("audio");
        elm.srcObject = stream; // Assign the audio stream to the element
        elm.id = `${consumer.id}`; // Set a unique ID
        elm.autoplay = true;
        document.getElementById("remote-media-container")?.appendChild(elm); // Append audio to a container
      }

      // Handle events for consumer lifecycle
      consumer.on("transportclose", () => {
        console.log(`Consumer transport closed: ${consumer.id}`);
        this.removeConsumer(consumer.id); // Remove consumer if transport closes
      });

      consumer.on("trackended", () => {
        console.log(`Track ended for consumer: ${consumer.id}`);
        this.removeConsumer(consumer.id); // Remove consumer if track ends
      });
    } catch (error) {
      console.error("Error consuming stream:", error);
    }
  }

  async getConsumerStream(producerId: string): Promise<{
    consumer: mediasoupTypes.Consumer;
    stream: MediaStream;
    kind: string;
  }> {
    try {
      const { rtpCapabilities } = this.device;
      console.log(this.consumerTransport);

      return new Promise((resolve, reject) => {
        this.socket.emit(
          "consume",
          {
            rtpCapabilities,
            consumerTransportId: this.consumerTransport.id,
            producerId,
          },
          async (data: any) => {
            try {
              if (!data) {
                return reject(
                  new Error("No data received from server for consuming stream")
                );
              }

              const { id, kind, rtpParameters } = data;

              // Consume the stream from the producer
              const consumer: mediasoupTypes.Consumer =
                await this.consumerTransport.consume({
                  id,
                  producerId,
                  kind,
                  rtpParameters,
                });

              // Create a new MediaStream and add the consumer's track
              const stream = new MediaStream();
              stream.addTrack(consumer.track);

              console.log("Consumer stream:", { kind, stream, consumer });

              // Return the consumer, stream, and media type
              resolve({
                consumer,
                stream,
                kind,
              });
            } catch (err) {
              console.error("Error consuming stream:", err);
              reject(err);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error getting consumer stream:", error);
      throw error;
    }
  }
  closeProducer(type: MediaType) {
    if (!this.producerLabel.has(type)) {
      console.log("There is no producer for this type " + type);
      return;
    }

    const producerId = this.producerLabel.get(type);
    console.log(producerId);
    if (!producerId) {
      console.error(`Producer ID for type ${type} not found`);
      return;
    }
    this.socket.emit("producerClosed", producerId);
    const producer = this.producers.get(producerId);
    if (producer) {
      producer.close();
    } else {
      console.error(`Producer with id ${producerId} not found`);
    }

    if (type !== MediaType.Audio) {
      const videoEl = document.getElementById(producerId) as HTMLVideoElement;
      const mediaStream = videoEl?.srcObject as MediaStream | null;
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        this.localMediaRef.current?.removeChild(videoEl);
      }
    }
    this.producers.get(producerId)?.close();
    this.producers.delete(producerId);
    this.producerLabel.delete(type);

    switch (type) {
      case MediaType.Audio:
        this.event(RoomEvents.StopAudio);
        break;
      case MediaType.Video:
        this.event(RoomEvents.StopVideo);
        break;
      case MediaType.Screen:
        this.event(RoomEvents.StopScreen);
        break;
      default:
        return;
    }
  }

  pauseProducer(type: MediaType) {
    if (!this.producerLabel.has(type)) {
      console.log("There is no producer for this type " + type);
      return;
    }

    const producer_id = this.producerLabel.get(type);
    const producer = this.producers.get(producer_id!);
    if (producer) {
      producer.pause();
    } else {
      console.error(`Producer with id ${producer_id} not found`);
    }
  }

  resumeProducer(type: MediaType) {
    if (!this.producerLabel.has(type)) {
      console.log("There is no producer for this type " + type);
      return;
    }

    const producer_id = this.producerLabel.get(type);
    const producer = this.producers.get(producer_id!);
    if (producer) {
      producer.resume();
    } else {
      console.error(`Producer with id ${producer_id} not found`);
    }
  }

  removeConsumer(consumer_id: string) {
    console.log("Remove consumer", consumer_id);
    const videoEl = document.getElementById(consumer_id) as HTMLVideoElement;
    const mediaStream = videoEl?.srcObject as MediaStream | null;
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      this.remoteMediaRef.current?.removeChild(videoEl);
    }

    this.consumers.delete(consumer_id);
  }

  exit(offline = false) {
    const clean = () => {
      this._isOpen = false;
      this.consumerTransport.close();
      this.producerTransport.close();
      this.socket.off("disconnect");
      this.socket.off("newProducers");
      this.socket.off("consumerClosed");
    };

    if (!offline) {
      this.socket.emit("exitRoom", {}, (response: any) => {
        console.log(response);
      });
    } else {
      clean();
    }

    this.event(RoomEvents.ExitRoom);
  }
  async roomInfo() {
    const info = await this.socket.emit("getMyRoomInfo");
    return info;
  }

  static get mediaType() {
    return MediaType;
  }

  event(evt: RoomEvents) {
    if (this.eventListeners.has(evt)) {
      this.eventListeners.get(evt)?.forEach((callback) => callback());
    }
  }

  on(evt: RoomEvents, callback: () => void): void {
    this.eventListeners.get(evt)?.push(callback);
  }

  //////// GETTERS ////////

  isOpen() {
    return this._isOpen;
  }

  static get EVENTS() {
    return RoomEvents;
  }
}
