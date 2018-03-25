<template>
  <div>
    <app-controller :curStatus="curStatus"></app-controller>
    <app-data-map :curStatus="curStatus" :curLevel="curLevel" :mapSize="mapSize"></app-data-map>
  </div>
</template>

<script>
  import * as EN_ from './include/Enums'
  import * as ME_ from './include/Methods'
  import * as PA_ from './include/Params'

  import { EventHandler } from './main'

  import appController from './components/Controller.vue'
  import appDataMap from './components/DataMap.vue'

  export default {
    data() {
      return {
        curStatus: EN_.STATUS._STOPPED,
        curLevel: PA_.INIT_GAME_LEVEL,
        mapSize: {
          width: PA_.DEFAULT_MAP_WIDTH,
          height: PA_.DEFAULT_MAP_HEIGHT,
        },
      };
    },
    methods: {

    },
    components: {
      appController,
      appDataMap,
    },
    created() {
      let vm = this;

      EventHandler.$on('statusChange', (args) => {
        vm.curStatus = args.status;

        if (vm.curStatus == EN_.STATUS._STOPPED) {
          vm.curLevel = PA_.INIT_GAME_LEVEL;;
        }
      });

      EventHandler.$on('levelChange', (args) => {
        vm.curLevel = args.level;
      });
    }
  }
</script>

<style>

</style>
