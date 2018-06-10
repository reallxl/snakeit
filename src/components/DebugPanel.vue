<template>
  <div>
    <button @click="pauseGame" v-if="curStatus == 1/*EN_.STATUS._PLAYING*/">Pause</button>
    <button @click="resumeGame" v-else-if="curStatus == 2/*EN_.STATUS._PAUSED*/">Resume</button>
    <button @click="stepMove" v-if="curStatus != 0/*EN_.STATUS._STOPPED*/">Step</button>
    <p v-for="snake in snakeList">
      body: {{ snake.body.length }} shown: {{ snake.body.dataList.length }}
      <template v-if="snake.body.dataList.length != 0">
        head: (
          {{ snake.body.dataList[0].pos % mapSize.width }},
          {{ Math.floor(snake.body.dataList[0].pos / mapSize.width) }}
        )
        tail: (
          {{ snake.body.dataList[snake.body.dataList.length - 1].pos % mapSize.width }},
          {{ Math.floor(snake.body.dataList[snake.body.dataList.length - 1].pos / mapSize.width) }}
        )
      </template>
    </p>
  </div>
</template>

<script>
  import { appEventBus } from '../main'

  export default {
    props: {
      curStatus: Number,
      mapSize: Object,
      snakeList: Array,
    },
    data() {
      return {

      };
    },
    methods: {
      pauseGame() {
        appEventBus.$emit('gamePause');
      },
      resumeGame() {
        appEventBus.$emit('gameResume');
      },
      stepMove() {
        appEventBus.$emit('stepMove');
      },
    },
    created() {

    },
  }
</script>

<style>
</style>
