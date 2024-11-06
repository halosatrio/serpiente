import ListNode from '@/classes/listnode'
import { COL_LENGTH, DOWN, LEFT, RIGHT, ROW_LENGTH, UP } from '@/constants'
import type { Direction, RowCol, SnakeBody } from '@/types'

export default class Snake {
  private list: ListNode<RowCol> | null = null
  public body: SnakeBody = {}
  public length: number = 0
  public currentDirection: Direction = RIGHT

  constructor() {
    const verticalCenter = Math.floor(ROW_LENGTH / 2)
    this.list = new ListNode([verticalCenter, 2])
    this.list.next = new ListNode([verticalCenter, 1])
    this.list.next.next = new ListNode([verticalCenter, 0])

    let node: ListNode<RowCol> | null = this.list
    while (node) {
      this.body[JSON.stringify(node.data)] = true
      this.length++

      node = node.next
    }
  }

  appendHead(rowCol: RowCol) {
    const newBody = new ListNode(rowCol)
    newBody.next = this.list
    this.list = newBody
    this.body[JSON.stringify(rowCol)] = true
    this.length++
  }

  removeTail() {
    let current = this.list
    let prev: ListNode<RowCol> | null = null
    while (current?.next) {
      prev = current
      current = current.next
    }

    if (prev?.next) {
      delete this.body[JSON.stringify(prev.next.data)]
      prev.next = null
      this.length--
    }
  }

  moveOneStep(direction: Direction, food: RowCol) {
    const [currentRow, currentCol] = this.list?.data as RowCol
    const nextRowCol: { [key: string]: RowCol } = {
      [RIGHT]: currentCol === COL_LENGTH - 1 ? [currentRow, 0] : [currentRow, currentCol + 1],
      [LEFT]: currentCol === 0 ? [currentRow, COL_LENGTH - 1] : [currentRow, currentCol - 1],
      [UP]: currentRow === 0 ? [ROW_LENGTH - 1, currentCol] : [currentRow - 1, currentCol],
      [DOWN]: currentRow === ROW_LENGTH - 1 ? [0, currentCol] : [currentRow + 1, currentCol],
    }

    let isFoodEaten = false
    const nextRowColStr = JSON.stringify(nextRowCol[direction])
    if (nextRowColStr !== JSON.stringify(food)) {
      this.removeTail()
    } else {
      isFoodEaten = true
    }

    if (this.body[nextRowColStr]) {
      // game over
      throw new Error()
    }

    this.appendHead(nextRowCol[direction])
    this.currentDirection = direction

    return {
      body: { ...this.body },
      length: this.length,
      isFoodEaten,
    }
  }
}
