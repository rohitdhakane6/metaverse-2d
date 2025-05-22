import { AUTO } from "phaser";
import type { Types } from "phaser";
import Bootstrap from "@/game/scenes/Bootstrap";
import Background from "@/game/scenes/Background";
import Game from "@/game/scenes/Game";

export const GameConfig: Types.Core.GameConfig = {
  type: AUTO,
  parent: "game-container",
  backgroundColor: "#93cbee",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  autoFocus: true,
  scene: [Bootstrap, Background, Game],
};
