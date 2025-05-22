import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";

import Item from "../items/Item";
import Chair from "../items/Chair";
import Computer from "../items/Computer";
import Whiteboard from "../items/Whiteboard";
import VendingMachine from "../items/VendingMachine";

import "../characters/MyPlayer";
import "../characters/OtherPlayer";
import MyPlayer from "../characters/MyPlayer";
import OtherPlayer from "../characters/OtherPlayer";
import PlayerSelector from "../characters/PlayerSelector";

import { PlayerBehavior } from "../types/PlayerBehavior";
import { NavKeys, Keyboard } from "../types/KeyboardState";
import { GameClient } from "@/game/services/Network";
import { ItemType } from "@/game/types/Items";
import { Player, PlayerUpdatePayload } from "@repo/common/game";

export default class Game extends Phaser.Scene {
  private client!: GameClient;
  public authToken: string = localStorage.getItem("token")!;
  public roomId: string = localStorage.getItem("spaceId")!;

  // Keyboard input state objects
  private cursors!: NavKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyR!: Phaser.Input.Keyboard.Key;

  // Tilemap and layers
  private map!: Phaser.Tilemaps.Tilemap;

  // Players
  myPlayer!: MyPlayer; // The local player controlled by this client
  private playerSelector!: Phaser.GameObjects.Zone; // Selector zone for interacting with items
  private otherPlayers!: Phaser.Physics.Arcade.Group; // Group containing other remote players
  private otherPlayerMap = new Map<string, OtherPlayer>(); // Map to access other players by ID

  // Item maps for quick lookup by ID
  computerMap = new Map<string, Computer>();
  private whiteboardMap = new Map<string, Whiteboard>();

  constructor() {
    super("game"); // Scene key

    // Bind event handlers to ensure correct 'this' context
    this.handlePlayerJoined = this.handlePlayerJoined.bind(this);
    this.handlePlayerLeft = this.handlePlayerLeft.bind(this);
    this.handlePlayerUpdated = this.handlePlayerUpdated.bind(this);
    this.handleRoomSync = this.handleRoomSync.bind(this);
  }

  /**
   * Register keyboard keys used for player controls and actions.
   */
  registerKeys() {
    if (!this.input.keyboard) {
      throw new Error("Keyboard input is not initialized");
    }
    // Standard navigation keys (arrow keys + WASD)
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys("W,S,A,D") as Keyboard),
    };
    // Action keys
    this.keyE = this.input.keyboard.addKey("E");
    this.keyR = this.input.keyboard.addKey("R");

    // Prevent global capture of keyboard events to avoid conflicts
    this.input.keyboard.disableGlobalCapture();
  }

  /**
   * Disable all keyboard input (used for modal states or UI focus)
   */
  disableKeys() {
    if (!this.input.keyboard) {
      throw new Error("Keyboard input is not initialized");
    }
    this.input.keyboard.enabled = false;
  }

  /**
   * Enable keyboard input (after it has been disabled)
   */
  enableKeys() {
    if (!this.input.keyboard) {
      throw new Error("Keyboard input is not initialized");
    }
    this.input.keyboard.enabled = true;
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.client.joinRoom({
      roomId: this.roomId,
      authToken: this.authToken,
      user: {
        username: this.myPlayer.playerName.text || "",
        position: { x: this.myPlayer.x, y: this.myPlayer.y },
        avatar: this.myPlayer.playerTexture,
        anim: this.myPlayer.anims.currentAnim?.key || "",
      },
    });
  }

  /**
   * Phaser create lifecycle method - initializes the game scene.
   */
  create(data: { client: GameClient , userName: string; avatar: string }) {
    if (!data.client) {
      throw new Error("Client is not initialized");
    } else {
      this.client = data.client;
    }
    // Setup character animations
    createCharacterAnims(this.anims);
    this.registerKeys();

    // Load tilemap and tileset images
    this.map = this.make.tilemap({ key: "tilemap" });
    const FloorAndGround = this.map.addTilesetImage(
      "FloorAndGround",
      "tiles_wall"
    );

    // Create ground layer and enable collision on tiles with property 'collides'
    const groundLayer = this.map.createLayer("Ground", FloorAndGround!);
    if (!groundLayer)
      throw new Error("Layer 'Ground' not found in the tilemap.");
    groundLayer.setCollisionByProperty({ collides: true });

    // Add the local player to the scene
    this.myPlayer = this.add.myPlayer(705, 500, data.avatar, this.client.userId!);
    this.myPlayer.setPlayerName(data.userName);
    this.joinRoom(this.roomId);
    

    // Player selector is a small zone to detect interaction with items
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16);

    // Load and add static groups for various items from Tiled map object layers:

    // Chairs
    const chairs = this.physics.add.staticGroup({ classType: Chair });
    const chairLayer = this.map.getObjectLayer("Chair");
    chairLayer?.objects.forEach((chairObj) => {
      const item = this.addObjectFromTiled(
        chairs,
        chairObj,
        "chairs",
        "chair"
      ) as Chair;
      // Set chair direction from Tiled properties
      item.itemDirection = chairObj.properties[0].value;
    });

    // Computers
    const computers = this.physics.add.staticGroup({ classType: Computer });
    const computerLayer = this.map.getObjectLayer("Computer");
    if (!computerLayer)
      throw new Error("Layer 'Computer' not found in the tilemap.");
    computerLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        computers,
        obj,
        "computers",
        "computer"
      ) as Computer;
      item.setDepth(item.y + item.height * 0.27);
      const id = `${i}`;
      item.id = id;
      this.computerMap.set(id, item);
    });

    // Whiteboards
    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard });
    const whiteboardLayer = this.map.getObjectLayer("Whiteboard");
    if (!whiteboardLayer)
      throw new Error("Layer 'Whiteboard' not found in the tilemap.");
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        "whiteboards",
        "whiteboard"
      ) as Whiteboard;
      const id = `${i}`;
      item.id = id;
      this.whiteboardMap.set(id, item);
    });

    // Vending Machines
    const vendingMachines = this.physics.add.staticGroup({
      classType: VendingMachine,
    });
    const vendingMachineLayer = this.map.getObjectLayer("VendingMachine");
    if (!vendingMachineLayer)
      throw new Error("Layer 'VendingMachine' not found in the tilemap.");
    vendingMachineLayer.objects.forEach((obj, i) => {
      this.addObjectFromTiled(
        vendingMachines,
        obj,
        "vendingmachines",
        "vendingmachine"
      );
    });

    // Additional groups from Tiled layers for environment objects
    this.addGroupFromTiled("Wall", "tiles_wall", "FloorAndGround", false);
    this.addGroupFromTiled(
      "Objects",
      "office",
      "Modern_Office_Black_Shadow",
      false
    );
    this.addGroupFromTiled(
      "ObjectsOnCollide",
      "office",
      "Modern_Office_Black_Shadow",
      true
    );
    this.addGroupFromTiled("GenericObjects", "generic", "Generic", false);
    this.addGroupFromTiled(
      "GenericObjectsOnCollide",
      "generic",
      "Generic",
      true
    );
    this.addGroupFromTiled("Basement", "basement", "Basement", true);

    // Group for other remote players in the multiplayer game
    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer });

    // Configure camera to zoom and follow the local player
    this.cameras.main.zoom = 1.5;
    this.cameras.main.startFollow(this.myPlayer, true);

    // Add physics colliders
    this.physics.add.collider(
      [this.myPlayer, this.myPlayer.playerContainer],
      groundLayer
    );
    this.physics.add.collider(
      [this.myPlayer, this.myPlayer.playerContainer],
      vendingMachines
    );

    // Setup overlap callbacks for player selector interacting with items
    this.physics.add.overlap(
      this.playerSelector,
      [chairs, computers, whiteboards, vendingMachines],
      this.handleItemSelectorOverlap,
      undefined,
      this
    );

    // Setup overlap callback between local player and other players for interaction (e.g. calls)
    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    );
    this.client.onPlayerJoined(this.handlePlayerJoined);
    this.client.onPlayerLeft(this.handlePlayerLeft);
    this.client.onPlayerUpdated(this.handlePlayerUpdated);
    this.client.onRoomSync(this.handleRoomSync);
    // this.client.onChatMessageAdded(this.handleChatMessageAdded, this);
    // this.client.onMyPlayerReady(this.handleMyPlayerReady, this);
    // this.client.onMyPlayerVideoConnected(this.handleMyVideoConnected, this);
    // this.client.onItemUserAdded(this.handleItemUserAdded, this);
    // this.client.onItemUserRemoved(this.handleItemUserRemoved, this);
  }

  /**
   * Handle overlap between player selector zone and items (chairs, computers, whiteboards, vending machines).
   * Manages selection change and dialog box display.
   */
  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem as Item;

    // If previously selected item exists
    if (currentItem) {
      // If same item or higher depth, ignore to prevent flickering or unnecessary updates
      if (
        currentItem === selectionItem ||
        currentItem.depth >= selectionItem.depth
      ) {
        return;
      }
      // Clear dialog box if player is not sitting on previous item
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING)
        currentItem.clearDialogBox();
    }

    // Update selected item and show dialog
    playerSelector.selectedItem = selectionItem;
    selectionItem.onOverlapDialog();
  }

  /**
   * Add an object to a static group based on its properties from the Tiled map.
   * Calculates correct position and frame index based on tileset info.
   */
  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5;
    const actualY = object.y! - object.height! * 0.5;

    const obj = group
      .get(
        actualX,
        actualY,
        key,
        (() => {
          const tileset = this.map.getTileset(tilesetName);
          if (!tileset)
            throw new Error(
              `Tileset '${tilesetName}' not found in the tilemap.`
            );
          return object.gid! - tileset.firstgid;
        })()
      )
      .setDepth(actualY);

    return obj;
  }

  /**
   * Add a group of objects from a Tiled object layer.
   * If collidable is true, add physics collider between player and group.
   */
  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup();
    const objectLayer = this.map.getObjectLayer(objectLayerName);
    if (!objectLayer)
      throw new Error(`Layer '${objectLayerName}' not found in the tilemap.`);

    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5;
      const actualY = object.y! - object.height! * 0.5;
      group
        .get(
          actualX,
          actualY,
          key,
          object.gid! - this.map.getTileset(tilesetName)!.firstgid
        )
        .setDepth(actualY);
    });

    // Add collision between player and this group if needed
    if (this.myPlayer && collidable)
      this.physics.add.collider(
        [this.myPlayer, this.myPlayer.playerContainer],
        group
      );
  }

  private handleRoomSync(players: Player[]) {
    for (const player of players) {
      this.handlePlayerJoined(player);
    }
  }

  /**
   * Adds a new remote player to the game scene.
   */
  private handlePlayerJoined(newPlayer: Player) {
    const otherPlayer = this.add.otherPlayer(
      newPlayer.position.x,
      newPlayer.position.y,
      newPlayer.avatar,
      newPlayer.userId!,
      newPlayer.username
    );
    this.otherPlayers.add(otherPlayer);
    this.otherPlayerMap.set(newPlayer.userId!, otherPlayer);
  }

  /**
   * Removes a remote player from the game scene.
   */
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.size === 0) return;
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id);
      if (!otherPlayer) return;
      this.otherPlayers.remove(otherPlayer, true, true);
      this.otherPlayerMap.delete(id);
    }
  }
  // function to update target position upon receiving player updates
  private handlePlayerUpdated(payload: PlayerUpdatePayload) {
    const otherPlayer = this.otherPlayerMap.get(payload.userId);
    otherPlayer?.updateOtherPlayer(payload);
  }
  private handlePlayersOverlap(myPlayer, otherPlayer) {
    // otherPlayer.makeCall()
    // TODO: implement call logic
  }
  private handleItemUserAdded(
    playerId: string,
    itemId: string,
    itemType: ItemType
  ) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId);
      computer?.addCurrentUser(playerId);
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId);
      whiteboard?.addCurrentUser(playerId);
    }
  }

  private handleItemUserRemoved(
    playerId: string,
    itemId: string,
    itemType: ItemType
  ) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId);
      computer?.removeCurrentUser(playerId);
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId);
      whiteboard?.removeCurrentUser(playerId);
    }
  }

  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId);
    otherPlayer?.updateDialogBubble(content);
  }
  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true;
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true;
  }

  /**
   * Phaser update method called every frame.
   * Updates local player state and other players animations.
   */
  update(time: number, delta: number) {
    if (this.myPlayer && this.client) {
      this.playerSelector.update(this.myPlayer, this.cursors);
      this.myPlayer.update(
        this.playerSelector,
        this.cursors,
        this.keyE,
        this.keyR,
        this.client
      );
    }
  }
}