<template>
  <div>
    <button @click="startGame" v-if="curStatus == 0/*EN_.STATUS._STOPPED*/">Start</button>
    <button @click="pauseGame" v-else-if="curStatus == 1/*EN_.STATUS._PLAYING*/">Pause</button>
    <button @click="resumeGame" v-else-if="curStatus == 2/*EN_.STATUS._PAUSED*/">Resume</button>
    <button @click="stepMove" v-if="curStatus != 0/*EN_.STATUS._STOPPED*/">Step</button>
    <button @click="resetGame">Reset</button>
  </div>
</template>

<script>
  import * as EN_ from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'

  import { EventHandler } from '../main'

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
        EventHandler.$emit('gamePreStart');
      },
      pauseGame() {
        EventHandler.$emit('gamePause');
      },
      resumeGame() {
        EventHandler.$emit('gameResume');
      },
      stepMove() {
        EventHandler.$emit('stepMove');
      },
      resetGame() {
        EventHandler.$emit('gamePreReset');
      },
      //------------------------------------------------------------------------------------------
      //  control functions
      //------------------------------------------------------------------------------------------
      handleMovementControl(dir) {
        EventHandler.$emit('movCtrlFire', {
          dir: dir,
        });
      },
      handleActionControl(key) {
        EventHandler.$emit('actCtrlFire', {
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
