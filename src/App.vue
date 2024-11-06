<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { COL_LENGTH, DOWN, LEFT, RIGHT, ROW_LENGTH, UP } from '@/constants'
import type { Direction, RowCol, SnakeBody } from '@/types'
import Snake from '@/classes/snake'

const grid: number[][] = new Array(ROW_LENGTH).fill(new Array(COL_LENGTH).fill(0))

const oppositeDirection = {
  [RIGHT]: LEFT,
  [LEFT]: RIGHT,
  [UP]: DOWN,
  [DOWN]: UP,
}

const generateFood = (body: SnakeBody) => {
  const rowCols: RowCol[] = []
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const rowCol: RowCol = [i, j]
      if (!body[JSON.stringify([i, j])]) {
        rowCols.push(rowCol)
      }
    }
  }
  const randomIndex = Math.floor(Math.random() * rowCols.length)
  return rowCols[randomIndex]
}

const snake = ref(new Snake())
// const snakeBody = ref(snake.value.body)
// const snakeLength = ref(snake.value.length)
const food = ref<RowCol>(generateFood(snake.value.body))
const direction = ref<Direction>(snake.value.currentDirection)
const intervalId = ref<NodeJS.Timeout | null>(null)
const isGameOver = ref(false)

// Optional computed properties
const snakeBody = computed(() => snake.value.body)
const snakeLength = computed(() => snake.value.length)

const resetGameState = () => {
  snake.value = new Snake()
  food.value = generateFood(snake.value.body)
  direction.value = snake.value.currentDirection
  isGameOver.value = false
  intervalId.value = null
}

const startTimer = () => {
  if (isGameOver.value) resetGameState()

  const id = setInterval(() => {
    try {
      const { length, body, isFoodEaten } = snake.value.moveOneStep(direction.value, food.value)
      if (isFoodEaten) {
        food.value = generateFood(body)
      }
    } catch (e) {
      isGameOver.value = true
      stopTimer()
    }
  }, 130)
  intervalId.value = id
}

const stopTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

const changeDirection = (direction: Direction) => {
  switch (direction) {
    case UP:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[UP])
        direction = UP
      break
    case DOWN:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[DOWN])
        direction = DOWN
      break
    case LEFT:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[LEFT])
        direction = LEFT
      break
    default:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[RIGHT])
        direction = RIGHT
      break
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
      changeDirection(UP)
      break
    case 'ArrowDown':
      changeDirection(DOWN)
      break
    case 'ArrowLeft':
      changeDirection(LEFT)
      break
    case 'ArrowRight':
      changeDirection(RIGHT)
      break
    case 'Enter':
      if (intervalId.value !== null) stopTimer()
      else startTimer()
      break
    case ' ':
      if (intervalId.value !== null) stopTimer()
      else startTimer()
      break
    default:
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // Cleanup interval
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})
</script>

<template>
  <div class="flex flex-col items-center w-full">
    <p class="text-sm mb-6">
      Press arrow keys (↑, →, ↓, ←) to change direction. Press Enter or Space to start and pause.
    </p>

    <div class="py-2 text-sm">Length:</div>
    <div class="relative flex flex-col w-full lg:w-[unset]">
      <div
        class="absolute left-0 right-0 bottom-0 top-0 z-9 bg-black bg-opacity-75 flex flex-col items-center justify-center cursor-pointer"
      >
        <div class="absolute top-[30px] flex flex-col items-center">
          <div class="text-white text-3xl mb-1">Click to play!</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
