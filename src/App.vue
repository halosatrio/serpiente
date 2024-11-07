<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { COL_LENGTH, ROW_LENGTH, LEFT, RIGHT, UP, DOWN, IS_MOBILE } from '@/constants'
import type { Direction, RowCol, SnakeBody } from '@/types'
import Snake from '@/classes/snake'

import Logo from '@/assets/logo-1.jpg'
import PlayIcon from '@/assets/play_icon.svg'
import ArrowLeft from '@/assets/arrow_left.svg'
import ArrowRight from '@/assets/arrow_right.svg'
import ArrowUp from '@/assets/arrow_up.svg'
import ArrowDown from '@/assets/arrow_down.svg'

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
const snakeBody = ref(snake.value.body)
const snakeLength = ref(snake.value.length)
const food = ref<RowCol>(generateFood(snake.value.body))
const direction = ref<Direction>(snake.value.currentDirection)
const intervalId = ref<NodeJS.Timeout | null>(null)
const isGameOver = ref(false)

const resetGameState = () => {
  snake.value = new Snake()
  food.value = generateFood(snake.value.body)
  direction.value = snake.value.currentDirection
  isGameOver.value = false
  intervalId.value = null
}

console.log('IS_MOBILE', IS_MOBILE)

const startTimer = () => {
  if (isGameOver.value) resetGameState()

  const id = setInterval(() => {
    try {
      const { length, body, isFoodEaten } = snake.value.moveOneStep(direction.value, food.value)
      snakeBody.value = body
      snakeLength.value = length
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

const changeDirection = (dir: Direction) => {
  switch (dir) {
    case UP:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[UP])
        direction.value = UP
      break
    case DOWN:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[DOWN])
        direction.value = DOWN
      break
    case LEFT:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[LEFT])
        direction.value = LEFT
      break
    default:
      if (intervalId.value !== null && snake.value.currentDirection !== oppositeDirection[RIGHT])
        direction.value = RIGHT
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
    <div class="p-5">
      <img :src="Logo" alt="logo" class="w-[400px] rounded-2xl" />
    </div>
    <p v-if="!IS_MOBILE" class="text-sm mb-6 text-center">
      Press Enter or Space to start and pause. <br />Press arrow keys (↑, →, ↓, ←) to change
      direction.
    </p>

    <div class="py-2 text-sm">Snake length: {{ snakeLength }}</div>

    <div class="relative flex flex-col w-full lg:w-[unset]">
      <!-- if game over -->
      <div
        v-if="isGameOver"
        @click="startTimer"
        class="absolute left-0 right-0 bottom-0 top-0 z-9 bg-black bg-opacity-75 flex flex-col items-center justify-center cursor-pointer"
      >
        <div class="absolute top-[30px] flex flex-col items-center">
          <div class="text-white text-3xl mb-1">Game Over</div>
          <div class="text-white mb-1">Final length: {{ snakeLength }}</div>

          <div v-if="IS_MOBILE" class="text-white">Click to play again!</div>
          <div v-else class="text-white">Click or press Enter or Space to play again!</div>
        </div>
        <img :src="PlayIcon" alt="play again" class="w-[70px]" />
      </div>
      <!-- end if game over -->

      <!-- if not game over -->
      <div
        v-if="IS_MOBILE && !isGameOver && intervalId === null"
        @click="startTimer"
        class="absolute left-0 right-0 bottom-0 top-0 z-9 bg-black bg-opacity-75 flex flex-col items-center justify-center cursor-pointer"
      >
        <div class="absolute top-[30px] flex flex-col items-center">
          <div class="text-white text-3xl mb-1">Click to play!</div>
        </div>
        <img :src="PlayIcon" alt="play again" class="w-[70px]" />
      </div>
      <!-- end if not game over -->

      <div
        v-if="!IS_MOBILE && !isGameOver && intervalId === null"
        class="absolute left-0 right-0 bottom-0 top-0 z-9 bg-black bg-opacity-75 flex flex-col items-center justify-center"
      >
        <div class="text-white">Click or press Enter or Space to play!</div>
      </div>

      <div
        :style="{
          gridTemplateColumns: `repeat(${COL_LENGTH}, ${IS_MOBILE ? '1fr' : '12px'})`,
        }"
        class="grid"
      >
        <div v-for="(rows, i) in grid" :key="i" class="contents">
          <div
            v-for="(_, j) in rows"
            :key="j"
            :class="[
              'aspect-square',
              snakeBody[JSON.stringify([i, j])]
                ? 'bg-yellow-400'
                : JSON.stringify([i, j]) === JSON.stringify(food)
                  ? 'bg-red-500'
                  : 'bg-zinc-800',
            ]"
          ></div>
        </div>
      </div>
    </div>
    <!-- if game over -->
    <div v-if="IS_MOBILE" class="flex flex-col gap-[3px] p-8">
      <button class="flex justify-center" @click="changeDirection(UP)">
        <img :src="ArrowUp" alt="arrow up" class="w-[50px]" />
      </button>
      <div class="flex gap-[50px]">
        <button @click="changeDirection(LEFT)">
          <img :src="ArrowLeft" alt="arrow left" class="w-[50px]" />
        </button>

        <button @click="changeDirection(RIGHT)">
          <img :src="ArrowRight" alt="arrow right" class="w-[50px]" />
        </button>
      </div>
      <button class="flex justify-center" @click="changeDirection(DOWN)">
        <img :src="ArrowDown" alt="arrow down" class="w-[50px]" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>
