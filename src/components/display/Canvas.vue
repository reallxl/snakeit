<template>
  <div>
    <button @click="switchAnim">Anim</button>
    <table border="0" frame="void" rules="none">
      <!-- DEBUG --><tr><td class="debug" v-for="col in mapSize.width">{{ col - 1 }}</td></tr><!-- DEBUG -->
      <tr v-for="row in mapSize.height">
        <component v-for="col in mapSize.width"
          :is="blockType((row - 1) * mapSize.width + (col - 1))"
          :data="dataMap[(row - 1) * mapSize.width + (col - 1)]"
          :key="((row - 1) * mapSize.width + (col - 1))"
        ></component>
        <!-- DEBUG --><td class="debug">{{ row - 1 }}</td><!-- DEBUG -->
      </tr>
    </table>
  </div>
</template>

<script>
  import * as EN_ from "../../include/Enums"
  import * as PA_ from "../../include/Params"

  import { appEventBus } from '../../main'

  import appColorBlock from './ColorBlock.vue'
  import appPixelBlock from './PixelBlock.vue'

  import CloudPattern from '../environment/CloudPattern'
  import TreePattern from '../environment/TreePattern'

  export default {
    props: {
      mapSize: Object,
      colorSet: Object,
      snakeList: Array,
      preyList: Array,
      //itemList: Array,
    },
    components: {
      appColorBlock,
      appPixelBlock,
    },
    data() {
      return {
        dataMap: new Array(this.mapSize.width * this.mapSize.height).fill(PA_.DEFAULT_COLORSET.backGround),
        objList: [],
        tick: null,
      };
    },
    methods: {
      switchAnim() {
        if (this.tick) {
          clearInterval(this.tick);
          this.tick = null;
        } else {
          let self = this;
          this.tick = setInterval(() => {
            self.refresh();
            self.render();
          }, 1000);
        }
      },
      refresh() {
        for (let o = 0; o < this.objList.length; o++) {
          let obj = this.objList[o];

          if (obj.curFrmNum != undefined) {
            obj.curFrmNum = (obj.curFrmNum + 1) % obj.pattern.frameList.length;
          }

          if (obj.dirList) {
            if (obj.curOfst == undefined) {
              obj.curOfst = {
                x: 0,
                y: 0,
              }
            }

            if (obj.dirList.includes(EN_.KEY._LEFT)) {
              obj.curOfst.x -= obj.speed;

              if (obj.curOfst.x < 0) {
                obj.startingPos--;
                obj.curOfst.x += PA_.BLOCK_WIDTH;
              }
            } else if (obj.dirList.includes(EN_.KEY._RIGHT)) {
              obj.curOfst.x += obj.speed;

              if (obj.curOfst.x >= PA_.BLOCK_WIDTH) {
                obj.startingPos++;
                obj.curOfst.x -= PA_.BLOCK_WIDTH;
              }
            }

            if (obj.dirList.includes(EN_.KEY._UP)) {
              obj.curOfst.y -= obj.speed;

              if (obj.curOfst.y < 0) {
                obj.startingPos -= PA_.DEFAULT_MAP_WIDTH;
                obj.curOfst.y += PA_.BLOCK_HEIGHT;
              }
            } else if (obj.dirList.includes(EN_.KEY._DOWN)) {
              obj.curOfst.y += obj.speed;

              if (obj.curOfst.y >= PA_.BLOCK_HEIGHT) {
                obj.startingPos += PA_.DEFAULT_MAP_WIDTH;
                obj.curOfst.y -= PA_.BLOCK_HEIGHT;
              }
            }
          }
        }
      },
      render() {
        //--- default color codes
        /*switch (this.data.type) {
            case NODE_TYPE._SNAKE: {
              ret = this.colorSet.snake;
              break;
            }
            case NODE_TYPE._SNAKE_SPAN: {
              ret = '#FA5838';
              break;
            }
            case NODE_TYPE._PREY: {
              ret = this.colorSet.prey;
              break;
            }
        }*/

        //--- reset
        this.dataMap.fill(PA_.DEFAULT_COLORSET.backGround);

        this.snakeList.forEach(snake => {
          this.dataMap.splice(snake.body.dataList[0].pos, 1, this.colorSet.snakeHead);
          for (let n = 1; n < snake.body.dataList.length; n++) {
            this.dataMap.splice(snake.body.dataList[n].pos, 1, this.colorSet.snake);
          }
        });

        this.preyList.forEach(prey => this.dataMap.splice(prey.pos, 1, prey.color ? prey.color : this.colorSet.prey));

        //--- loop throgh all objects
        for (let o = 0; o < this.objList.length; o++) {
          let obj = this.objList[o];
          let curFrm = obj.curFrmNum ? obj.pattern.frameList[obj.curFrmNum] : obj.pattern.frameList[0];
          let curBlockData, lastBlockPos = undefined, blockDataList = [];
          let bbb;

          for (let p = 0; p < curFrm.dataMap.length; p++) {
            if (curFrm.dataMap[p] == 0) {
              //--- skip blank pixels
              continue;
            }

            //--- 1-D to 2-D
            let x = p % obj.pattern.width, y = Math.floor(p / obj.pattern.width);

            if (obj.curOfst) {
              //--- apply offset
              x += obj.curOfst.x;
              y += obj.curOfst.y;
            }

            //--- locate block
            let bx = Math.floor(x / PA_.BLOCK_WIDTH), by = Math.floor(y / PA_.BLOCK_WIDTH);
            let blockPos = obj.startingPos + (by * PA_.DEFAULT_MAP_WIDTH + bx);

            /*if (obj.visiblePos && ((blockPos % PA_.DEFAULT_MAP_WIDTH) < (obj.visiblePos % PA_.DEFAULT_MAP_WIDTH) ||
              Math.floor(blockPos / PA_.DEFAULT_MAP_WIDTH) < Math.floor(obj.visiblePos / PA_.DEFAULT_MAP_WIDTH))) {
              continue;
            }*/

            if (this.dataMap[blockPos] instanceof Array == false) {
              this.dataMap.splice(blockPos, 1, new Array(PA_.BLOCK_WIDTH * PA_.BLOCK_HEIGHT).fill(this.dataMap[blockPos]));
            }

            //--- global (map) to local (block)
            x %= PA_.BLOCK_WIDTH;
            y %= PA_.BLOCK_HEIGHT;

            this.dataMap[blockPos].splice(y * PA_.BLOCK_WIDTH + x, 1, curFrm.colorDict[curFrm.dataMap[p] - 1]);
          }
        }
      },
      blockType(idx) {
        return this.dataMap[idx] instanceof Array ? 'appPixelBlock' : 'appColorBlock';
      },
    },
    computed: {
    },
    created() {
      let vm = this;

      vm.objList.push({
        pattern: TreePattern,
        startingPos: 110,
        curFrmNum: 0,
      });
      vm.objList.push({
        pattern: CloudPattern,
        startingPos: 96,
        visiblePos: 100,
        endingPos: 100,
        dirList: [
          EN_.KEY._RIGHT,
        ],
        speed: 1,
      });

      appEventBus.$on('render', () => {
        vm.refresh();
        vm.render();
      });
    }
  }
</script>

<style>
td {
  border: 0;
  padding: 0 0 0 0;
}

td.debug {
  border: 0;
  font-size: 10px;
}
</style>
