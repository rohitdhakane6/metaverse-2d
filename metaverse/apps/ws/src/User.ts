import type { WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import type { OutgoingMessage } from "./types";
import db from "@repo/db";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
export class User {
  public userId?: string;
  private spaceId?: string;
  private height?: number;
  private width?: number;
  private x: number;
  private y: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        switch (parsedData.type) {
          case "join":
            const token = parsedData.payload.token;
            const spaceId = parsedData.payload.spaceId;
            if (!token || !spaceId) {
              console.log("spaceId or token not provided");
              this.ws.close();
              return;
            }
            this.join(spaceId, token);
            break;
          case "move":
            const moveX = parsedData.payload.x;
            const moveY = parsedData.payload.y;
            this.move(moveX, moveY);
            break;
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  async join(spaceId: string, token: string) {
    const userId = (jwt.verify(token, JWT_PASSWORD) as JwtPayload).userId;
    if (!userId) {
      this.ws.close();
      return;
    }
    this.userId = userId;
    const space = await db.space.findFirst({
      where: {
        id: spaceId,
      },
    });
    if (!space) {
      this.ws.close();
      return;
    }
    this.spaceId = space.id;
    this.height = space.height;
    this.width = space.width;

    RoomManager.getInstance().addUser(spaceId, this);

    this.x = Math.floor(Math.random() * space?.width);
    this.y = Math.floor(Math.random() * space?.height);
    this.send({
      type: "space-joined",
      payload: {
        spawn: {
          x: this.x,
          y: this.y,
        },
        users:
          RoomManager.getInstance()
            .rooms.get(spaceId)
            ?.filter((x) => x.userId !== this.userId)
            ?.map((u) => ({ userId: u.userId, x: u.x, y: u.y })) ?? [],
      },
    });
    RoomManager.getInstance().broadcast(
      {
        type: "user-joined",
        payload: {
          userId: this.userId,
          x: this.x,
          y: this.y,
        },
      },
      this,
      this.spaceId ?? ""
    );
  }

  async move(moveX: number, moveY: number) {
    const xDisplacement = Math.abs(this.x - moveX);
    const yDisplacement = Math.abs(this.y - moveY);

    const isWithinBounds =
      moveX > 0 &&
      moveY > 0 &&
      moveX < (this.width ?? 0) &&
      moveY < (this.height ?? 0);
    const isValidHorizontalMove = xDisplacement === 1 && yDisplacement === 0;
    const isValidVerticalMove = xDisplacement === 0 && yDisplacement === 1;

    const isValidMove =
      isWithinBounds && (isValidHorizontalMove || isValidVerticalMove);

    if (isValidMove) {
      this.x = moveX;
      this.y = moveY;

      this.send({
        type: "move",
        payload: {
          x: this.x,
          y: this.y,
        },
      });

      RoomManager.getInstance().broadcast(
        {
          type: "movement",
          payload: {
            userId: this.userId,
            x: this.x,
            y: this.y,
          },
        },
        this,
        this.spaceId ?? ""
      );
    } else {
      // TODO: Fix issue with movement rejection being sent every time
      this.send({
        type: "movement-rejected",
        payload: {
          x: this.x,
          y: this.y,
        },
      });
    }
  }

  destroy() {
    RoomManager.getInstance().broadcast(
      {
        type: "user-left",
        payload: {
          userId: this.userId,
        },
      },
      this,
      this.spaceId ?? ""
    );
    RoomManager.getInstance().removeUser(this, this.spaceId ?? "");
  }

  send(payload: OutgoingMessage) {
    this.ws.send(JSON.stringify(payload));
  }
}
