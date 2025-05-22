import { Event, phaserEvents } from "@/game/events/EventCenter";
import {
  SocketEvent,
  RoomJoinPayload,
  PlayerUpdatePayload,
  Player,
} from "@repo/common/game";
import { io, Socket } from "socket.io-client";

export class GameClient {
  socket: Socket;
  public userId!: string;

  constructor() {
    this.socket = io("http://localhost:8008", {
      autoConnect: false,
      transports: ["websocket"],
    });

    this.socket.connect();
  }

  joinRoom(payload: RoomJoinPayload) {
    this.socket.emit(
      SocketEvent.RoomJoin,
      payload,
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          this.userId = this.socket.id!;
          console.log(`🔌 Connected with ID: ${this.userId}`);
          phaserEvents.emit(Event.MY_PLAYER_READY);
        } else {
          console.error("❌ Failed to join room:", response.message);
        }
      }
    );
  }

  onPlayerJoined(callback: (player: Player) => void) {
    this.socket.on(
      SocketEvent.PlayerJoined,
      (player: Player) => {
        console.log("Player joined:", player, this.userId);
        if (player.userId !== this.userId) {
          callback(player);
        }
      }
    );
  }

  onPlayerLeft(callback: (socketId: string) => void) {
    this.socket.on(SocketEvent.PlayerLeft, (socketId: string) => {
      callback(socketId);
    });
  }

  onPlayerUpdated(callback: (payload: PlayerUpdatePayload) => void) {
    this.socket.on(
      SocketEvent.PlayerUpdated,
      (payload: PlayerUpdatePayload) => {
        callback(payload);
      }
    );
  }

  onRoomSync(callback: (players: Player[]) => void) {
    this.socket.on(SocketEvent.RoomSync, (data: { players: Player[] }) => {
      callback(data.players);
    });

  }

  updatePlayer(x: number, y: number, anim: string) {
    const payload: PlayerUpdatePayload = {
      userId: this.userId,
      position: { x, y },
      anim,
    };

    this.socket.emit(SocketEvent.PlayerUpdate, payload);
  }
}
