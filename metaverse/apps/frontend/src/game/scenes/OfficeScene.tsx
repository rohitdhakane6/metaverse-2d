import { Scene } from "phaser";

export class OfficeScene extends Scene {
  constructor() {
    super({ key: "OfficeScene" });
  }

  preload() {
    this.load.image("stone_house_interior", "/stone_house_interior.png");
    this.load.tilemapTiledJSON("map", "/map.json");
  }

  async create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset1 = map.addTilesetImage(
      "stone_house_interior",
      "stone_house_interior"
    );

    if (tileset1) {
      map.createLayer("background", [tileset1], 0, 0);
    }
  }

  update() {}
}
