<template>
  <div>
    <p>
      body: {{ snake.length }} shown: {{ snake.bodyData.length }}
      <template v-if="snake.bodyData.length != 0">
        head: ({{ snake.bodyData[0].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[0].pos / this.mapSize.width) }})
        tail: ({{ snake.bodyData[snake.bodyData.length - 1].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[snake.bodyData.length - 1].pos / this.mapSize.width) }})
      </template>
    </p>
    <app-canvas :mapSize="mapSize" :dataMap="dataMap" :colorSet="colorSet"></app-canvas>
    <app-processor
      ref="Processor"
      :mapSize="mapSize" :dataMap="dataMap" :snake="snake" :prey="prey"
    ></app-processor>
  </div>
</template>

<script>
  import * as EN_ from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'

  import { EventHandler } from '../main'

  import appCanvas from './Canvas.vue'
  import appProcessor from './Processor.vue'

  export default {
    props: {
      curStatus: Number,
      curLevel: Number,
      mapSize: Object,
    },
    components: {
      appCanvas,
      appProcessor,
    },
    data() {
      return {
        dataMap: new Array(this.mapSize.width * this.mapSize.height).fill(null),
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
          curHeadingDir: EN_.KEY._RIGHT,
        },
        prey: [],
      };
    },
    methods: {

    },
    //------------------------------------------------------------------------------------------
    //  primitive attributes
    //------------------------------------------------------------------------------------------
    created() {
      let vm = this;

      EventHandler.$on('gamePreStart', () => {
        //--- hello snake!
        vm.snake.bodyData.unshift({
          pos: 0,
        });
        vm.snake.trailingData.unshift(vm.mapSize.width - 1);

        //--- hello prey!
        vm.prey.unshift({
          pos: vm.$refs.Processor.getRandomAvailablePos(),
          effect: PA_.DEFAULT_EFFECT,
        });

        EventHandler.$emit('gameStart');
      });

      EventHandler.$on('gameReset', () => {
        vm.dataMap.fill(null);
        vm.snake = {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN_.KEY._RIGHT,
        };
        vm.prey.length = 0;

        EventHandler.$emit('statusChange', {
          status: EN_.STATUS._STOPPED,
        });
      });

      EventHandler.$on('movCtrlFire', (args) => {
        if ((vm.snake.bodyData.length == 1 && args.dir !=  vm.$refs.Processor.getMovingDir(vm.snake.bodyData[0].pos, vm.snake.trailingData[0].pos)) ||
          (vm.snake.bodyData.length > 1 && args.dir != vm.$refs.Processor.getMovingDir(vm.snake.bodyData[0].pos, vm.snake.bodyData[1].pos))) {
          vm.snake.curHeadingDir = args.dir;
        }
      });

      EventHandler.$on('actCtrlFire', (args) => {

      });
    },
  }
</script>

<style>

</style>
