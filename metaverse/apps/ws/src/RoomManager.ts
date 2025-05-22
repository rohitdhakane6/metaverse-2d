import type { User } from "./User";
import { SocketEvent, Player } from "@repo/common/game";

export class RoomManager {
  rooms: Map<string, User[]> = new Map();
  private static instance: RoomManager;

  private constructor() {}

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public addUser(roomId: string, user: User): void {
    const users = this.rooms.get(roomId) || [];
    this.rooms.set(roomId, [...users, user]);
  }

  public removeUser(user: User, roomId: string): void {
    const users = this.rooms.get(roomId);
    if (!users) return;

    this.rooms.set(
      roomId,
      users.filter((u) => u.userId !== user.userId)
    );
  }

  public broadcastToRoom(
    event: SocketEvent,
    payload: Player | string,
    sender: User
  ): void {
    const users = this.rooms.get(sender.roomId ?? "");
    console.log("Broadcasting to room", sender.roomId, users);
    if (!users) return;

    users.forEach((user) => {
      if (user.userId !== sender.userId) {
        user.send(event, payload);
      }
    });
  }
}
