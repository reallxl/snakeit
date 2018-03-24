<template>
  <div>
    <button @click="startGame" v-if="snake.bodyData.length == 0">Start</button>
    <button @click="pauseGame" v-else-if="!isNaN(stepProcID)">Pause</button>
    <button @click="resumeGame" v-else>Resume</button>
    <button @click="_stepMove(snake, false)" v-if="snake.bodyData.length && isNaN(stepProcID)">Step</button>
    <button @click="resetGame">Reset</button>
    <p>
      body: {{ snake.length }} shown: {{ snake.bodyData.length }} status: {{ effectModifier.type }}
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
          curHeadingDir: EN._DIR._RIGHT,
        },
        effectModifier: undefined,
      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  public APIs
      //------------------------------------------------------------------------------------------
      startGame() {
        //--- hello world!
        this.snake.bodyData.unshift({
          pos: 0,
        });
        this.snake.trailingData.unshift(this.mapSize.width - 1);
        this.map.splice(this.snake.bodyData[0].pos, 1, {
          type: EN._NODE_TYPE._SNAKE,
          color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
        });

        //--- hello my prey!
        this._scoutNewPrey();

        this._scheduleNextStep();
      },
      pauseGame() {
        this._cancelNextStep();
      },
      resumeGame() {
        this._scheduleNextStep();
      },
      resetGame() {
        this._cancelNextStep();

        this.curLevel = PA_.INIT_GAME_LEVEL;
        this.map.fill(null);
        this.snake = {
          length: PA_.INIT_BODY_LENGTH,
          bodyData: [],
          trailingLength: PA_.INIT_TRAILING_LENGTH,
          trailingData: [],
          curHeadingDir: EN._DIR._RIGHT,
        };
        this.effectModifier = undefined;

        return 0;
      },
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      runPhase(phase, args) {
        //--- determine action body first
        let actionBody;
        if (this.effectModifier) {
          actionBody = this.effectModifier;
        } else {
          actionBody = this;
        }

        switch (phasee) {
          case EN._PHASE._PRE_STEP_MOVE:
            return actionBody.runPreStepMovePhase(args);
          case EN._PHASE._HEAD_MOVE:
            return actionBody.runHeadMovePhase(args);
          case EN._PHASE._TAIL_MOVE:
            return actionBody.runTailMovePhase(args);
          case EN._PHASE._POST_STEP_MOVE:
            return actionBody.runPostStepMovePhase(args);
          case EN._PHASE._SCHEDULE_NEXT_STEP:
            return actionBody.runStepInitPhase(args);
        }
      },
      runPreStepMovePhase(args) {
        return {
          curPhase: EN._PHASE._HEAD_MOVE,
          args: {},
        };
      },
      runHeadMovePhase(args) {
        let nextHeadPos = this.getNextPos(snakeData.bodyData[0].pos, snakeData.curHeadingDir);

        //--- colliding (i.e. GAME OVER)
        if (snakeData.bodyData.find((bodyNode) => {
          return bodyNode.pos == nextHeadPos;
        })) {
          console.log('collide at:', this.DBGPOS(nextHeadPos));
          alert('Game Over!');
          return this.resetGame();
        }

        /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
          newData = Object.assign({}, this.map[snakeData.curHeadPos]);
          newData.toDirCode = undefined;

          snakeData.curHeadPos = nextHeadPos;
          snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
          this.map.splice(snakeData.curHeadPos, 1, newData);
          break;
        }*/

        //--- update current head position into bodyData
        snakeData.bodyData.unshift({
          pos: nextHeadPos,
        });

        return {
          curPhase: EN._PHASE._TAIL_MOVE,
          args: {},
        };
      },
      runTailMovePhase(args) {
        //--- update tail iff the body is completely in the map
        if (snakeData.bodyData.length > snakeData.length) {
          snakeData.trailingData.unshift(snakeData.bodyData.pop());

          //--- update trailingData
          if (snakeData.trailingData.length > snakeData.trailingLength) {
            snakeData.trailingData.pop();
          }
        }

        return {
          curPhase: EN._PHASE._SCHEDULE_NEXT_STEP,
          args: {},
        };
      },
      _stepMove(snakeData, scheduleNext = true) {
        var params = {
          curPhase: EN._PHASE._PRE_STEP_MOVE,
          args: {},
        };

        while (params.curPhase != EN._PHASE._SCHEDULE_NEXT_STEP) {
           params = this.runPhase(params.curPhase, params.args);
        }

        if (scheduleNextStep) {
          this.runPhase(params);
        }
















        do {
          if (this.effectModifier.type == EN._EFFECT._SPLIT && snakeData == this.snake) {
            snakeData.split.forEach((split) => {
              this._stepMove(split, false);
            });
          } else if (this.effectModifier.type == EN._EFFECT._FROZEN) {
            if (this._applyFrozenEffect({
              action: EN._PHASE._STEP_MOVE,
            })) {
              break;
            }
          } else if (this.effectModifier.type == EN._EFFECT._BOMBER) {
            this._applyBomberEffect({
              action: EN._PHASE._STEP_MOVE,
            });
          }

          //--- phase 1: head move
          do {
            let nextHeadPos, curPrey = undefined;

            //--- determine next head position
            if (this.effectModifier.type == EN._EFFECT._CIRCULATED) {
              nextHeadPos = this._applyCirculatedEffect({
                action: EN._PHASE._HEAD_MOVE,
              });
            } else if (this.effectModifier.type == EN._EFFECT._DIMENSIONAL) {
              nextHeadPos = this._applyDimensionalEffect({
                action: EN._PHASE._HEAD_MOVE,
              });
            } else if (this.effectModifier.type == EN._EFFECT._WORMLIKE && this._applyWormlikeEffect({
                action: EN._PHASE._HEAD_MOVE,
              })) {
              break;
            } else {
              nextHeadPos = this.getNextPos(snakeData.bodyData[0].pos, snakeData.curHeadingDir);
            }

            let isColliding = false;

            if (this.effectModifier.type == EN._EFFECT._SPLIT) {
              if (this.snake.bodyData.find((bodyNode) => {
                return bodyNode.pos == nextHeadPos;
              })) {
                isColliding = true;
              } else {
                this.effectModifier.split.forEach((split) => {
                  if (split.bodyData.find((bodyNode) => {
                    return bodyNode.pos == nextHeadPos;
                  })) {
                    isColliding = true;
                  }
                });
              }
            } else {
              if (snakeData.bodyData.find((bodyNode) => {
                return bodyNode.pos == nextHeadPos;
              })) {
                isColliding = true;
              }
            }

            if (isColliding) {
              //--- colliding (i.e. GAME OVER)
              console.log('collide at:', this.DBGPOS(nextHeadPos));
              alert('Game Over!');
              return this.resetGame();
            }

            /*if (nextHeadPos == snakeData.curTailPos && snakeData.curLength == snakeData.length) {
              newData = Object.assign({}, this.map[snakeData.curHeadPos]);
              newData.toDirCode = undefined;

              snakeData.curHeadPos = nextHeadPos;
              snakeData.curTailPos = this.getNextPos(snakeData.curTailPos);
              this.map.splice(snakeData.curHeadPos, 1, newData);
              break;
            }*/

            //--- erase previous head highlight on map
            this.map.splice(snakeData.bodyData[0].pos, 1, {
              type: EN._NODE_TYPE._SNAKE,
            });

            //--- update current head position into bodyData
            if (this.effectModifier.type == EN._EFFECT._MUTANT) {
              this._applyMutantEffect({
                action: EN._PHASE._HEAD_MOVE,
                nextHeadPos: nextHeadPos,
              });
            } else if (this.effectModifier.type == EN._EFFECT._ENLARGED) {
              this._applyEnlargedEffect({
                action: EN._PHASE._HEAD_MOVE,
                nextHeadPos: nextHeadPos,
              });
            } else {
              snakeData.bodyData.unshift({
                pos: nextHeadPos,
              });
            }

            if (this.map[snakeData.bodyData[0].pos] && this.map[snakeData.bodyData[0].pos].type == EN._NODE_TYPE._PREY) {
              this._devourPrey(snakeData.bodyData[0].pos, snakeData);
            }

            //--- highlight current head position on map
            if (snakeData == this.snake) {
              this.map.splice(snakeData.bodyData[0].pos, 1, {
                type: EN._NODE_TYPE._SNAKE,
                color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
              });
            } else if (this.effectModifier.type == EN._EFFECT._SPLIT && this.effectModifier.split.indexOf(snakeData) == this.snake.curSplitCtrlID) {
              this.map.splice(snakeData.bodyData[0].pos, 1, {
                type: EN._NODE_TYPE._SNAKE,
                color: '#5858FA',
              });
            } else {
              this.map.splice(snakeData.bodyData[0].pos, 1, {
                type: EN._NODE_TYPE._SNAKE,
              });
            }
          } while (0);

          //--- phase 2: tail move
          do {
            //--- update tail iff the body is completely in the map
            if (snakeData.bodyData.length > snakeData.length ||
              (this.effectModifier.type == EN._EFFECT._WORMLIKE && this._applyWormlikeEffect({
                  action: EN._PHASE._TAIL_MOVE,
                }))) {
              //--- tail move
              if (this.effectModifier.type == EN._EFFECT._MUTANT) {
                this._applyMutantEffect({
                  action: EN._PHASE._TAIL_MOVE,
                });
              }

              if (this.effectModifier.type == EN._EFFECT._ENLARGED) {
                this._applyEnlargedEffect({
                  action: EN._PHASE._TAIL_MOVE,
                });
              } else {
                this.map.splice(snakeData.bodyData[snakeData.bodyData.length - 1].pos, 1, null);
              }

              snakeData.trailingData.unshift(snakeData.bodyData.pop());
              if (snakeData.trailingData.length > snakeData.trailingLength) {
                snakeData.trailingData.pop();
              }
            }

            if (this.effectModifier.type == EN._EFFECT._CHAMELEONIC) {
              this._applyChameleonicEffect();
            }
          } while (0);
        } while (0);

        //--- phase 3: schedule next step
        if (this.effectModifier.type == EN._EFFECT._DRUNK) {
          this._applyDrunkEffect({
            action: EN._PHASE._STEP_MOVE,
          });
        } else if (scheduleNextStep) {
          this._scheduleNextStep();
        }
      },
      _scheduleNextStep() {
        var tick = (100 * (PA_.MAX_GAME_LEVEL - (this.curLevel - 1)));

        if (this.effectModifier.type == EN._EFFECT._DRUNK) {
          tick = this._applyDrunkEffect({
            action: EN._PHASE._SCHEDULE_NEXT_STEP,
            tick: tick,
          });
        } else if (this.effectModifier.type == EN._EFFECT._HYPED) {
          tick = this._applyHypedEffect({ tick: tick });
        }

        this.stepProcID = setTimeout(this._stepMove, tick, this.snake);
      },
      _cancelNextStep() {
        clearTimeout(this.stepProcID);
        this.stepProcID = NaN;
      },
      _devourPrey(pos, snakeData) {
        snakeData.length++;

        if (this.map[pos].color == PA_.DEFAULT_SNAKE_COLOR) {
          //--- collecting left body parts only
        } else {
          //--- apply new prey effects
          switch (this.map[pos].effect) {
            case EN._EFFECT._REVERSED: this._applyReversedEffect(); break;
            case EN._EFFECT._ENLARGED: this._applyEnlargedEffect({
                action: EN._PHASE._INIT,
              }); break;
            case EN._EFFECT._MUTANT: this._applyMutantEffect({
                action: EN._PHASE._INIT,
              }); break;
            case EN._EFFECT._SPLIT: this._applySplitEffect({
                action: EN._PHASE._INIT,
                snakeData: snakeData,
              }); break;
            case EN._EFFECT._CIRCULATED: this._applyCirculatedEffect({
                action: EN._PHASE._INIT,
              }); break;
            case EN._EFFECT._EARTHQUAKE: this._applyEarthQuakeEffect(); break;
            case EN._EFFECT._BOMBER: this._applyBomberEffect({
                action: EN._PHASE._INIT,
              }); break;
            case EN._EFFECT._WORMLIKE: this._applyWormlikeEffect({
                action: EN._PHASE._INIT,
              }); break;
          }

          this._scoutNewPrey();
        }
      },
      _scoutNewPrey(effect = PA_.DEFAULT_EFFECT) {
        this.map.splice(this.getRandomAvailablePos(), 1, {
            type: EN._NODE_TYPE._PREY,
            effect: effect,
          });
      },
      //------------------------------------------------------------------------------------------
      //  effect functions
      //------------------------------------------------------------------------------------------
      _applyReversedEffect(arg) {
        if (this.effectModifier.type != EN._EFFECT._REVERSED) {
          this.effectModifier = {
            type: EN._EFFECT._REVERSED,
          };
        }

        if (this.snake.length > this.snake.bodyData.length) {
          //--- update total body length if needed
          this.snake.length = this.snake.bodyData.length;
        }

        //--- predict virtual trailing data
        var nextHeadPos = this.getNextPos(this.snake.bodyData[0].pos, this.snake.curHeadingDir);

        this.snake.curHeadingDir = this.getMovingDir(this.snake.bodyData[this.snake.bodyData.length - 1].pos, this.snake.trailingData[0].pos);
        this.snake.bodyData.reverse();
        this.snake.trailingData = [{
          pos: nextHeadPos,
        }];

        this.map.splice(this.snake.bodyData[0].pos, 1, {
          type: EN._NODE_TYPE._SNAKE,
          color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
        });
        this.map.splice(this.snake.bodyData[this.snake.bodyData.length - 1].pos, 1, {
          type: EN._NODE_TYPE._SNAKE,
        });
      },
      _applyDrunkEffect(arg) {
        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._DRUNK) {
              this.effectModifier = {
                type: EN._EFFECT._DRUNK,
                drunkFactor: 0,
              };
            }

            break;
          }
          case EN._PHASE._STEP_MOVE: {
            if (this.effectModifier.drunkFactor >= 0) {
              let drunkLvl = PA_.DRUNK_LEVEL[Math.floor(Math.random() * ((PA_.DRUNK_LEVEL.length - 1) + 1))];

              if ((drunkLvl > PA_.DRUNK_LEVEL_PENALTY) && (this.effectModifier.drunkFactor > PA_.DRUNK_MAX_STEP)) {
                let drunkStep = (Math.floor(Math.random() * PA_.DRUNK_MAX_STEP) + 1);

//                this.colorSet.snake = PA_.FROZEN_COLOR;
                this.effectModifier.drunkFactor = -1;
                this._applyReversedEffect();

                let intervalID = setInterval(() => {
                    this._stepMove(this.snake, false);

                    if (--drunkStep == 0) {
                      clearInterval(intervalID);

                      this._applyReversedEffect();
                      this.effectModifier.drunkFactor = 0;
//                      this.colorSet.snake = PA_.DEFAULT_SNAKE_COLOR;
                      this._scheduleNextStep();
                    }
                  }, (1000 / drunkLvl));
              } else {
                this.effectModifier.drunkFactor++;
                this._scheduleNextStep();
              }
            }

            break;
          }
          case EN._PHASE._SCHEDULE_NEXT_STEP: {
            return (arg.tick / PA_.DRUNK_LEVEL[Math.floor(Math.random() * ((PA_.DRUNK_LEVEL.length - 1) + 1))]);
          }
          case EN._PHASE._CTRL_INPUT: {
            //--- block if being too drunk
            return (this.effectModifier.drunkFactor < 0);
          }
        }
      },
      _applyUpsideDownEffect(arg) {
        if (this.effectModifier.type != EN._EFFECT._UPSIDEDOWN) {
          this.effectModifier = {
            type: EN._EFFECT._UPSIDEDOWN,
          };
        }

        return ME_.reverseDir(arg.dir);
      },
      _applyHypedEffect(arg) {
        if (this.effectModifier.type != EN._EFFECT._HYPED) {
          this.effectModifier = {
            type: EN._EFFECT._HYPED,
          };
        }

        return (arg.tick / (Math.floor(Math.random() * (PA_.HYPED_LEVEL[PA_.HYPED_LEVEL.length - 1] - PA_.HYPED_LEVEL[0] + 1)) + PA_.HYPED_LEVEL[0]));
      },
      _applyChameleonicEffect(arg) {
        if (this.effectModifier.type != EN._EFFECT._CHAMELEONIC) {
          this.effectModifier = {
            type: EN._EFFECT._CHAMELEONIC,
            curChameleonicLvlID: 0,
          };
        }

        this.effectModifier.curChameleonicLvlID = ((this.effectModifier.curChameleonicLvlID + 1) % PA_.CHAMELEONIC_LEVEL.length);
        this.colorSet.snake = PA_.CHAMELEONIC_COLOR[PA_.CHAMELEONIC_LEVEL[this.effectModifier.curChameleonicLvlID]];

        /*var curPos, newData;
        curPos = this.snake.curTailPos;
        for (let i = 0; i < this.snake.curLength; i++) {
          if (i / this.snake.curLength > 0.4 && i / this.snake.curLength < 0.6) {
            newData = Object.assign({}, this.map[curPos]);
            newData.color = PA_.DEFAULT_SNAKE_COLOR;
            this.map.splice(curPos, 1, newData);
          }

          curPos = this.getNextPos(curPos);
        }*/
      },
      _applyEnlargedEffect(arg) {
        let markBodySpanNode = (pos, type) => {
console.log('pos:',this.DBGPOS(pos),'type:',type);
          if (type == null) {
            //--- clear
            if (this.snake.bodyData.find((bodyNode) => {
              return bodyNode.pos == pos;
            })) {
              this.map.splice(pos, 1, {
                type: EN._NODE_TYPE._SNAKE,
              });
            } else {
              this.map.splice(pos, 1, null);
            }
          } else {
            this.map.splice(pos, 1, {
              type: type,
            });
          }
        };

        let updateBodySpan = (fromPos, toDir, isRendering = true) => {
          let curSpanningLvl = 0, curPos = fromPos;

          while (curSpanningLvl <= this.effectModifier.curRatio) {
            let leftSpanPos = curPos, rightSpanPos = curPos;

            if (curSpanningLvl > 0) {
              if (isRendering) {

                if (this.map[curPos] && this.map[curPos].type == EN._NODE_TYPE._PREY) {
                  this._devourPrey(curPos, this.snake);
                }

                markBodySpanNode(curPos, EN._NODE_TYPE._SNAKE_SPAN);
                this.effectModifier.headSpanPos.push(curPos);
              } else {
                markBodySpanNode(curPos, null);
              }
            }

            for (let i = 0; i < this.effectModifier.curRatio - curSpanningLvl; i++) {
              leftSpanPos = this.getNextPos(leftSpanPos, (toDir + 3) % 4);
              rightSpanPos = this.getNextPos(rightSpanPos, (toDir + 1) % 4);

              if (isRendering) {
                let newEffect = undefined;

                if (this.map[leftSpanPos] && this.map[leftSpanPos].type == EN._NODE_TYPE._PREY) {
console.log(curSpanningLvl,i,'L prey at',this.DBGPOS(leftSpanPos));
                  newEffect = this.map[leftSpanPos].effect;
                  this.map[leftSpanPos] = null;
                } else if (this.map[rightSpanPos] && this.map[rightSpanPos].type == EN._NODE_TYPE._PREY) {
console.log(curSpanningLvl,i,'R prey at',this.DBGPOS(rightSpanPos));
                  newEffect = this.map[rightSpanPos].effect;
                  this.map[rightSpanPos] = null;
                }

                if (newEffect != undefined) {
                  this.snake.length++;

                  switch (this.effectModifier.type) {
                    case EN._EFFECT._REVERSED: this._applyReversedEffect(); break;
                    case EN._EFFECT._ENLARGED: this._applyEnlargedEffect({
                      action: EN._PHASE._INIT,
                    }); break;
                    case EN._EFFECT._MUTANT: this._applyMutantEffect(); break;
                    case EN._EFFECT._SPLIT: this._applySplitEffect(); break;
                  }

                  this._scoutNewPrey();
                }

                markBodySpanNode(leftSpanPos, EN._NODE_TYPE._SNAKE_SPAN);
                markBodySpanNode(rightSpanPos, EN._NODE_TYPE._SNAKE_SPAN);
                this.effectModifier.headSpanPos.push(leftSpanPos, rightSpanPos);
              }  else {
                markBodySpanNode(leftSpanPos, null);
                markBodySpanNode(rightSpanPos, null);
              }
            }

            curPos = this.getNextPos(curPos, toDir);
            curSpanningLvl++;
          }

          if (!isRendering) {
            this.effectModifier.headSpanPos.length = 0;
          }
        };

        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._ENLARGED) {
              this.effectModifier = {
                type: EN._EFFECT._ENLARGED,
                curRatio: 0,
                headSpanPos: [],
              };
            }

            if (this.effectModifier.curRatio < PA_.ENLARGED_MAX_RATIO) {
              this.effectModifier.curRatio++;
console.log('init');
              this.effectModifier.headSpanPos = [];
              updateBodySpan(this.snake.bodyData[0].pos, this.snake.curHeadingDir);
            }

            break;
          }
          case EN._PHASE._HEAD_MOVE: {
console.log('headmove');
            //--- clear
            updateBodySpan(this.snake.bodyData[0].pos,
              this.getMovingDir(this.snake.bodyData[1].pos, this.snake.bodyData[0].pos), false/*clearing*/);

            this.snake.bodyData.unshift({
              pos: arg.nextHeadPos,
            });
            updateBodySpan(this.snake.bodyData[0].pos, this.snake.curHeadingDir);

            break;
          }
          case EN._PHASE._TAIL_MOVE: {
            let curTailPos = this.snake.bodyData[this.snake.bodyData.length - 1].pos;

            if (this.effectModifier.headSpanPos.includes(curTailPos)) {
              this.map.splice(curTailPos, 1, {
                type: EN._NODE_TYPE._SNAKE_SPAN,
              });
            } else {
              this.map.splice(curTailPos, 1, null);
            }

            break;
          }
        }
      },
      _applyMutantEffect(arg) {
/*let displayBodyMap = (bodyMap, layer, idx = undefined) => {
  let buf = [];
  for (let i=0;i<bodyMap.length;i++) {
    buf.push([layer].concat(this.DBGPOS(bodyMap[i].pos)));
    if (idx) {
      buf.push(idx);
    }
    if (bodyMap[i].branches) {
      for (let b=0;b<bodyMap[i].branches.length;b++) {
        buf = buf.concat(displayBodyMap(bodyMap[i].branches[b], (layer+1), b));
      }
    }
  }
  return buf;
};*/

        switch (arg.action) {
      		case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._MUTANT) {
                this.effectModifier = {
                  type: EN._EFFECT._MUTANT,
                  bodyMap: this.snake.bodyData.slice(),
                  curMutantNode: null,
                };
            }

      			let candBodyNodes = this.snake.bodyData.slice(),
      				candDirs = [ EN._DIR._LEFT, EN._DIR._UP, EN._DIR._RIGHT, EN._DIR._DOWN ];

      			ME_.shuffleArr(candBodyNodes);
      			ME_.shuffleArr(candDirs);

      			for (let n = 0; n < candBodyNodes.length; n++) {
      				for (let d = 0; d < candDirs.length; d++) {
      					let nextBodyPos = this.getNextPos(candBodyNodes[n].pos, candDirs[d]);

      					if (this.snake.bodyData.every((bodyNode) => {
      						//--- prevent immediately colliding
      						return bodyNode.pos != nextBodyPos;
      					})) {
      						//--- update current heading direction
      						this.snake.curHeadingDir = candDirs[d];

      						//--- update current mutant body node
      						this.effectModifier.curMutantNode = candBodyNodes[n];
      						//--- add a new empty sub-branch into the branches property
      						if (this.effectModifier.curMutantNode.branches) {
      							this.effectModifier.curMutantNode.branches.unshift([]);
      						} else {
      							this.effectModifier.curMutantNode.branches = [[]];
      						}

                  this.map.splice(this.snake.bodyData[0].pos, 1, {
                    type: EN._NODE_TYPE._SNAKE,
                  });
                  this.map.splice(this.effectModifier.curMutantNode.pos, 1, {
                    type: EN._NODE_TYPE._SNAKE,
                    color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
                  });

      						let mutantSpawningPath = [], curBodyRoot = this.effectModifier.curMutantNode;
      						do {
      							mutantSpawningPath.unshift(curBodyRoot);
      							if (curBodyRoot.root) {
      								curBodyRoot = curBodyRoot.root;
      							} else {
      								break;
      							}
      						} while (1);

/*let buf = [];
for (let i=0;i<mutantSpawningPath.length;i++) {
buf.push(this.DBGPOS(mutantSpawningPath[i].pos));
}
console.log('mutant:',this.DBGPOS(this.effectModifier.curMutantNode.pos),'dir:',this.snake.curHeadingDir,'path:',mutantSpawningPath.length,buf);
buf = [];
for (let i=0;i<this.snake.bodyData.length;i++) {
buf.push(this.DBGPOS(this.snake.bodyData[i].pos));
}
console.log('before:',buf);
console.log('map:', displayBodyMap(this.effectModifier.bodymap, 1));*/

      						let reArrangeBodyData = (bodyMap) => {
      							let bodyData = [];

      							while (bodyMap.length) {
      								let curBodyNode = bodyMap[bodyMap.length - 1];

      								if (mutantSpawningPath.find((bodyNode) => {
      									return bodyNode == curBodyNode;
      								})) {
      									if (bodyMap.length == 1) {
      										if (curBodyNode == this.effectModifier.curMutantNode) {
      											//--- do nothing special here since we would just let it perform the following process
      											//--- to first rearranging all its branches and then pop itself lastly
      										} else if (curBodyNode.branches.length == 1) {
      											//--- we need to first pop current body node and then go deeper into the next level
      											//--- of bodyMap (i.e. its one and only branch) to continue arranging bodyData
      											bodyData.unshift(bodyMap.pop());
      											bodyMap = curBodyNode.branches[0].slice();
      											continue;
      										} else {
                          	let mutantSpawningBranch = curBodyNode.branches.find((branch) => {
                            	return branch.some((bodyNode) => {
                              	return mutantSpawningPath.some((spawningNode) => {
                                	return spawningNode == bodyNode;
                                })
                              });
                            }), origBranches = curBodyNode.branches.slice();
/*let buf = [];
for (let i=0;i<mutantSpawningPath.length;i++) {
buf.push(this.DBGPOS(mutantSpawningPath[i].pos));
}
console.log('mutant:',this.DBGPOS(this.effectModifier.curMutantNode.pos),'dir:',this.snake.curHeadingDir,'path:',mutantSpawningPath.length,buf);
console.log('cur:',this.DBGPOS(curBodyNode.pos),'spawn:',mutantSpawningBranch,'map:',displayBodyMap(this.effectModifier.bodymap, 1),this.DBGPOS(curBodyNode.pos));*/
                            //--- trace all the branches except for the spawing one first
                            curBodyNode.branches.splice(curBodyNode.branches.indexOf(mutantSpawningBranch), 1);
                            for (let b = curBodyNode.branches.length - 1; b >= 0; b--) {
                              //--- arrange branches reversely since
                              bodyData = reArrangeBodyData(curBodyNode.branches[b].slice().reverse()).concat(bodyData);
                            }
      											//--- reset correct branches property
                            curBodyNode.branches = origBranches;

                            //--- pop current body node and then go into the next level of bodyMap
                            //--- (i.e. the spawning branch) to continue arranging bodyData
      											bodyData.unshift(bodyMap.pop());
      											bodyMap = mutantSpawningBranch.slice();
                            continue;
      										}
      									} else {
                        	//--- reverse to trace from the opposite end to make sure the mutant node would be traced lastly
      										bodyMap.reverse();
      										continue;
      									}
      								}

      								if (curBodyNode.branches) {
      									for (let b = curBodyNode.branches.length - 1; b >= 0; b--) {
      										//--- arrange branches reversely since
      										bodyData = reArrangeBodyData(curBodyNode.branches[b].slice().reverse()).concat(bodyData);
      									}
      								}

      								bodyData.unshift(bodyMap.pop());
      							}

      							return bodyData;
      						};
      						this.snake.bodyData = reArrangeBodyData(this.effectModifier.bodyMap.slice());

/*buf = [];
for (let i=0;i<this.snake.bodyData.length;i++) {
  buf.push(this.DBGPOS(this.snake.bodyData[i].pos));
}
console.log('after:',buf);
console.log('map:', displayBodyMap(this.effectModifier.bodymap, 1));*/

      						n = candBodyNodes.length;
      						break;
      					}
      				}
      			}

      			break;
      		}
      		case EN._PHASE._HEAD_MOVE: {
      			let headData = {
      				pos: arg.nextHeadPos,
      			};

      			if (this.effectModifier.curMutantNode) {
      				//--- we are moving in a sub-branch of the body, therefore we need to add root pointer to current node
      				//--- and also add a pointer into an entry in the branches property of the root to allow bi-direction referencing
      				headData.root = this.effectModifier.curMutantNode;
      				this.effectModifier.curMutantNode.branches[0].unshift(headData);
      			} else if (this.effectModifier.bodyMap) {
              this.effectModifier.bodyMap.unshift(headData);
            }

      			this.snake.bodyData.unshift(headData);
//console.log('head:',this.DBGPOS(headData.pos),'map:', displayBodyMap(this.effectModifier.bodymap, 1));
      			break;
      		}
      		case EN._PHASE._TAIL_MOVE: {
      			//--- update 2-D bodyMap depends on which part of the body is currently being moved
      			let curTailNode = this.snake.bodyData[this.snake.bodyData.length - 1];

      			if (curTailNode.branches && curTailNode.branches.length == 1) {
      				//--- there is NO WAY the mutant node is being moved while there is still more than one branch remaining
      				//--- update bodyMap pointer to the one and only branch of the mutant node
//console.log('tail before:',this.DBGPOS(curTailNode.pos),'map:', displayBodyMap(this.effectModifier.bodymap, 1));
      				this.effectModifier.bodyMap = curTailNode.branches[0];

      				//--- clear root property of each body node in the branch since it's now the main branch
              this.snake.bodyData.forEach((bodyNode) => {
                if (bodyNode.root == curTailNode) {
                  bodyNode.root = undefined;
                }
              });
              if (curTailNode == this.effectModifier.curMutantNode) {
                this.effectModifier.curMutantNode = undefined;
              }
      			} else if (curTailNode.root) {
              let curBranch = curTailNode.root.branches.find((branch) => {
                return branch.includes(curTailNode);
              });
      				//--- we are at the sub-branch of the body now, therefore we only need to update the branches
      				//--- property and its sub content to keep bodyMap up-to-date
      				curBranch.splice(curBranch.indexOf(curTailNode), 1);

      				if (curBranch.length == 0) {
      					curTailNode.root.branches.splice(curTailNode.root.branches.indexOf(curBranch), 1);
      				}
//console.log('root:',this.DBGPOS(curTailNode.root.pos));
      			} else {
      				//--- we are at the main branch of the body, therefore we could treat bodyMap just like normal 1-D bodyData
      				this.effectModifier.bodyMap.splice(this.effectModifier.bodymap.indexOf(curTailNode), 1);
      			}
//console.log('tail:',this.DBGPOS(curTailNode.pos),'map:', displayBodyMap(this.effectModifier.bodymap, 1));

      			break;
      		}
      	}
      },
      _applySplitEffect(arg) {
        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._SPLIT) {
              this.effectModifier = {
                type: EN._EFFECT._SPLIT,
                curSplitCtrlID: 0,
                split: [],
              };
            }

            let splitLength = Math.floor(arg.snakeData.bodyData.length / 2);
            arg.snakeData.length -= splitLength;

            this.effectModifier.split.push({
              length: splitLength,
              curHeadingDir: this.getMovingDir(arg.snakeData.bodyData[arg.snakeData.bodyData.length - 1].pos, arg.snakeData.trailingData[0].pos),
              bodyData: arg.snakeData.bodyData.splice((arg.snakeData.bodyData.length - splitLength), splitLength).reverse(),
              trailingLength: PA_.INIT_TRAILING_LENGTH,
              trailingData: [],
            });
for (let i = 0; i < this.effectModifier.split.length; i++) {
  console.log(this.effectModifier.split[i].length);
}
            break;
          }
          case EN._PHASE._PHASE: {
            switch (arg.key) {
              case EN._DIR._BTN_A: {
                this.effectModifier.curSplitCtrlID = (this.effectModifier.curSplitCtrlID + 1) % this.effectModifier.split.length;
                break;
              }
              case EN._DIR._BTN_B: {
                this.effectModifier.split[this.effectModifier.curSplitCtrlID].curHeadingDir = (this.effectModifier.split[this.effectModifier.curSplitCtrlID].curHeadingDir + 1) % 4;
                break;
              }
              case EN._DIR._BTN_C: {
                this.effectModifier.split[this.effectModifier.curSplitCtrlID].curHeadingDir = (this.effectModifier.split[this.effectModifier.curSplitCtrlID].curHeadingDir + 3) % 4;
                break;
              }
            }

            break;
          }
        }
      },
      _applyCirculatedEffect(arg) {
        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._CIRCULATED) {
              this.effectModifier = {
                type: EN._EFFECT._CIRCULATED,
                curDegree: 45,
              };
            }

            this.effectModifier.curDegree = (this.effectModifier.curDegree + 45) % 360;
            break;
          }
          case EN._PHASE._HEAD_MOVE: {
            let nextHeadPos;

            if (this.effectModifier.curDegree % 90 == 0) {
              nextHeadPos = this.getNextPos(this.snake.bodyData[0].pos,
                (this.snake.curHeadingDir + (this.effectModifier.curDegree / 90)) % 4);
            } else {
              let curHeadingDirHalfVec = (this.snake.curHeadingDir + ((this.effectModifier.curDegree - 45) / 90)) % 4;
              nextHeadPos = this.getNextPos(this.getNextPos(this.snake.bodyData[0].pos, curHeadingDirHalfVec), (curHeadingDirHalfVec + 1) % 4);
            }

            return nextHeadPos;
          }
          case EN._PHASE._PHASE: {
            this.effectModifier.curDegree = (this.effectModifier.curDegree + 45) % 360;
            break;
          }
        }
      },
      _applyFrozenEffect(arg) {
        var ret = false;

        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._FROZEN) {
              this.effectModifier = {
                type: EN._EFFECT._FROZEN,
                movingDir: undefined,
              };
            }

            break;
          }
          case EN._PHASE._STEP_MOVE: {
            if (Math.random() >= PA_.FROZEN_CHANCE) {
              //--- restore to normal gameStep
              this.colorSet.snake = PA_.DEFAULT_SNAKE_COLOR;
              this.effectModifier.movingDir = undefined;
            } else {
              //--- frozen gameStep
              if (this.effectModifier.movingDir == undefined) {
                //--- initialize
                this.colorSet.snake = PA_.FROZEN_COLOR;
                this.effectModifier.movingDir = this.snake.curHeadingDir;

                if (this.snake.length > this.snake.bodyData.length) {
                  this.snake.length = this.snake.bodyData.length;
                }
              }

              //--- frozen body move
              this.snake.bodyData.forEach((bodyNode) => {
                this.map.splice(bodyNode.pos, 1, null);
                bodyNode.pos = this.getNextPos(bodyNode.pos, this.effectModifier.movingDir);
              });
              this.snake.bodyData.forEach((bodyNode) => {
                if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN._NODE_TYPE._PREY) {
                  this._devourPrey(bodyNode.pos, this.snake);
                }
                this.map.splice(bodyNode.pos, 1, {
                  type: EN._NODE_TYPE._SNAKE,
                });
              });

              ret = true;
            }

            break;
          }
          case EN._PHASE._CTRL_INPUT: {
            if (this.effectModifier.movingDir != undefined) {
              this.effectModifier.movingDir = arg.dir;
//              console.log('frozen:',this.effectModifier.movingDir);
              ret = true;
            }

            break;
          }
        }

        return ret;
      },
      _applyDimensionalEffect(arg) {
        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._DIMENSIONAL) {
              this.effectModifier = {
                type: EN._EFFECT._DIMENSIONAL,
              };
            }

            break;
          }
          case EN._PHASE._PHASE: {
            this.nextHeadPos = this.getRandomAvailablePos();

            break;
          }
          case EN._PHASE._HEAD_MOVE: {
            let ret;

            if (this.nextHeadPos) {
              ret = this.nextHeadPos;
              this.nextHeadPos = undefined;
            } else {
              ret = this.getNextPos(this.snake.bodyData[0].pos, this.snake.curHeadingDir);
            }

            return ret;
          }
        }
      },
      _applyEarthQuakeEffect(arg) {
        if (this.effectModifier.type != EN._EFFECT._EARTHQUAKE) {
          this.effectModifier = {
            type: EN._EFFECT._EARTHQUAKE,
          };
        }

        let shakingDir = Math.floor(Math.random() * 4);

        this.snake.bodyData.forEach((bodyNode) => {
          this.map.splice(bodyNode.pos, 1, null);
          bodyNode.pos = this.getNextPos(bodyNode.pos, shakingDir);
        });
        this.snake.bodyData.forEach((bodyNode) => {
          if (this.snake.bodyData.indexOf(bodyNode) == 0) {
            if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN._NODE_TYPE._PREY) {
              this._devourPrey(nodyNode.pos, this.snake);
            }
            this.map.splice(bodyNode.pos, 1, {
              type: EN._NODE_TYPE._SNAKE,
              color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
            });
          } else {
            if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN._NODE_TYPE._PREY) {
              this._scoutNewPrey();
            }
            this.map.splice(bodyNode.pos, 1, {
              type: EN._NODE_TYPE._SNAKE,
            });
          }
        });

        setTimeout(this._applyEarthQuakeEffect, (40 * (Math.floor(Math.random() * 10) + 1)));
      },
      _applyBomberEffect(arg) {
        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._BOMBER) {
              this.effectModifier = {
                type: EN._EFFECT._BOMBER,
                nodeNum: Math.floor(Math.random() * (this.snake.bodyData.length - 1)) + 1,
                CountDown: Math.floor(Math.random() * PA_.BOMBER_MAX_COUNTDOWN) + 1,
              };
//console.log('num:',this.bomberBodyNodeNum);
              this.effectModifier.curCountDown = this.effectModifier.CountDown;
              this.colorSet.snake = PA_.BOMBER_COLOR[this.effectModifier.curCountDown];
            }

            break;
          }
          case EN._PHASE._STEP_MOVE: {
            if (this.effectModifier.curCountDown) {
//console.log('cnt:',this.effectModifier.curCountDown);
              this.effectModifier.curCountDown--;
              this.colorSet.snake = PA_.BOMBER_COLOR[Math.floor(this.effectModifier.curCountDown * PA_.BOMBER_COLOR.length / this.effectModifier.countDown)];

              if (this.effectModifier.curCountDown == 0) {
                this.snake.trailingData = [this.snake.bodyData[this.snake.bodyData.length - this.effectModifier.nodeNum]];

                let cnt = 0;
                do {
                  this.map.splice(this.snake.bodyData[this.snake.bodyData.length - 1].pos, 1, null);

                  //--- split body into pieces and randomly place on map
                  this.map.splice(this.getRandomAvailablePos(), 1, {
                    type: EN._NODE_TYPE._PREY,
                    effect: EN._EFFECT._NORMAL,
                    color: PA_.DEFAULT_SNAKE_COLOR,
                  });

                  this.snake.bodyData.pop();
                  cnt++;
                } while (cnt < this.effectModifier.nodeNum);

                this.snake.length = this.snake.bodyData.length;

                this.effectModifier = {
                  type: EN._EFFECT._NORMAL,
                }
              }
            }

            break;
          }
        }
      },
      _applyWormlikeEffect(arg) {
        switch (arg.action) {
          case EN._PHASE._INIT: {
            if (this.effectModifier.type != EN._EFFECT._WORMLIKE) {
              this.effectModifier = {
                type: EN._EFFECT._WORMLIKE,
                isShrinking: true,
              };
            }

            break;
          }
          case EN._PHASE._PHASE: {
            this.effectModifier.isShrinking = !this.effectModifier.isShrinking;
            break;
          }
          case EN._PHASE._HEAD_MOVE: {
            return this.effectModifier.isShrinking;
          }
          case EN._PHASE._TAIL_MOVE: {
            return (this.effectModifier.isShrinking && this.snake.bodyData.length > 1);
          }
        }
      },
      //------------------------------------------------------------------------------------------
      //  primitive functions
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
            case EN._DIR._LEFT: {
              nextPos -= 1;
              if (isContinuous && (curPos % this.mapSize.width) == 0) {
                nextPos += this.mapSize.width;
              }
              break;
            }
            case EN._DIR._UP: {
              nextPos -= this.mapSize.width;
              if (isContinuous && nextPos < 0) {
                nextPos += (this.mapSize.width * this.mapSize.height);
              }
              break;
            }
            case EN._DIR._RIGHT: {
              nextPos += 1;
              if (isContinuous && (curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
                nextPos -= this.mapSize.width;
              }
              break;
            }
            case EN._DIR._DOWN: {
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
      			ret = EN._DIR._LEFT;
      			break;

      		case -this.mapSize.width:
      		case ((this.mapSize.height - 1) * this.mapSize.width):
      			ret = EN._DIR._UP;
      			break;
      		case 1:
      		case -(this.mapSize.width - 1):
      			ret = EN._DIR._RIGHT;
      			break;
      		case this.mapSize.width:
      		case -((this.mapSize.height - 1) * this.mapSize.width):
      			ret = EN._DIR._DOWN;
      			break;
      	}

      	return ret;
      },
      handleControlInput(dir) {
        switch (this.effectModifier.type) {
          case EN._EFFECT._DRUNK: {
            if (this._applyDrunkEffect({
              action: EN._PHASE._CTRL_INPUT,
            })) {
              return;
            }
            break;
          }
          case EN._EFFECT._CIRCULATED: {
            return;
          }
          case EN._EFFECT._FROZEN: {
            if (this._applyFrozenEffect({
              action: EN._PHASE._CTRL_INPUT,
              dir: dir,
            })) {
              return;
            }
            break;
          }
          case EN._EFFECT._UPSIDEDOWN: {
            dir = this._applyUpsideDownEffect({
              dir: dir,
            });
            break;
          }
        }

        if ((this.snake.bodyData.length == 1 && dir !=  this.getMovingDir(this.snake.bodyData[0].pos, this.snake.trailingData[0].pos)) ||
          (this.snake.bodyData.length > 1 && dir != this.getMovingDir(this.snake.bodyData[0].pos, this.snake.bodyData[1].pos))) {
          this.snake.curHeadingDir = dir;
        }
      },
      DBGPOS(pos) {
        return [(pos % this.mapSize.width), Math.floor(pos / this.mapSize.width)];
      },
    },
    created() {
      var vm = this;
      window.addEventListener('keydown', (event) => {
        if (event.keyCode == EN._DIR._BTN_A ||
          event.keyCode == EN._DIR._BTN_B ||
          event.keyCode == EN._DIR._BTN_C) {
          event.preventDefault();

          if (vm.effectModifier.type == EN._EFFECT._SPLIT) {
            vm._applySplitEffect({
              action: EN._PHASE._PHASE,
              key: event.keyCode,
            });
          } else if (vm.effectModifier.type == EN._EFFECT._CIRCULATED) {
            vm._applyCirculatedEffect({
              action: EN._PHASE._PHASE,
            });
          } else if (vm.effectModifier.type == EN._EFFECT._DIMENSIONAL) {
            vm._applyDimensionalEffect({
              action: EN._PHASE._PHASE,
            });
          } else if (vm.effectModifier.type == EN._EFFECT._WORMLIKE) {
            vm._applyWormlikeEffect({
              action: EN._PHASE._PHASE,
            });
          }
        } else {
          let dir = event.keyCode - EN._DIR._BASE;

          if ((dir >= EN._DIR._LEFT) && (dir <= EN._DIR._DOWN)) {
            event.preventDefault();
            vm.handleControlInput(dir);
          }
        }
      });
    },
  }
</script>

<style>

</style>
