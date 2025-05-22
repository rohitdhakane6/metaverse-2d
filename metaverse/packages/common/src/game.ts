export enum SocketEvent {
  RoomJoin = "room:join", // client → server
  RoomSync = "room:sync", // server → new client
  PlayerJoined = "player:joined", // server → all others
  PlayerLeft = "player:left", // server → all others
  PlayerUpdate = "player:update", // client → server
  PlayerUpdated = "player:updated", // server → all others
}

export interface RoomJoinPayload {
  roomId: string;
  authToken: string;
  user: Player;
}

export interface PlayerUpdatePayload {
  userId: string;
  position: { x: number; y: number };
  anim: string;
}

export interface Player {
  userId?: string;
  username: string;
  position: { x: number; y: number };
  avatar: string;
  anim: string;
}
