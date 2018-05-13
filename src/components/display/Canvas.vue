<template>
  <table>
    <app-pixel
      v-for="col in mapSize.width"
      :idx="col - 1"
      :key="65535 + (col - 1)"
    ></app-pixel>
    <tr v-for="row in mapSize.height">
      <app-pixel
        v-for="col in mapSize.width"
        :data="dataMap ? dataMap[(row - 1) * mapSize.width + (col - 1)] : null"
        :colorSet="colorSet"
        :key="((row - 1) * mapSize.width + (col - 1))"
      ></app-pixel>
      <app-pixel
        :idx="row - 1"
        :key="65535 + (row - 1)"
      ></app-pixel>
    </tr>
  </table>
</template>

<script>
  import appPixel from './Pixel.vue'

  export default {
    props: {
      mapSize: Object,
      colorSet: Object,
      dataMap: Array,
    },
    components: {
      appPixel,
    },
    data() {
      return {

      };
    },
  }
</script>

<style>
</style>
