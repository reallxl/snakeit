<template>
  <app-canvas
    :mapSize="mapSize" :dataMap="dataMap"
  ></app-canvas>
</template>

<script>
  import * as EN_ from '../include/Enums'

  import appCanvas from './Canvas.vue'
  import appProcessor from './Processor.vue'

  export default {
    props: {
      mapSize: Object,
    },
    components: {
      appCanvas,
    },
    data() {
      return {
        dataMap: new Array(this.mapSize.width * this.mapSize.height).fill(null),
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  public APIs
      //------------------------------------------------------------------------------------------
      updatePos(pos, data) {
        this.dataMap.splice(pos, 1, data);
      },
      reset() {
        this.dataMap.fill(null);
      },
      getNextPos(curPos, dir, repeatTime = 1, isContinuous = true) {
        var nextPos = curPos;

        do {
          switch (dir) {
            case EN_.KEY._LEFT: {
              nextPos -= 1;
              if (isContinuous && (curPos % this.mapSize.width) == 0) {
                nextPos += this.mapSize.width;
              }
              break;
            }
            case EN_.KEY._UP: {
              nextPos -= this.mapSize.width;
              if (isContinuous && nextPos < 0) {
                nextPos += (this.mapSize.width * this.mapSize.height);
              }
              break;
            }
            case EN_.KEY._RIGHT: {
              nextPos += 1;
              if (isContinuous && (curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
                nextPos -= this.mapSize.width;
              }
              break;
            }
            case EN_.KEY._DOWN: {
              nextPos += this.mapSize.width;
              if (isContinuous && nextPos >= (this.mapSize.width * this.mapSize.height)) {
                nextPos -= (this.mapSize.width * this.mapSize.height);
              }
              break;
            }
          }
        } while (--repeatTime);

        return nextPos;
      },
      getRandomAvailablePos() {
        var pos;

        do {
          pos = Math.floor(Math.random() * ((this.mapSize.width * this.mapSize.height - 1) + 1));
        } while (map[pos] != null);

        return pos;
      },
      getMovingDir(fromPos, toPos) {
        var ret = undefined;

        switch (toPos - fromPos) {
          case -1:
          case (this.mapSize.width - 1):
            ret = EN_.KEY._LEFT;
            break;

          case -this.mapSize.width:
          case ((this.mapSize.height - 1) * this.mapSize.width):
            ret = EN_.KEY._UP;
            break;
          case 1:
          case -(this.mapSize.width - 1):
            ret = EN_.KEY._RIGHT;
            break;
          case this.mapSize.width:
          case -((this.mapSize.height - 1) * this.mapSize.width):
            ret = EN_.KEY._DOWN;
            break;
        }

        return ret;
      },
      //------------------------------------------------------------------------------------------
      //  debugging functions
      //------------------------------------------------------------------------------------------
      get2DPos(pos) {
        return [(pos % this.mapSize.width), Math.floor(pos / this.mapSize.width)];
      },
    },
  }
</script>

<style>

</style>
