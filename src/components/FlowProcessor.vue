<template>
</template>

<script>
  import * as EN_ from '../include/Enums'
  import * as ME_ from '../include/Methods'
  import * as PA_ from '../include/Params'

  import { EventHandler } from '../main'
  import { mapOperatorMixin } from './MapOperatorMixin'

  import { CPhaseHandler } from './effectModifiers/CPhaseHandler'

  export default {
    props: {
      mapSize: Object,
      dataMap: Array,
      snake: Object,
      prey: Array,
    },
    mixins: [mapOperatorMixin],
    data() {
      return {
        stepProcID: NaN,
        phaseHandler: new CPhaseHandler(this),
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
           curPhase = this.phaseHandler.runPhase(curPhase, args);
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
    },
    //------------------------------------------------------------------------------------------
    //  primitive attributes
    //------------------------------------------------------------------------------------------
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
      })

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
