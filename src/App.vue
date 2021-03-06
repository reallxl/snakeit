<template>
  <div>
    <app-controller :curStatus="curStatus"></app-controller>
    <app-debug-panel :curStatus="curStatus" :mapSize="mapSize" :snakeList="snakeList"></app-debug-panel>
    <app-canvas :mapSize="mapSize" :colorSet="colorSet" :snakeList="snakeList" :preyList="preyList" :envObjList="envObjList"></app-canvas>
  </div>
</template>

<script>
  import * as EN_ from './include/Enums'
  import * as PA_ from './include/Params'

  import { appDataManager } from './main'
  import { appEventBus } from './main'

  import { DebugMethodMixin } from './include/DebugMethodMixin'

  import { Prey } from './components/prey/Prey'
  import { Snake } from './components/snake/Snake'
  import { GameProcessor } from './components/GameProcessor'

  import CloudPattern from './components/environment/CloudPattern'
  import TreePattern from './components/environment/TreePattern'

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
          grid: {
            width: PA_.BLOCK_WIDTH,
            height: PA_.BLOCK_HEIGHT,
          },
          width: PA_.DEFAULT_MAP_WIDTH,
          height: PA_.DEFAULT_MAP_HEIGHT,
        },
        colorSet: {
          backGround: PA_.DEFAULT_BG_COLOR,
          snakeHead: PA_.DEFAULT_SNAKE_HEAD_COLOR,
          snake: PA_.DEFAULT_SNAKE_COLOR,
          prey: PA_.DEFAULT_PREY_COLOR,
        },
        //----------------------------------------------------------------------------------------
        //  in-game data
        //----------------------------------------------------------------------------------------
        snakeList: [],
        preyList: [],
        envObjList: [],
        processor: undefined,
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  startGame
      //------------------------------------------------------------------------------------------
      startGame() {
        appDataManager.init(this.mapSize, this.snakeList, this.preyList);

        this.snakeList.unshift(new Snake({
          curSpeed: this.curLevel,
        }));
        //--- in order to denote occupied positions by snake
        //this.dataManager.submit();
        this.preyList.unshift(new Prey());

        this.envObjList.push({
            pattern: TreePattern,
            startingPos: 110,
            curFrmNum: 0,
            speed: 1,
            curMoveTick: 0,
          },
          {
            pattern: CloudPattern,
            startingPos: 96,
            visiblePos: 100,
            endingPos: 100,
            dirList: [
              EN_.KEY._RIGHT,
            ],
            speed: 1,
            curMoveTick: 0,
          });

        this.processor = new GameProcessor(this.snakeList, this.preyList, this.envObjList);
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
        appDataManager.reset();

        this.processor.stop();
        this.processor = undefined;

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

      /*appEventBus.$on('levelChange', (args) => {
        vm.curLevel = args.level;
      });*/
      appEventBus.$on('gameStart', () => {
        vm.startGame();
      });
      appEventBus.$on('gamePause', () => {
        vm.pauseGame();
      })
      appEventBus.$on('gameResume', () => {
        vm.resumeGame();
      });
      appEventBus.$on('gameReset', () => {
        vm.resetGame();
      });
      appEventBus.$on('gameOver', (args) => {
        console.log('collided at:', this.get2DPos(args.pos));
        alert('Game Over!!!');
        vm.resetGame();
      });

      appEventBus.$on('movCtrlFire', (args) => {
        vm.processor.handleMovCtrl(args.dir);
      });
      appEventBus.$on('actCtrlFire', (args) => {
        vm.processor.handleActCtrl(args.key);
      });

      appEventBus.$on('colorSetUpdate', (args) => {
        args.forEach((item) => {
          vm.colorSet[item.key] = item.val;
        });
      });

      appEventBus.$on('preySpawn', (args) => {
        this.preyList.unshift(new Prey(args));
      });
    }
  }
</script>

<style>

</style>
