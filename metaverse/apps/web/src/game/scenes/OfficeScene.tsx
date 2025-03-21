import { Scene } from "phaser";

export class OfficeScene extends Scene {
  private character!: Phaser.GameObjects.Arc; // Define the character as a green dot
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; // Add cursors for keyboard input
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private users: Map<string, { x: number; y: number }> = new Map();
  private userCircles: Map<string, Phaser.GameObjects.Arc> = new Map();
  private ws!: WebSocket;

  constructor() {
    super({ key: "OfficeScene" });
  }

  preload() {
    this.load.image("stone_house_interior", "/stone_house_interior.png");
    this.load.tilemapTiledJSON("map", "/map.json");
  }

  async create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset1 = map.addTilesetImage("stone_house_interior");

    if (tileset1) {
      map.createLayer("background", [tileset1], 0, 0);
    }

    // Create the character as a green dot
    this.character = this.add.circle(100, 100, 10, 0x00ff00);

    // Enable physics for the character
    this.physics.add.existing(this.character);
    const characterBody = this.character.body as Phaser.Physics.Arcade.Body;
    characterBody.setCollideWorldBounds(true); // Prevent character from moving off screen

    // Create cursors to handle arrow key input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    } else {
      console.error("Keyboard input is not available.");
    }

    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
      }) as {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
      };
    } else {
      console.error("Keyboard input is not available.");
    }

    this.ws = new WebSocket("ws://localhost:3001");
    this.ws.onopen = () => {
      console.log("Connected to server");
      this.ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            token: localStorage.getItem("token"),
            spaceId: localStorage.getItem("spaceId"),
          },
        })
      );
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received data: ", data);
      switch (data.type) {
        case "space-joined":
          this.character.x = data.payload.spawn.x;
          this.character.y = data.payload.spawn.y;
          data.payload.users.forEach(
            (user: { userId: string; x: number; y: number }) => {
              this.addUser(user.userId, user.x, user.y);
            }
          );
          break;
        case "move":
          this.character.x = data.payload.x;
          this.character.y = data.payload.y;
          break;
        case "movement":
          this.updateUserPosition(
            data.payload.userId,
            data.payload.x,
            data.payload.y
          );
          break;
        case "user-joined":
          this.addUser(data.payload.userId, data.payload.x, data.payload.y);
          break;
        case "user-left":
          this.removeUser(data.payload.userId);
          break;
        case "movement-rejected":
          this.character.x = data.payload.x;
          this.character.y = data.payload.y;
          break;
      }
    };
    this.ws.onerror = (error) => {
      console.error("Error: ", error);
    };
    this.ws.onclose = () => {
      console.log("Disconnected from server");
    };
  }

  addUser(userId: string, x: number, y: number) {
    const userCircle = this.add.circle(x, y, 10, 0xff0000);
    this.userCircles.set(userId, userCircle);
    this.users.set(userId, { x, y });
  }

  // Method to update user position
  updateUserPosition(userId: string, x: number, y: number) {
    this.users.set(userId, { x, y });
    const user = this.userCircles.get(userId);
    if (user) {
      user.setPosition(x, y);
    }
  }

  // Method to remove a user
  removeUser(userId: string) {
    const user = this.userCircles.get(userId);
    console.log("Removing user: ", this.userCircles);
    if (user) {
      user.destroy(); // Remove the circle from the scene
      this.userCircles.delete(userId); // Remove the reference to the user
      this.users.delete(userId);
    }
  }

  moveCharacter(x: number, y: number) {
    this.ws.send(
      JSON.stringify({
        type: "move",
        payload: {
          x,
          y,
        },
      })
    );
  }

  update() {
    if (this.cursors.left?.isDown || this.keys.A?.isDown) {
      this.moveCharacter(this.character.x - 1, this.character.y);
    } else if (this.cursors.right?.isDown || this.keys.D?.isDown) {
      this.moveCharacter(this.character.x + 1, this.character.y);
    }

    if (this.cursors.up?.isDown || this.keys.W?.isDown) {
      this.moveCharacter(this.character.x, this.character.y - 1);
    } else if (this.cursors.down?.isDown || this.keys.S?.isDown) {
      this.moveCharacter(this.character.x, this.character.y + 1);
    }
  }
}
