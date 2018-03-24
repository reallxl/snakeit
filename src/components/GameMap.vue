<template>
  <div>
    <button @click="startGame" v-if="snake.bodyData.length == 0">Start</button>
    <button @click="pauseGame" v-else-if="!isNaN(stepProcID)">Pause</button>
    <button @click="resumeGame" v-else>Resume</button>
    <button @click="stepProc(snake, false)" v-if="snake.bodyData.length && isNaN(stepProcID)">Step</button>
    <button @click="resetGame">Reset</button>
    <p>
      body: {{ snake.length }} shown: {{ snake.bodyData.length }} <!--status: {{ effectModifier.type }}-->
      <template v-if="snake.bodyData.length != 0">
        head: ({{ snake.bodyData[0].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[0].pos / this.mapSize.width) }})
        tail: ({{ snake.bodyData[snake.bodyData.length - 1].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[snake.bodyData.length - 1].pos / this.mapSize.width) }})
      </template>
    </p>
    <app-canvas :mapSize="mapSize" :map="map" :colorSet="colorSet"></app-canvas>
  </div>
</template>

<script>
  import * as EN from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'

  import appCanvas from './Canvas.vue'

  export default {
    props: {
      mapSize: Object,
    },
    components: {
      appCanvas,
    },
    data() {
      return {
        stepProcID: NaN,
        curLevel: PA_.INIT_GAME_LEVEL,
        map: new Array(this.mapSize.width * this.mapSize.height).fill(null),
        colorSet: {
          backGround: PA_.DEFAULT_BG_COLOR,
          snake: PA_.DEFAULT_SNAKE_COLOR,
          prey: PA_.DEFAULT_PREY_COLOR,
        },
        snake: {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN._KEY._RIGHT,
        },
        prey: [],
        effectModifier: undefined,
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  public APIs
      //------------------------------------------------------------------------------------------
      startGame() {
        //--- hello snake!
        this.snake.bodyData.unshift({
          pos: 0,
        });
        this.snake.trailingData.unshift(this.mapSize.width - 1);
        this.map.splice(this.snake.bodyData[0].pos, 1, {
          type: EN._NODE_TYPE._SNAKE,
          color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
        });

        //--- hello prey!
        this.generateNewPrey();

        this.runPhase(EN._PHASE._SCHEDULE_NEXT_STEP);
      },
      pauseGame() {
        this.cancelStepProc();
      },
      resumeGame() {
        this.runPhase(EN._PHASE._SCHEDULE_NEXT_STEP);
      },
      resetGame() {
        this.cancelStepProc();

        this.curLevel = PA_.INIT_GAME_LEVEL;
        this.map.fill(null);
        this.snake = {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN._KEY._RIGHT,
        };
        this.prey.length = 0;
        this.effectModifier = undefined;

        return 0;
      },
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      stepProc(snakeData, scheduleNextStep = true) {
        let curPhase = EN._PHASE._PRE_STEP_MOVE, args = {
          snakeData: this.snake,
          scheduleNextStep: scheduleNextStep,
          res: 0,
        };

        while (curPhase != EN._PHASE._TERMINATE) {
           curPhase = this.runPhase(curPhase, args);
        }

        if (args.res < 0) {
          console.log('collide at:', this.DBGPOS(nextHeadPos));
          alert('Game Over!');
        } else {
          this.map.fill(null);
          this.snake.bodyData.forEach((bodyNode) => {
            this.map.splice(bodyNode.pos, 1, {
              type: EN._NODE_TYPE._SNAKE,
              color: this.snake.bodyData.indexOf(bodyNode) == 0 ?
                PA_.DEFAULT_SNAKE_HEAD_COLOR : PA_.DEFAULT_SNAKE_COLOR,
            });
          });
          this.prey.forEach((prey) => {
            this.map.splice(prey.pos, 1, {
              type: EN._NODE_TYPE._PREY,
            });
          });
        }
      },
      runPhase(phase, args = null) {
        let actionBody;

        //--- determine action body first
        if (this.effectModifier) {
          actionBody = this.effectModifier;
        } else {
          actionBody = this;
        }

        switch (phase) {
          case EN._PHASE._PRE_STEP_MOVE:
            return actionBody._runPreStepMovePhase(args);
          case EN._PHASE._HEAD_MOVE:
            return actionBody._runHeadMovePhase(args);
          case EN._PHASE._TAIL_MOVE:
            return actionBody._runTailMovePhase(args);
          case EN._PHASE._POST_STEP_MOVE:
            return actionBody._runPostStepMovePhase(args);
          case EN._PHASE._SCHEDULE_NEXT_STEP:
            return actionBody._runScheduleNextStepPhase(args);
        }
      },
      cancelStepProc() {
        clearTimeout(this.stepProcID);
        this.stepProcID = NaN;
      },
      generateNewPrey(effect = PA_.DEFAULT_EFFECT) {
        this.prey.unshift({
          pos: this.getRandomAvailablePos(),
          effect: effect,
        });
      },
      //------------------------------------------------------------------------------------------
      //  unit functions
      //------------------------------------------------------------------------------------------
      _runPreStepMovePhase(args) {
        return EN._PHASE._HEAD_MOVE;
      },
      _runHeadMovePhase(args) {
        let nextHeadPos = this.getNextPos(args.snakeData.bodyData[0].pos, args.snakeData.curHeadingDir);

        //--- colliding (i.e. GAME OVER)
        if (args.snakeData.bodyData.find((bodyNode) => {
          return bodyNode.pos == nextHeadPos;
        })) {
          args.res = -1;
          return EN._PHASE._TERMINATE;
        }

        /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
          newData = Object.assign({}, this.map[snakeData.curHeadPos]);
          newData.toDirCode = undefined;

          snakeData.curHeadPos = nextHeadPos;
          snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
          this.map.splice(snakeData.curHeadPos, 1, newData);
          break;
        }*/

        let foundPrey = this.prey.find((prey) => {
          return prey.pos == nextHeadPos;
        });
        if (foundPrey) {
          args.snakeData.length++;

          if (foundPrey.effect != EN._EFFECT._NORMAL) {
            this.effectModifier.update(foundPrey.effect);
          }

          this.prey.splice(this.prey.indexOf(foundPrey), 1);
          this.generateNewPrey();
        }

        //--- update current head position into bodyData
        args.snakeData.bodyData.unshift({
          pos: nextHeadPos,
        });

        return EN._PHASE._TAIL_MOVE;
      },
      _runTailMovePhase(args) {
        //--- update tail iff the body is completely in the map
        if (args.snakeData.bodyData.length > args.snakeData.length) {
          args.snakeData.trailingData.unshift(args.snakeData.bodyData.pop());

          //--- update trailingData
          if (args.snakeData.trailingData.length > args.snakeData.trailingLength) {
            args.snakeData.trailingData.pop();
          }
        }

        return EN._PHASE._POST_STEP_MOVE;
      },
      _runPostStepMovePhase(args) {
        if (args.scheduleNextStep) {
          return EN._PHASE._SCHEDULE_NEXT_STEP;
        } else {
          return EN._PHASE._TERMINATE;
        }
      },
      _runScheduleNextStepPhase(args) {
        let tick = (100 * (PA_.MAX_GAME_LEVEL - (this.curLevel - 1)));

        this.stepProcID = setTimeout(this.stepProc, tick, this.snake);
        return EN._PHASE._TERMINATE;
      },
      //------------------------------------------------------------------------------------------
      //  methods
      //------------------------------------------------------------------------------------------
      getRandomAvailablePos() {
        var pos;

        do {
          pos = Math.floor(Math.random() * ((this.mapSize.width * this.mapSize.height - 1) + 1));
        } while (this.map[pos] != null);

        return pos;
      },
      getNextPos(curPos, dir, repeatTime = 1, isContinuous = true) {
        var nextPos = curPos;

        do {
          switch (dir) {
            case EN._KEY._LEFT: {
              nextPos -= 1;
              if (isContinuous && (curPos % this.mapSize.width) == 0) {
                nextPos += this.mapSize.width;
              }
              break;
            }
            case EN._KEY._UP: {
              nextPos -= this.mapSize.width;
              if (isContinuous && nextPos < 0) {
                nextPos += (this.mapSize.width * this.mapSize.height);
              }
              break;
            }
            case EN._KEY._RIGHT: {
              nextPos += 1;
              if (isContinuous && (curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
                nextPos -= this.mapSize.width;
              }
              break;
            }
            case EN._KEY._DOWN: {
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
      			ret = EN._KEY._LEFT;
      			break;

      		case -this.mapSize.width:
      		case ((this.mapSize.height - 1) * this.mapSize.width):
      			ret = EN._KEY._UP;
      			break;
      		case 1:
      		case -(this.mapSize.width - 1):
      			ret = EN._KEY._RIGHT;
      			break;
      		case this.mapSize.width:
      		case -((this.mapSize.height - 1) * this.mapSize.width):
      			ret = EN._KEY._DOWN;
      			break;
      	}

      	return ret;
      },
      handleControlInput(dir) {
        if ((this.snake.bodyData.length == 1 && dir !=  this.getMovingDir(this.snake.bodyData[0].pos, this.snake.trailingData[0].pos)) ||
          dir != this.getMovingDir(this.snake.bodyData[0].pos, this.snake.bodyData[1].pos)) {
          this.snake.curHeadingDir = dir;
        }
      },
      DBGPOS(pos) {
        return [(pos % this.mapSize.width), Math.floor(pos / this.mapSize.width)];
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
          case EN._KEY._LEFT:
          case EN._KEY._UP:
          case EN._KEY._RIGHT:
          case EN._KEY._DOWN:
          case EN._KEY._BTN_A:
          case EN._KEY._BTN_B:
          case EN._KEY._BTN_C:
            event.preventDefault();
            vm.handleControlInput(event.keyCode);
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
