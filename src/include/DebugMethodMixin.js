export const DebugMethodMixin = {
  methods: {
    get2DPos(pos) {
      return [(pos % this.mapSize.width), Math.floor(pos / this.mapSize.width)];
    },
  },
}
