import { ItemType } from '../types/Items'
import Item from './Item'

export default class Chair extends Item {
  itemDirection?:'up' | 'down' | 'left' | 'right'

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.itemType = ItemType.CHAIR
  }

  onOverlapDialog() {
    this.setDialogBox('Press E to sit')
  }
}
