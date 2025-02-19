// packages/shared-types/index.ts
export interface SpaceData {
    id: string;
    width: number;
    height: number;
  }
  
  export interface UserData {
    id: string;
    position: Position;
  }
  
  export interface Position {
    x: number;
    y: number;
  }
  
  // Message Types
  export interface MessageTypes {
    // Server -> Client Messages
    "space-joined": {
      spawn: Position;
      users: UserData[];
    };
    "user-joined": {
      userId: string;
      x: number;
      y: number;
    };
    movement: {
      userId: string;
      x: number;
      y: number;
    };
    "movement-rejected": Position;
    "user-left": {
      userId: string;
    };
    
    // Client -> Server Messages
    playerJoin: {
      spaceId: string;
      token: string;
    };
    playerUpdate: Position;
  }
  
  export type MessageType = keyof MessageTypes;
  
  export interface Message<T extends MessageType> {
    type: T;
    payload: MessageTypes[T];
  }
  
  export type ServerMessage = Message<Exclude<MessageType, "playerJoin" | "playerUpdate">>;
  export type ClientMessage = Message<"playerJoin" | "playerUpdate">;
  
  // Type guards
  export function isServerMessage(message: Message<MessageType>): message is ServerMessage {
    return !["playerJoin", "playerUpdate"].includes(message.type);
  }
  
  export function isClientMessage(message: Message<MessageType>): message is ClientMessage {
    return ["playerJoin", "playerUpdate"].includes(message.type);
  }