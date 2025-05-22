import Phaser from "phaser";
import { GameClient } from "@/game/services/Network";

export default class Bootstrap extends Phaser.Scene {
  private preloadComplete = false;
  public client!: GameClient;

  constructor() {
    super("bootstrap");
  }

  init() {
    this.client = new GameClient();
  }

  preload() {
    // Background
    this.load.atlas(
      "cloud_day",
      "/assets/background/cloud_day.png",
      "/assets/background/cloud_day.json"
    );
    this.load.image("backdrop_day", "/assets/background/backdrop_day.png");
    this.load.atlas(
      "cloud_night",
      "/assets/background/cloud_night.png",
      "/assets/background/cloud_night.json"
    );
    this.load.image("backdrop_night", "/assets/background/backdrop_night.png");
    this.load.image("sun_moon", "/assets/background/sun_moon.png");

    // Map & tiles
    this.load.tilemapTiledJSON("tilemap", "/assets/map/map.json");
    this.load.spritesheet("tiles_wall", "/assets/map/FloorAndGround.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Items
    this.load.spritesheet("chairs", "/assets/items/chair.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet("computers", "/assets/items/computer.png", {
      frameWidth: 96,
      frameHeight: 64,
    });
    this.load.spritesheet("whiteboards", "/assets/items/whiteboard.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "vendingmachines",
      "/assets/items/vendingmachine.png",
      { frameWidth: 48, frameHeight: 72 }
    );

    // Tilesets
    this.load.spritesheet(
      "office",
      "/assets/tileset/Modern_Office_Black_Shadow.png",
      { frameWidth: 32, frameHeight: 32 }
    );
    this.load.spritesheet("basement", "/assets/tileset/Basement.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("generic", "/assets/tileset/Generic.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Characters
    this.load.spritesheet("adam", "/assets/character/adam.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("ash", "/assets/character/ash.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("lucy", "/assets/character/lucy.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("nancy", "/assets/character/nancy.png", {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.on("complete", () => {
      this.preloadComplete = true;
      this.launchBackground("DAY");
      this.events.emit("loadingComplete");
      console.log("Preload complete");
    });
  }

  private launchBackground(backgroundMode: "DAY" | "NIGHT") {
    this.scene.launch("background", { backgroundMode });
  }

  launchGame(userName: string, avatar: string) {
    if (this.preloadComplete) {
      this.scene.launch("game", {
        client: this.client,
        userName,
        avatar,
      });
    }
  }

  changeBackgroundMode(backgroundMode: "DAY" | "NIGHT") {
    this.scene.stop("background");
    this.launchBackground(backgroundMode);
  }
}
