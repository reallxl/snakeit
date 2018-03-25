<template>
  <table>
    <!--debugging-->
    <app-pixel
      v-for="col in mapSize.width"
      :idx="col - 1"
      :key="65535 + (col - 1)"
    ></app-pixel>
    <!--debugging-->
    <tr v-for="row in mapSize.height">
      <app-pixel
        v-for="col in mapSize.width"
        :data="dataMap[(row - 1) * mapSize.width + (col - 1)]"
        :colorSet="colorSet"
        :key="((row - 1) * mapSize.width + (col - 1))"
      ></app-pixel>
      <!--debugging-->
      <app-pixel
        :idx="row - 1"
        :key="65535 + (row - 1)"
      ></app-pixel>
      <!--debugging-->
    </tr>
  </table>
</template>

<script>
  import * as PA_ from '../include/Params'

  import appPixel from './Pixel.vue'

  export default {
    props: {
      mapSize: Object,
      dataMap: Array,
    },
    components: {
      appPixel,
    },
    data() {
      return {
        colorSet: {
          backGround: PA_.DEFAULT_BG_COLOR,
          snake: PA_.DEFAULT_SNAKE_COLOR,
          prey: PA_.DEFAULT_PREY_COLOR,
        },
      };
    },
  }
</script>

<style>
</style>
