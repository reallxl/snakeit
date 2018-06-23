<template>
  <div>
    <button @click="startGame" v-if="curStatus == 0/*EN_.STATUS._STOPPED*/">Start</button>
    <button @click="resetGame" v-else>Reset</button>
  </div>
</template>

<script>
  import * as EN_ from '../include/Enums'

  import { appEventBus } from '../main'

  export default {
    props: {
      curStatus: Number,
    },
    components: {

    },
    data() {
      return {

      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  public APIs
      //------------------------------------------------------------------------------------------
      startGame() {
        appEventBus.$emit('gameStart');
      },
      resetGame() {
        appEventBus.$emit('gameReset');
      },
      //------------------------------------------------------------------------------------------
      //  control functions
      //------------------------------------------------------------------------------------------
      handleMovCtrl(dir) {
        appEventBus.$emit('movCtrlFire', {
          dir: dir,
        });
      },
      handleActCtrl(key) {
        appEventBus.$emit('actCtrlFire', {
          key: key,
        });
      },
    },
    //------------------------------------------------------------------------------------------
    //  primitive attributes
    //------------------------------------------------------------------------------------------
    created() {
      let vm = this;

      //--- monitor control inputs
      window.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
          //--- valid input values
          case EN_.KEY._LEFT:
          case EN_.KEY._UP:
          case EN_.KEY._RIGHT:
          case EN_.KEY._DOWN:
            event.preventDefault();
            vm.handleMovCtrl(event.keyCode);
            break;
          case EN_.KEY._BTN_A:
          case EN_.KEY._BTN_B:
          case EN_.KEY._BTN_C:
            event.preventDefault();
            vm.handleActCtrl(event.keyCode);
            break;

          default:
            break;
        }
      });
    },
  }
</script>

<style>

</style>
