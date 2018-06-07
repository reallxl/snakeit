<template>
  <div>
    <button @click="switchAnim">Anim</button>
    <table border="0" frame="void" rules="none">
      <!-- DEBUG --><tr><td v-for="col in mapSize.width" border="0" style="font-size: 6px;">{{ col - 1 }}</td></tr><!-- DEBUG -->
      <tr v-for="row in mapSize.height">
        <app-pixel-block v-for="col in mapSize.width"
          :data="dataMap[(row - 1) * mapSize.width + (col - 1)]"
          :colorSet="colorSet"
          :key="((row - 1) * mapSize.width + (col - 1))"
        ></app-pixel-block>
        <!-- DEBUG --><td border="0" style="font-size: 6px;">{{ row - 1 }}</td><!-- DEBUG -->
      </tr>
    </table>
  </div>
</template>

<script>
  import * as EN_ from "../../include/Enums"
  import * as PA_ from "../../include/Params"

  import appPixelBlock from './PixelBlock.vue'

  import CloudPattern from '../gallery/CloudPattern'
  import TreePattern from '../gallery/TreePattern'

  export default {
    props: {
      mapSize: Object,
      colorSet: Object,
      //snakeList: Array,
      //PreyList: Array,
      //itemList: Array,
    },
    components: {
      appPixelBlock,
    },
    data() {
      return {
        //dataMap: new Array(this.mapSize.width * this.mapSize.height).fill(null),
        dataMap: new Array(this.mapSize.width * this.mapSize.height).fill(null),
        objList: [],
        init: false,
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
            if (obj.dirList.includes(EN_.KEY._LEFT)) {
              obj.curOfst.x -= obj.speed;

              if (obj.curOfst.x < 0) {
                obj.startingPos--;
                obj.curOfst.x += PA_.PIXEL_BLOCK_WIDTH;
              }
            } else if (obj.dirList.includes(EN_.KEY._RIGHT)) {
              obj.curOfst.x += obj.speed;

              if (obj.curOfst.x >= PA_.PIXEL_BLOCK_WIDTH) {
                obj.startingPos++;
                obj.curOfst.x -= PA_.PIXEL_BLOCK_WIDTH;
              }
            }

            if (obj.dirList.includes(EN_.KEY._UP)) {
              obj.curOfst.y -= obj.speed;

              if (obj.curOfst.y < 0) {
                obj.startingPos -= PA_.DEFAULT_MAP_WIDTH;
                obj.curOfst.y += PA_.PIXEL_BLOCK_HEIGHT;
              }
            } else if (obj.dirList.includes(EN_.KEY._DOWN)) {
              obj.curOfst.y += obj.speed;

              if (obj.curOfst.y >= PA_.PIXEL_BLOCK_HEIGHT) {
                obj.startingPos += PA_.DEFAULT_MAP_WIDTH;
                obj.curOfst.y -= PA_.PIXEL_BLOCK_HEIGHT;
              }
            }
          }
        }
      },
      render() {
        //--- reset
        this.dataMap.fill(null);

        for (let o = 0; o < this.objList.length; o++) {
          let obj = this.objList[o];
          let curFrm = obj.curFrmNum ? obj.pattern.frameList[obj.curFrmNum] : obj.pattern.frameList[0];
          let curBlockData, lastBlockPos = undefined, blockDataList = [];

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
            let bx = Math.floor(x / PA_.PIXEL_BLOCK_WIDTH), by = Math.floor(y / PA_.PIXEL_BLOCK_WIDTH);
            let blockPos = obj.startingPos + (by * PA_.DEFAULT_MAP_WIDTH + bx);

            if (blockPos != lastBlockPos) {
              let block = blockDataList.find(block => block.pos == blockPos);
              if (block) {
                curBlockData = block.data;
              } else {
                if (this.dataMap[blockPos]) {
                  curBlockData = Object.assign({}, this.dataMap[blockPos]);
                } else {
                  curBlockData = {
                    width: PA_.PIXEL_BLOCK_WIDTH,
                    height: PA_.PIXEL_BLOCK_HEIGHT,
                    dataMap: Array(PA_.PIXEL_BLOCK_WIDTH * PA_.PIXEL_BLOCK_HEIGHT).fill(0),
                  };
                }

                blockDataList.push({
                  pos: blockPos,
                  data: curBlockData,
                });
              }

              lastBlockPos = blockPos;
            }

            //--- global (map) to local (block)
            x %= PA_.PIXEL_BLOCK_WIDTH;
            y %= PA_.PIXEL_BLOCK_HEIGHT;

            curBlockData.dataMap[y * PA_.PIXEL_BLOCK_WIDTH + x] = curFrm.colorList[curFrm.dataMap[p] - 1];
          }

          for (let b = 0; b < blockDataList.length; b++) {
            if (obj.visiblePos == undefined || obj.startingPos >= obj.visiblePos ||
              // ??????????????????????????????????????????????????
              // ??????????????????????????????????????????????????
              // ??????????????????????????????????????????????????
              ((blockDataList[b].pos % PA_.DEFAULT_MAP_WIDTH) >= (obj.visiblePos % PA_.DEFAULT_MAP_WIDTH) &&
              (blockDataList[b].pos % PA_.DEFAULT_MAP_WIDTH) >= (obj.visiblePos % PA_.DEFAULT_MAP_WIDTH))) {
                this.dataMap.splice(blockDataList[b].pos, 1, blockDataList[b].data);
            }
          }
        }
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
        curOfst: {
          x: 0,
          y: 0,
        },
        dirList: [
          EN_.KEY._UP,
          EN_.KEY._LEFT,
        ],
        speed: 3,
      });
      //vm.render(vm.cloud);
      //vm.render(vm.tree);
    }
  }
</script>

<style>
</style>
