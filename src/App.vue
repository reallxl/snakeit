<template>
  <div>
    <app-game-map :mapSize="mapSize"></app-game-map>
  </div>
</template>

<script>
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
      appGameMap: GameMap
    },
    created() {

    }
  }
</script>

<style>

</style>
