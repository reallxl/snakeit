<template>
  <div>
    <app-controller :curStatus="curStatus"></app-controller>
    <app-debug-panel :curStatus="curStatus" :mapSize="mapSize" :snakeList="snakeList"></app-debug-panel>
    <app-canvas :mapSize="mapSize" :colorSet="colorSet" :dataMap="dataMap"></app-canvas>
  </div>
</template>

<script>
  import * as EN_ from './include/Enums'
  import * as PA_ from './include/Params'

  import { DataManager } from './main'
  import { EventBus } from './main'

  import { DebugMethodMixin } from './include/DebugMethodMixin'

  import { Prey } from './components/prey/Prey'
  import { Snake } from './components/snake/Snake'
  import { GameProcessor } from './components/GameProcessor'

  import appController from './components/Controller.vue'
  import appDebugPanel from './components/DebugPanel.vue'
  import appCanvas from './components/display/Canvas.vue'

  export default {
    components: {
      appController,
      appDebugPanel,
      appCanvas,
    },
    mixins: [ DebugMethodMixin ],
    data() {
      return {
        //----------------------------------------------------------------------------------------
        //  basic settings
        //----------------------------------------------------------------------------------------
        curStatus: EN_.STATUS._STOPPED,
        curLevel: PA_.INIT_GAME_LEVEL,
        mapSize: {
          width: PA_.DEFAULT_MAP_WIDTH,
          height: PA_.DEFAULT_MAP_HEIGHT,
        },
        colorSet: {
          backGround: PA_.DEFAULT_BG_COLOR,
          snake: PA_.DEFAULT_SNAKE_COLOR,
          prey: PA_.DEFAULT_PREY_COLOR,
        },
        //----------------------------------------------------------------------------------------
        //  in-game data
        //----------------------------------------------------------------------------------------
        dataMap: null,
        snakeList: [],
        preyList: [],
        processor: null,
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  startGame
      //------------------------------------------------------------------------------------------
      startGame() {
        this.dataMap = new Array(this.mapSize.width * this.mapSize.height).fill(null);
        DataManager.mapSize = this.mapSize;
        DataManager.dataMap = this.dataMap;

        this.snakeList.unshift(new Snake());
        console.log(this.snakeList[0].body.dataList[0]);
        //--- in order to denote occupied positions by snake
        //this.dataManager.submit();
        this.preyList.unshift(new Prey());

        this.processor = new GameProcessor(this.dataMap, this.snakeList, this.preyList);
        this.processor.run();

        this.curStatus = EN_.STATUS._PLAYING;
      },
      //------------------------------------------------------------------------------------------
      //  pauseGame
      //------------------------------------------------------------------------------------------
      pauseGame() {
        this.processor.stop();
        this.curStatus = EN_.STATUS._PAUSED;
      },
      //------------------------------------------------------------------------------------------
      //  resumeGame
      //------------------------------------------------------------------------------------------
      resumeGame() {
        this.processor.run();
        this.curStatus = EN_.STATUS._PLAYING;
      },
      //------------------------------------------------------------------------------------------
      //  resetGame
      //------------------------------------------------------------------------------------------
      resetGame() {
        this.processor.stop();
        this.processor = null;

        this.dataMap = null;
        DataManager.mapSize = undefined;
        DataManager.dataMap = undefined;

        this.snakeList.length = 0;
        this.preyList.length = 0;

        this.curStatus = EN_.STATUS._STOPPED;
        this.curLevel = PA_.INIT_GAME_LEVEL;
      },
    },
    //--------------------------------------------------------------------------------------------
    //  primitive attributes
    //--------------------------------------------------------------------------------------------
    created() {
      let vm = this;

      /*EventBus.$on('levelChange', (args) => {
        vm.curLevel = args.level;
      });*/
      EventBus.$on('gameStart', () => {
        vm.startGame();
      });
      EventBus.$on('gamePause', () => {
        vm.pauseGame();
      })
      EventBus.$on('gameResume', () => {
        vm.resumeGame();
      });
      EventBus.$on('gameReset', () => {
        vm.resetGame();
      });
      EventBus.$on('gameOver', (args) => {
        console.log('collided at:', this.get2DPos(args.pos));
        alert('Game Over!!!');
        vm.resetGame();
      });

      EventBus.$on('movCtrlFire', (args) => {
        vm.snakeList[0].updateMovingDir(args.dir);
      });
      EventBus.$on('actCtrlFire', (args) => {

      });
    }
  }
</script>

<style>

</style>
