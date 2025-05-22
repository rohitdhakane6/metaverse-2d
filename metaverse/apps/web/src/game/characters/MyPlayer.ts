import Phaser from "phaser";
import PlayerSelector from "./PlayerSelector";
import { PlayerBehavior } from "../types/PlayerBehavior";
import { sittingShiftData } from "./Player";
import Player from "./Player";
import Chair from "../items/Chair";
import Computer from "../items/Computer";
import Whiteboard from "../items/Whiteboard";

import { phaserEvents, Event } from "../events/EventCenter";
import { ItemType } from "../types/Items";
import { NavKeys } from "../types/KeyboardState";
import { GameClient } from "@/game/services/Network";

export default class MyPlayer extends Player {
  private playContainerBody: Phaser.Physics.Arcade.Body;
  private chairOnSit?: Chair;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame);

    this.playContainerBody = this.playerContainer
      .body as Phaser.Physics.Arcade.Body;
  }

  setPlayerName(name: string) {
    if (this.playerName) {
      this.playerName.setText(name);
    }
  }

  setPlayerTexture(texture: string) {
    this.playerTexture = texture;
    this.anims.play(`${this.playerTexture}_idle_down`, true);
  }

  update(
    playerSelector: PlayerSelector,
    cursors: NavKeys,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key,
    client: GameClient
  ) {
    if (!cursors) return;

    const item = playerSelector.selectedItem;

    // R key interaction
    if (Phaser.Input.Keyboard.JustDown(keyR)) {
      console.log("R key pressed. Current item type:", item?.itemType);

      switch (item?.itemType) {
        case ItemType.COMPUTER:
          (item as Computer).openDialog();
          break;
        case ItemType.WHITEBOARD:
          console.log("Opening whiteboard dialog...");
          (item as Whiteboard).openDialog();
          break;
        case ItemType.VENDINGMACHINE:
          // Reserved for future use
          break;
      }
    }

    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE: {
        if (
          Phaser.Input.Keyboard.JustDown(keyE) &&
          item?.itemType === ItemType.CHAIR
        ) {
          const chairItem = item as Chair;

          // Validate direction
          const direction = chairItem.itemDirection;
          if (!direction) {
            console.warn("Chair direction is not set.");
            return;
          }
          if (
            !["up", "down", "left", "right"].includes(direction) ||
            !sittingShiftData[direction]
          ) {
            console.warn("Invalid chair direction:", direction);
            return;
          }

          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              try {
                const [shiftX, shiftY, shiftDepth] =
                  sittingShiftData[direction];

                // Stop movement
                this.setVelocity(0, 0);
                this.playContainerBody.setVelocity(0, 0);

                // Set position and depth
                this.setPosition(
                  chairItem.x + shiftX,
                  chairItem.y + shiftY
                ).setDepth(chairItem.depth + shiftDepth);

                // Set container position (if needed)
                this.playerContainer.setPosition(
                  chairItem.x + shiftX,
                  chairItem.y + shiftY - 30 // slight Y offset
                );

                // Play sitting animation
                this.play(`${this.playerTexture}_sit_${direction}`, true);

                // Clear and update selector
                playerSelector.selectedItem = undefined;
                if (direction === "up") {
                  playerSelector.setPosition(this.x, this.y - this.height);
                } else {
                  playerSelector.setPosition(0, 0); // Or hide it
                }

                // Update server
                client.updatePlayer(
                  this.x,
                  this.y,
                  this.anims.currentAnim?.key ?? ""
                );
              } catch (err) {
                console.error("Error sitting on chair:", err);
              }
            },
            loop: false,
          });

          // Update dialog box and player state
          chairItem.clearDialogBox();
          chairItem.setDialogBox("Press E to leave");
          this.chairOnSit = chairItem;
          this.playerBehavior = PlayerBehavior.SITTING;

          return;
        }

        // Movement logic
        const speed = 200;
        let velocityX = 0;
        let velocityY = 0;

        if (cursors.left?.isDown || cursors.A?.isDown) velocityX -= speed;
        if (cursors.right?.isDown || cursors.D?.isDown) velocityX += speed;
        if (cursors.up?.isDown || cursors.W?.isDown) {
          velocityY -= speed;
          this.setDepth(this.y);
        }
        if (cursors.down?.isDown || cursors.S?.isDown) {
          velocityY += speed;
          this.setDepth(this.y);
        }

        this.setVelocity(velocityX, velocityY);
        this.body?.velocity.setLength(speed);
        this.playContainerBody.setVelocity(velocityX, velocityY);
        this.playContainerBody.velocity.setLength(speed);

        if (velocityX !== 0 || velocityY !== 0) {
          const dir =
            velocityX > 0
              ? "right"
              : velocityX < 0
                ? "left"
                : velocityY > 0
                  ? "down"
                  : "up";

          client.updatePlayer(
            this.x,
            this.y,
            `${this.playerTexture}_run_${dir}`
          );

          this.play(`${this.playerTexture}_run_${dir}`, true);
        } else {
          const currentKey = this.anims.currentAnim?.key;
          if (!currentKey) break;

          const parts = currentKey.split("_");
          if (parts.length >= 3) {
            parts[1] = "idle";
            const newAnim = parts.join("_");
            if (currentKey !== newAnim) {
              client.updatePlayer(this.x, this.y, newAnim);
              this.play(newAnim, true);
            }
          }
        }
        break;
      }

      case PlayerBehavior.SITTING: {
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
          const currentKey = this.anims.currentAnim?.key;
          if (!currentKey) break;

          const parts = currentKey.split("_");
          if (parts.length >= 3) {
            parts[1] = "idle";
            this.play(parts.join("_"), true);
          }

          this.playerBehavior = PlayerBehavior.IDLE;
          this.chairOnSit?.clearDialogBox();
          playerSelector.setPosition(this.x, this.y);
          playerSelector.update(this, cursors);
          client.updatePlayer(
            this.x,
            this.y,
            this.anims.currentAnim?.key ?? ""
          );
        }
        break;
      }
    }
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(
        x: number,
        y: number,
        texture: string,
        id: string,
        frame?: string | number
      ): MyPlayer;
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "myPlayer",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);
    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    const collisionScale = [0.5, 0.2];
    sprite.body
      ?.setSize(
        sprite.width * collisionScale[0],
        sprite.height * collisionScale[1]
      )
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      );

    return sprite;
  }
);
