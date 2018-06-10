<template>
  <td class="block">
    <table border="0" frame="void" rules="none">
      <tr v-for="row in height">
        <td class="pixel" v-for="col in width"
          :style="appearance((row - 1) * width + (col - 1))"
        ></td>
      </tr>
    </table>
  </td>
</template>

<script>
  import { BLOCK_WIDTH, BLOCK_HEIGHT } from '../../include/Params'

  export default {
    props: {
      data: Array,
    },
    data() {
      return {
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
      };
    },
    methods: {
      appearance(idx) {
        return 'background-color: ' + this.data[idx];
      },
    },
    computed: {
    }
  }
</script>

<style>
td {
  border: 0;
  padding: 0 0 0 0;
}

td.block {
  width: 15px;
  height: 15px;
}

td.pixel {
  width: 3px;
  height: 3px;
}
</style>
