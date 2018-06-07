<template>
  <td class="PixelBlock" v-if="data">
    <table border="0" frame="void" rules="none">
      <tr v-for="row in data.height">
        <td v-for="col in data.width"
          :colorSet="colorSet"
          :style="pixelAppearance((row - 1) * data.width + (col - 1))"
        ></td>
      </tr>
    </table>
  </td>
  <td class="PixelBlock" v-else
    :style="PixelBlockAppearance"></td>
</template>

<script>
  //:data="data.dataList[(row - 1) * data.width + (col - 1)]"
  //:key="superKey + ((row - 1) * data.width + (col - 1))"
  import { NODE_TYPE } from "../../include/Enums"

  export default {
    props: {
      data: Object,
      colorSet: Object,
    },
    methods: {
      pixelAppearance(idx) {
        let bgColor = this.colorSet.snake;

        if (this.data.dataMap[idx]) {
          bgColor = this.data.dataMap[idx];
          //bgColor = this.data.colorList[this.data.dataMap[idx] - 1];
        }

        //bgColor = idx % 2 ? '#000000' : '#FA5838';
        /*if (this.data.color) {
          ret = this.data.color;
        } else {
          //--- default color codes
          switch (this.data.type) {
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
          }
        }*/

        return ('width: ' + 15 / (this.data.width || 1) + 'px; height: ' + 15 / (this.data.height || 1) + 'px; background-color: ' + bgColor);
      },
    },
    computed: {
      PixelBlockAppearance() {
        let ret;

        if (this.data == null) {
          ret = this.colorSet.backGround;
          ret = this.colorSet.snake;
        } else if (this.data.color) {
          ret = this.data.color;
        } else {
          //--- default color codes
          switch (this.data.type) {
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
          }
        }

        return ('background-color: ' + ret);
      },
    }
  }
</script>

<style>
td {
  border: 0;
  padding: 0 0 0 0;
}

td.PixelBlock {
  width: 15px;
  height: 15px;
}
</style>
