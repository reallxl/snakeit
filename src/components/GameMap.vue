<template>
  <div>
    <button @click="startGame" v-if="snake.bodyData.length == 0">Start</button>
    <!--<button @click="pauseGame" v-else-if="!isNaN(stepProcID)">Pause</button>-->
    <button @click="resumeGame" v-else>Resume</button>
    <!--<button @click="stepProc(snake, false)" v-if="snake.bodyData.length && isNaN(stepProcID)">Step</button>-->
    <button @click="resetGame">Reset</button>
    <p>
      body: {{ snake.length }} shown: {{ snake.bodyData.length }} <!--status: {{ effectModifier.type }}-->
      <template v-if="snake.bodyData.length != 0">
        head: ({{ snake.bodyData[0].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[0].pos / this.mapSize.width) }})
        tail: ({{ snake.bodyData[snake.bodyData.length - 1].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[snake.bodyData.length - 1].pos / this.mapSize.width) }})
      </template>
    </p>
    <app-canvas :mapSize="mapSize" :map="map" :colorSet="colorSet"></app-canvas>
    <app-round-processor
      ref="roundProcessor"
      :mapSize="mapSize" :map="map" :snake="snake" :prey="prey"
      @gameTerminating="resetGame"
    ></app-round-processor>
  </div>
</template>

<script>
  import * as EN from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'

  import appCanvas from './Canvas.vue'
  import appRoundProcessor from './RoundProcessor.vue'

  export default {
    props: {
      mapSize: Object,
    },
    components: {
      appCanvas,
      appRoundProcessor,
    },
    data() {
      return {
        curLevel: PA_.INIT_GAME_LEVEL,
        map: new Array(this.mapSize.width * this.mapSize.height).fill(null),
        colorSet: {
          backGround: PA_.DEFAULT_BG_COLOR,
          snake: PA_.DEFAULT_SNAKE_COLOR,
          prey: PA_.DEFAULT_PREY_COLOR,
        },
        snake: {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN._KEY._RIGHT,
        },
        prey: [],
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

        //--- hello prey!
        this.prey.unshift({
          pos: ME_.getRandomAvailablePos(this.mapSize, this.map),
          effect: PA_.DEFAULT_EFFECT,
        });

        this.$refs.roundProcessor.runRound();
      },
      resetGame() {
        this.$refs.roundProcessor.cancelRound();

        this.curLevel = PA_.INIT_GAME_LEVEL;
        this.map.fill(null);
        this.snake = {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN._KEY._RIGHT,
        };
        this.prey.length = 0;

        return 0;
      },
      pauseGame() {
        this.$refs.roundProcessor.cancelRound();
      },
      resumeGame() {
        this.$refs.roundProcessor.runRound();
      },
      //------------------------------------------------------------------------------------------
      //  methods
      //------------------------------------------------------------------------------------------
      handleMovingCtrlInput(dir) {
        if ((this.snake.bodyData.length == 1 && dir !=  ME_.getMovingDir(this.mapSize, this.snake.bodyData[0].pos, this.snake.trailingData[0].pos)) ||
          (this.snake.bodyData.length > 1 && dir != ME_.getMovingDir(this.mapSize, this.snake.bodyData[0].pos, this.snake.bodyData[1].pos))) {
          this.snake.curHeadingDir = dir;
        }
      },
      handleActionInput(key) {

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
          case EN._KEY._LEFT:
          case EN._KEY._UP:
          case EN._KEY._RIGHT:
          case EN._KEY._DOWN:
            event.preventDefault();
            vm.handleMovingCtrlInput(event.keyCode);
            break;
          case EN._KEY._BTN_A:
          case EN._KEY._BTN_B:
          case EN._KEY._BTN_C:
            event.preventDefault();
            vm.handleActionInput(event.keyCode);
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
