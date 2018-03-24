<template>
  <div>
    <app-panel></app-panel>
    <app-game-map :mapSize="mapSize"></app-game-map>
  </div>
</template>

<script>
  import ControlPanel from './components/ControlPanel.vue';
  import GameMap from './components/GameMap.vue';

  export default {
    data() {
      return {
        isGameStarted: false,
        mapSize: { width: 20, height: 10 }
      };
    },
    methods: {
      startGame() {

      }
    },
    components: {
      appPanel: ControlPanel,
      appGameMap: GameMap
    },
    created() {

    }
  }
</script>

<style>

</style>
