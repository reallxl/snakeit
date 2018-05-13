<template>
  <td v-if="idx != undefined" style="width: 10px; height: 10px; font-size: 10%;">{{ idx }}</td>
  <td v-else style="width: 15px; height: 15px;" :style="dynamicAppearance"></td>
</template>

<script>
  import { NODE_TYPE } from "../../include/Enums"

  export default {
    props: {
      data: Object,
      colorSet: Object,
      idx: Number,
    },
    computed: {
      dynamicAppearance() {
        var ret;

        if (this.data == null) {
          ret = this.colorSet.backGround;
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
      }
    }
  }
</script>

<style>
</style>
