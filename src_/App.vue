<template>
  <app-resource-manager
    :mapSize="mapSize" :snake="snake" :prey="prey"
  ></app-resource-manager>
</template>

<script>
  import * as EN_ from './include/Enums'
  import * as PA_ from './include/Params'

  import appResourceManager from './components/ResourceManager.vue'

  export default {
    props: {

    },
    components: {
      appResourceManager,
    },
    data() {
      return {
        mapSize: {
          width: PA_.DEFAULT_MAP_WIDTH,
          height: PA_.DEFAULT_MAP_HEIGHT,
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
  }
</script>

<style>

</style>
