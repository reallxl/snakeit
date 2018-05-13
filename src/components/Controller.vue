<template>
  <div>
    <button @click="startGame" v-if="curStatus == 0/*EN_.STATUS._STOPPED*/">Start</button>
    <button @click="resetGame" v-else>Reset</button>
  </div>
</template>

<script>
  import * as EN_ from '../include/Enums'

  import { EventBus } from '../main'

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
        EventBus.$emit('gameStart');
      },
      resetGame() {
        EventBus.$emit('gameReset');
      },
      //------------------------------------------------------------------------------------------
      //  control functions
      //------------------------------------------------------------------------------------------
      handleMovementControl(dir) {
        EventBus.$emit('movCtrlFire', {
          dir: dir,
        });
      },
      handleActionControl(key) {
        EventBus.$emit('actCtrlFire', {
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
            vm.handleMovementControl(event.keyCode);
            break;
          case EN_.KEY._BTN_A:
          case EN_.KEY._BTN_B:
          case EN_.KEY._BTN_C:
            event.preventDefault();
            vm.handleActionControl(event.keyCode);
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
