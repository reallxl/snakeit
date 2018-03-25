<template>
  <div>
    <button @click="startGame" v-if="curStatus == 0">Start</button>
    <button @click="pauseGame" v-else-if="curStatus == 1">Pause</button>
    <template v-else-if="curStatus == 2">
      <button @click="resumeGame">Resume</button>
      <button @click="stepMove">Step</button>
    </template>
    <button @click="resetGame">Reset</button>
    <p>
      body: {{ snake.length }} shown: {{ snake.bodyData.length }}
      head: ({{ snake.bodyData.length ? snake.bodyData[0].pos % this.mapSize.width : 0 }}, {{ snake.bodyData.length ? Math.floor(snake.bodyData[0].pos / this.mapSize.width) : 0 }})
      tail: ({{ snake.bodyData.length ? snake.bodyData[snake.bodyData.length - 1].pos % this.mapSize.width : 0 }}, {{ snake.bodyData.length ? Math.floor(snake.bodyData[snake.bodyData.length - 1].pos / this.mapSize.width) : 0 }})
    </p>
    <app-processor ref="processor"
      :size="mapSize" @gameTerminating="resetGame"
    ></app-processor>
  </div>
</template>

<script>
  import * as EN_ from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'



  export default {
    props: {
      mapSize: Object,
      snake: Object,
      prey: Array,
    },
    components: {
      appProcessor,
    },
    data() {
      return {
        curStatus: EN_.STATUS._STOPPED,
        curLevel: PA_.INIT_GAME_LEVEL,
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  public APIs
      //------------------------------------------------------------------------------------------
      startGame() {
        //--- hello snake!
        this.snake.bodyData.unshift({
          pos: 0,
        });
        this.snake.trailingData.unshift(this.mapSize.width - 1);
        this.$refs.dataMap.updatePos(this.snake.bodyData[0].pos, {
          type: EN_.NODE_TYPE._SNAKE,
          color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
        });

        //--- hello prey!
        this.prey.unshift({
          pos: this.$refs.dataMap.getRandomAvailablePos(),
          effect: effect,
        });

        this.curStatus = EN_.STATUS._PLAYING;
        this.$refs.processor.startProcess();
      },
      pauseGame() {
        this.$refs.processor.stopProcess();
        this.curStatus = EN_.STATUS._PAUSED;
      },
      resumeGame() {
        this.curStatus = EN_.STATUS._PLAYING;
        this.$refs.processor.startProcess();
      },
      resetGame() {
        this.$refs.processor.stopProcess();

        this.curStatus = EN_.STATUS._STOPPED;
        this.curLevel = PA_.INIT_GAME_LEVEL;

        this.snake = {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN_.KEY._RIGHT,
        };
        this.prey.length = 0;

        return 0;
      },
      //------------------------------------------------------------------------------------------
      //  IO functions
      //------------------------------------------------------------------------------------------
      handleActionControl(key) {

      },
      handleMovementControl(dir) {
        if ((this.snake.bodyData.length == 1 && dir !=  this.$refs.dataMap.getMovingDir(this.snake.bodyData[0].pos, this.snake.trailingData[0].pos)) ||
          dir != this.$refs.dataMap.getMovingDir(this.snake.bodyData[0].pos, this.snake.bodyData[1].pos)) {
          this.snake.curHeadingDir = dir;
        }
      },
      //------------------------------------------------------------------------------------------
      //  debugging functions
      //------------------------------------------------------------------------------------------
      stepMove() {
        this.$refs.processor.startProcess(false/* force NOT to automatically schedule next round */);
      },
    },
    //------------------------------------------------------------------------------------------
    //  primitive attributes
    //------------------------------------------------------------------------------------------
    created() {
      let vm = this;

      //--- monitor control inputs
      window.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
          //--- valid input values
          case EN_.KEY._LEFT:
          case EN_.KEY._UP:
          case EN_.KEY._RIGHT:
          case EN_.KEY._DOWN:
            event.preventDefault();
            vm.handleActionControl(event.keyCode);
            break;
          case EN_.KEY._BTN_A:
          case EN_.KEY._BTN_B:
          case EN_.KEY._BTN_C:
            event.preventDefault();
            vm.handleMovementControl(event.keyCode);
            break;

          default:
            break;
        }
      });
    },
  }
</script>

<style>

</style>
