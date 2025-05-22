import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";
import db from "@repo/db";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import {
  SocketEvent,
  RoomJoinPayload,
  PlayerUpdatePayload,
  Player,
} from "@repo/common/game";

export class User {
  public userId!: string;
  public userName!: string;
  public roomId?: string;
  public position!: { x: number; y: number };
  public avatar!: string;
  public anim!: string;
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.initHandlers();
  }

  private initHandlers() {
    this.socket.on(SocketEvent.RoomJoin, (payload: RoomJoinPayload) => {
      this.joinRoom(payload);
    });

    this.socket.on(SocketEvent.PlayerUpdate, (payload: PlayerUpdatePayload) => {
      this.handlePlayerUpdate(payload);
    });
  }

  private async joinRoom(payload: RoomJoinPayload) {
    try {
      const { roomId, authToken, user } = payload;

      const decoded = jwt.verify(authToken, JWT_PASSWORD) as JwtPayload;
      this.userId = decoded.userId;
      this.userName = user.username;
      this.position = user.position;
      this.avatar = user.avatar;
      this.anim = user.anim;
      this.roomId = roomId;

      if (!this.userId) {
        throw new Error("Invalid User credentials");
      }

      const room = await db.space.findUnique({ where: { id: roomId } });
      if (!room) {
        throw new Error("Game space not found");
      }

      RoomManager.getInstance().addUser(roomId, this);

      // Send current room state to new player
      this.send(SocketEvent.RoomSync, {
        players: this.getOtherPlayers(),
      });

      // Broadcast new player to others
      RoomManager.getInstance().broadcastToRoom(
        SocketEvent.PlayerJoined,
        this.serialize(),
        this
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  private handlePlayerUpdate(payload: PlayerUpdatePayload) {
    this.position = payload.position;
    this.anim = payload.anim;

    RoomManager.getInstance().broadcastToRoom(
      SocketEvent.PlayerUpdated,
      this.serialize(),
      this
    );
  }

  public handleDisconnect() {
    if (this.roomId) {
      const roomManager = RoomManager.getInstance();
      roomManager.removeUser(this, this.roomId);
      roomManager.broadcastToRoom(SocketEvent.PlayerLeft, this.userId, this);
    }

    this.socket.disconnect();
  }

  public send(event: SocketEvent, payload: any) {
    this.socket.emit(event, payload);
  }

  private getOtherPlayers(): Player[] {
    const room = RoomManager.getInstance().rooms.get(this.roomId ?? "");
    if (!room) return [];

    return room
      .filter((u) => u.userId !== this.userId)
      .map((u) => u.serialize());
  }

  public serialize(): Player {
    return {
      userId: this.userId,
      username: this.userName,
      avatar: this.avatar,
      position: this.position,
      anim: this.anim,
    };
  }
}
