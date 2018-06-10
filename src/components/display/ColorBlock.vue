<template>
  <td :style="appearance"></td>
</template>

<script>
  export default {
    props: {
      data: String,
    },
    data() {
      return {
      };
    },
    methods: {
    },
    computed: {
      appearance() {
        return 'background-color: ' + this.data;
      },
    }
  }
</script>

<style>
td {
  border: 0;
  padding: 0 0 0 0;
  width: 15px;
  height: 15px;
}
</style>
