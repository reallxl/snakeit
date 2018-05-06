import * as EN_ from '../include/Enums'

export const mapOperatorMixin = {
  methods: {
    getNextPos(curPos, dir, repeatTime = 1) {
      var nextPos = curPos;

      do {
        switch (dir) {
          case EN_.KEY._LEFT: {
            nextPos -= 1;
              if ((curPos % this.mapSize.width) == 0) {
              nextPos += this.mapSize.width;
            }
            break;
          }
          case EN_.KEY._UP: {
            nextPos -= this.mapSize.width;
            if (nextPos < 0) {
              nextPos += (this.mapSize.width * this.mapSize.height);
            }
            break;
          }
          case EN_.KEY._RIGHT: {
            nextPos += 1;
            if ((curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
              nextPos -= this.mapSize.width;
            }
            break;
          }
          case EN_.KEY._DOWN: {
            nextPos += this.mapSize.width;
            if (nextPos >= (this.mapSize.width * this.mapSize.height)) {
              nextPos -= (this.mapSize.width * this.mapSize.height);
            }
            break;
          }
        }
      } while (--repeatTime);

      return nextPos;
    },
    getMovingDir(fromPos, toPos) {
      var ret = undefined;

      switch (toPos - fromPos) {
        case -1:
        case (this.mapSize.width - 1):
          ret = EN_.KEY._LEFT;
          break;

        case -this.mapSize.width:
        case ((this.mapSize.height - 1) * this.mapSize.width):
          ret = EN_.KEY._UP;
          break;
        case 1:
        case -(this.mapSize.width - 1):
          ret = EN_.KEY._RIGHT;
          break;
        case this.mapSize.width:
        case -((this.mapSize.height - 1) * this.mapSize.width):
          ret = EN_.KEY._DOWN;
          break;
      }

      return ret;
    },
    getRandomAvailablePos() {
      var pos;

      do {
        pos = Math.floor(Math.random() * ((this.mapSize.width * this.mapSize.height - 1) + 1));
      } while (this.dataMap[pos] != null);

      return pos;
    },
    //------------------------------------------------------------------------------------------
    //  DEBUG functions
    //------------------------------------------------------------------------------------------
    get2DPos(pos) {
      return [(pos % this.mapSize.width), Math.floor(pos / this.mapSize.width)];
    },
  },
};
