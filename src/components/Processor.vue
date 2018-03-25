<template>
</template>

<script>
  import * as EN_ from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'

  import { EventHandler } from '../main'

  export default {
    props: {
      mapSize: Object,
      dataMap: Array,
      snake: Object,
      prey: Array,
    },
    components: {

    },
    data() {
      return {
        stepProcID: NaN,
        effectModifier: null,
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  public APIs
      //------------------------------------------------------------------------------------------
      startNewRound(doAppointNextRound = true) {
        let curPhase = EN_.PHASE._PRE_STEP_MOVE, args = {
          snakeData: this.snake,
          doAppointNextRound: doAppointNextRound,
          res: 0,
        };

        while (curPhase != EN_.PHASE._TERMINATE) {
           curPhase = this._runPhase(curPhase, args);
        }

        if (args.res == 0) {
          //--- reset canvas
          this.dataMap.fill(null);

          //--- render snake
          this.snake.bodyData.forEach((bodyNode) => {
            this.dataMap.splice(bodyNode.pos, 1, {
              type: EN_.NODE_TYPE._SNAKE,
              color: this.snake.bodyData.indexOf(bodyNode) == 0 ?
                PA_.DEFAULT_SNAKE_HEAD_COLOR : PA_.DEFAULT_SNAKE_COLOR,
            });
          });

          //--- render prey
          this.prey.forEach((prey) => {
            this.dataMap.splice(prey.pos, 1, {
              type: EN_.NODE_TYPE._PREY,
            });
          });
        } else {
          //--- colliding (i.e. GAME OVER)
          console.log('collide at:', this.get2DPos(args.collidingPos));
          alert('Game Over!');

          EventHandler.$emit('gamePreReset');
        }
      },
      cancelCurRound() {
        clearTimeout(this.stepProcID);
        this.stepProcID = NaN;
      },
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      _runPhase(phase, args = null) {
        let actionBody;

        //--- determine action body first
        if (this.effectModifier) {
          actionBody = this.effectModifier;
        } else {
          actionBody = this;
        }

        switch (phase) {
          case EN_.PHASE._PRE_STEP_MOVE:
            return actionBody._runPreStepMovePhase(args);
          case EN_.PHASE._HEAD_MOVE:
            return actionBody._runHeadMovePhase(args);
          case EN_.PHASE._TAIL_MOVE:
            return actionBody._runTailMovePhase(args);
          case EN_.PHASE._POST_STEP_MOVE:
            return actionBody._runPostStepMovePhase(args);
          case EN_.PHASE._APPOINTMENT:
            return actionBody._runAppointmentPhase(args);
        }
      },
      _runPreStepMovePhase(args) {
        return EN_.PHASE._HEAD_MOVE;
      },
      _runHeadMovePhase(args) {
        let nextHeadPos = this.getNextPos(args.snakeData.bodyData[0].pos, args.snakeData.curHeadingDir);

        //--- colliding (i.e. GAME OVER)
        if (args.snakeData.bodyData.find((bodyNode) => {
          return bodyNode.pos == nextHeadPos;
        })) {
          args.res = -1;
          args.collidingPos = nextHeadPos;
          return EN_.PHASE._TERMINATE;
        }

        /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
          newData = Object.assign({}, this.dataMap[snakeData.curHeadPos]);
          newData.toDirCode = undefined;

          snakeData.curHeadPos = nextHeadPos;
          snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
          this.dataMap.splice(snakeData.curHeadPos, 1, newData);
          break;
        }*/

        let foundPrey = this.prey.find((prey) => {
          return prey.pos == nextHeadPos;
        });
        if (foundPrey) {
          args.snakeData.length++;

          if (foundPrey.effect != EN_.EFFECT._NORMAL) {
            this.effectModifier.update(foundPrey.effect);
          }

          this.prey.splice(this.prey.indexOf(foundPrey), 1);
          this.generateNewPrey();
        }

        //--- update current head position into bodyData
        args.snakeData.bodyData.unshift({
          pos: nextHeadPos,
        });

        return EN_.PHASE._TAIL_MOVE;
      },
      _runTailMovePhase(args) {
        //--- update tail iff the body is completely in the dataMap
        if (args.snakeData.bodyData.length > args.snakeData.length) {
          args.snakeData.trailingData.unshift(args.snakeData.bodyData.pop());

          //--- update trailingData
          if (args.snakeData.trailingData.length > args.snakeData.trailingLength) {
            args.snakeData.trailingData.pop();
          }
        }

        return EN_.PHASE._POST_STEP_MOVE;
      },
      _runPostStepMovePhase(args) {
        if (args.doAppointNextRound) {
          return EN_.PHASE._APPOINTMENT;
        } else {
          return EN_.PHASE._TERMINATE;
        }
      },
      _runAppointmentPhase(args) {
        let tick = (100 * (PA_.MAX_GAME_LEVEL - (PA_.INIT_GAME_LEVEL - 1)));

        this.stepProcID = setTimeout(this.startNewRound, tick);
        return EN_.PHASE._TERMINATE;
      },
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      getNextPos(curPos, dir, repeatTime = 1, isContinuous = true) {
        var nextPos = curPos;

        do {
          switch (dir) {
            case EN_.KEY._LEFT: {
              nextPos -= 1;
                if (isContinuous && (curPos % this.mapSize.width) == 0) {
                nextPos += this.mapSize.width;
              }
              break;
            }
            case EN_.KEY._UP: {
              nextPos -= this.mapSize.width;
              if (isContinuous && nextPos < 0) {
                nextPos += (this.mapSize.width * this.mapSize.height);
              }
              break;
            }
            case EN_.KEY._RIGHT: {
              nextPos += 1;
              if (isContinuous && (curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
                nextPos -= this.mapSize.width;
              }
              break;
            }
            case EN_.KEY._DOWN: {
              nextPos += this.mapSize.width;
              if (isContinuous && nextPos >= (this.mapSize.width * this.mapSize.height)) {
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
      generateNewPrey(effect = PA_.DEFAULT_EFFECT) {
        this.prey.unshift({
          pos: this.getRandomAvailablePos(),
          effect: effect,
        });
      },
      //------------------------------------------------------------------------------------------
      //  DEBUG functions
      //------------------------------------------------------------------------------------------
      get2DPos(pos) {
        return [(pos % this.mapSize.width), Math.floor(pos / this.mapSize.width)];
      },
    },
    created() {
      let vm = this;

      EventHandler.$on('gameStart', () => {
        vm.startNewRound();

        EventHandler.$emit('statusChange', {
          status: EN_.STATUS._PLAYING,
        });
      });

      EventHandler.$on('gamePause', () => {
        vm.cancelCurRound();

        EventHandler.$emit('statusChange', {
          status: EN_.STATUS._PAUSED,
        });
      });

      EventHandler.$on('gameResume', () => {
        vm.startNewRound();

        EventHandler.$emit('statusChange', {
          status: EN_.STATUS._PLAYING,
        });
      });

      EventHandler.$on('gamePreReset', () => {
        vm.cancelCurRound();

        EventHandler.$emit('gameReset');
      });
    },
  }
</script>

<style>
</style>
