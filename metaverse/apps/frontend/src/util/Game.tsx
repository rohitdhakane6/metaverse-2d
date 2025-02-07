import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 } } },
      scene: [GameScene],
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, []);

  return <div ref={gameRef} className="w-full h-screen" />;
}

// 🎮 Phaser Scene
class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private zone!: Phaser.GameObjects.Zone;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("tiles", "/assets/tileset.png"); // 🏗 Load tileset
    this.load.tilemapTiledJSON("map", "/assets/map.json"); // 📜 Load map
    this.load.spritesheet("player", "/assets/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // 🏗 Load map
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("tileset", "tiles");
    if (tileset) {
      map.createLayer("Ground", tileset);
    } else {
      console.error("Failed to load tileset");
    }
    
    // 🏃‍♂️ Create player
    this.player = this.physics.add.sprite(100, 100, "player");
    this.player.setCollideWorldBounds(true);
    
    // 🎮 Create controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // 🔵 Interaction Zone
    this.zone = this.add.zone(400, 300, 50, 50);
    this.physics.add.overlap(this.player, this.zone, this.onEnterZone, undefined, this);
  }

  update() {
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up?.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down?.isDown) {
      this.player.setVelocityY(160);
    } else {
      this.player.setVelocityY(0);
    }
  }

  onEnterZone() {
    console.log("Entered Interaction Zone!");
  }
}
