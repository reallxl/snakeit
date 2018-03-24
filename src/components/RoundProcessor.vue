<template>
</template>

<script>
import * as EN from '../include/Enums'
import * as ME from '../include/Methods'
import * as PA_ from '../include/Params'

export default {
  props: {
    mapSize: Object,
    map: Array,
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
    runRound(scheduleNextStep = true) {
      console.log('runRound');
      let curPhase = EN._PHASE._PRE_STEP_MOVE, args = {
        snakeData: this.snake,
        scheduleNextStep: scheduleNextStep,
        res: 0,
      };

      while (curPhase != EN._PHASE._TERMINATE) {
        console.log(curPhase);
         curPhase = this.runPhase(curPhase, args);
      }

      if (args.res == 0) {
        //--- reset canvas
        this.map.fill(null);

        //--- render snake
        this.snake.bodyData.forEach((bodyNode) => {
          this.map.splice(bodyNode.pos, 1, {
            type: EN._NODE_TYPE._SNAKE,
            color: this.snake.bodyData.indexOf(bodyNode) == 0 ?
              PA_.DEFAULT_SNAKE_HEAD_COLOR : PA_.DEFAULT_SNAKE_COLOR,
          });
        });

        //--- render prey
        this.prey.forEach((prey) => {
          this.map.splice(prey.pos, 1, {
            type: EN._NODE_TYPE._PREY,
          });
        });
      } else {
        //--- colliding (i.e. GAME OVER)
        console.log('collide at:', ME.DBGPOS(this.mapSize, args.collidingPos));
        alert('Game Over!');

        this.stepProcID = NaN;
        this.$emit('gameTerminating');
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
    cancelRound() {
      clearTimeout(this.stepProcID);
      this.stepProcID = NaN;
    },
    //------------------------------------------------------------------------------------------
    //  phase functions
    //------------------------------------------------------------------------------------------
    _runPreStepMovePhase(args) {
      return EN._PHASE._HEAD_MOVE;
    },
    _runHeadMovePhase(args) {
      let nextHeadPos = ME.getNextPos(this.mapSize, args.snakeData.bodyData[0].pos, args.snakeData.curHeadingDir);
      console.log(ME.DBGPOS(nextHeadPos));
      //--- colliding (i.e. GAME OVER)
      if (args.snakeData.bodyData.find((bodyNode) => {
        return bodyNode.pos == nextHeadPos;
      })) {
        args.res = -1;
        args.collidingPos = nextHeadPos;
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
      let tick = (100 * (PA_.MAX_GAME_LEVEL - (PA_.INIT_GAME_LEVEL - 1)));

      this.stepProcID = setTimeout(this.runRound, tick);
      return EN._PHASE._TERMINATE;
    },
    //------------------------------------------------------------------------------------------
    //  private functions
    //------------------------------------------------------------------------------------------
    generateNewPrey(effect = PA_.DEFAULT_EFFECT) {
      this.prey.unshift({
        pos: ME.getRandomAvailablePos(this.mapSize, this.map),
        effect: effect,
      });
    },
  },
}
</script>

<style>
</style>
