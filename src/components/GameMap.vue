<template>
  <div>
    <button @click="startGame" v-if="snake.bodyData.length == 0">Start</button>
    <button @click="pauseGame" v-else-if="!isNaN(stepProcID)">Pause</button>
    <button @click="resumeGame" v-else>Resume</button>
    <button @click="_stepMove(snake, false)" v-if="snake.bodyData.length && isNaN(stepProcID)">Step</button>
    <button @click="resetGame">Reset</button>
    <p v-if="snake.bodyData.length == 0">
      body: {{ snake.length }} shown: {{ snake.bodyData.length }} status: {{ effect.type }}
    </p>
    <p v-else>
      body: {{ snake.length }} shown: {{ snake.bodyData.length }} status: {{ effect.type }}
      head: ({{ snake.bodyData[0].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[0].pos / this.mapSize.width) }})
      tail: ({{ snake.bodyData[snake.bodyData.length - 1].pos % this.mapSize.width }}, {{ Math.floor(snake.bodyData[snake.bodyData.length - 1].pos / this.mapSize.width) }})
    </p>
    <app-canvas :mapSize="mapSize" :map="map" :colorSet="colorSet"></app-canvas>
  </div>
</template>

<script>
  import * as EN_ from '../include/Enums'
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
          curHeadingDir: EN_.DIR._RIGHT,
        },
        effect: {
          type: EN_.EFFECT._NORMAL,
        },
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
          type: EN_.NODE_TYPE._SNAKE,
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
          curHeadingDir: EN_.DIR._RIGHT,
        };
        this.effect = {
          type: EN_.EFFECT._NORMAL,
        };

        return 0;
      },
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      _stepMove(snakeData, scheduleNextStep = true) {
        do {
          if (this.effect.type == EN_.EFFECT._SPLIT && snakeData == this.snake) {
            snakeData.split.forEach((split) => {
              this._stepMove(split, false);
            });
          } else if (this.effect.type == EN_.EFFECT._FROZEN) {
            if (this._applyFrozenEffect({
              action: EN_.ACTION._STEP_MOVE,
            })) {
              break;
            }
          } else if (this.effect.type == EN_.EFFECT._BOMBER) {
            this._applyBomberEffect({
              action: EN_.ACTION._STEP_MOVE,
            });
          }

          //--- phase 1: head move
          do {
            let nextHeadPos, curPrey = undefined;

            //--- determine next head position
            if (this.effect.type == EN_.EFFECT._CIRCULATED) {
              nextHeadPos = this._applyCirculatedEffect({
                action: EN_.ACTION._HEAD_MOVE,
              });
            } else if (this.effect.type == EN_.EFFECT._DIMENSIONAL) {
              nextHeadPos = this._applyDimensionalEffect({
                action: EN_.ACTION._HEAD_MOVE,
              });
            } else if (this.effect.type == EN_.EFFECT._WORMLIKE && this._applyWormlikeEffect({
                action: EN_.ACTION._HEAD_MOVE,
              })) {
              break;
            } else {
              nextHeadPos = this.getNextPos(snakeData.bodyData[0].pos, snakeData.curHeadingDir);
            }

            let isColliding = false;

            if (this.effect.type == EN_.EFFECT._SPLIT) {
              if (this.snake.bodyData.find((bodyNode) => {
                return bodyNode.pos == nextHeadPos;
              })) {
                isColliding = true;
              } else {
                this.effect.split.forEach((split) => {
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
              type: EN_.NODE_TYPE._SNAKE,
            });

            //--- update current head position into bodyData
            if (this.effect.type == EN_.EFFECT._MUTANT) {
              this._applyMutantEffect({
                action: EN_.ACTION._HEAD_MOVE,
                nextHeadPos: nextHeadPos,
              });
            } else if (this.effect.type == EN_.EFFECT._ENLARGED) {
              this._applyEnlargedEffect({
                action: EN_.ACTION._HEAD_MOVE,
                nextHeadPos: nextHeadPos,
              });
            } else {
              snakeData.bodyData.unshift({
                pos: nextHeadPos,
              });
            }

            if (this.map[snakeData.bodyData[0].pos] && this.map[snakeData.bodyData[0].pos].type == EN_.NODE_TYPE._PREY) {
              this._devourPrey(snakeData.bodyData[0].pos, snakeData);
            }

            //--- highlight current head position on map
            if (snakeData == this.snake) {
              this.map.splice(snakeData.bodyData[0].pos, 1, {
                type: EN_.NODE_TYPE._SNAKE,
                color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
              });
            } else if (this.effect.type == EN_.EFFECT._SPLIT && this.effect.split.indexOf(snakeData) == this.snake.curSplitCtrlID) {
              this.map.splice(snakeData.bodyData[0].pos, 1, {
                type: EN_.NODE_TYPE._SNAKE,
                color: '#5858FA',
              });
            } else {
              this.map.splice(snakeData.bodyData[0].pos, 1, {
                type: EN_.NODE_TYPE._SNAKE,
              });
            }
          } while (0);

          //--- phase 2: tail move
          do {
            //--- update tail iff the body is completely in the map
            if (snakeData.bodyData.length > snakeData.length ||
              (this.effect.type == EN_.EFFECT._WORMLIKE && this._applyWormlikeEffect({
                  action: EN_.ACTION._TAIL_MOVE,
                }))) {
              //--- tail move
              if (this.effect.type == EN_.EFFECT._MUTANT) {
                this._applyMutantEffect({
                  action: EN_.ACTION._TAIL_MOVE,
                });
              }

              if (this.effect.type == EN_.EFFECT._ENLARGED) {
                this._applyEnlargedEffect({
                  action: EN_.ACTION._TAIL_MOVE,
                });
              } else {
                this.map.splice(snakeData.bodyData[snakeData.bodyData.length - 1].pos, 1, null);
              }

              snakeData.trailingData.unshift(snakeData.bodyData.pop());
              if (snakeData.trailingData.length > snakeData.trailingLength) {
                snakeData.trailingData.pop();
              }
            }

            if (this.effect.type == EN_.EFFECT._CHAMELEONIC) {
              this._applyChameleonicEffect();
            }
          } while (0);
        } while (0);

        //--- phase 3: schedule next step
        if (this.effect.type == EN_.EFFECT._DRUNK) {
          this._applyDrunkEffect({
            action: EN_.ACTION._STEP_MOVE,
          });
        } else if (scheduleNextStep) {
          this._scheduleNextStep();
        }
      },
      _scheduleNextStep() {
        var tick = (100 * (PA_.MAX_GAME_LEVEL - (this.curLevel - 1)));

        if (this.effect.type == EN_.EFFECT._DRUNK) {
          tick = this._applyDrunkEffect({
            action: EN_.ACTION._SCHEDULE_NEXT_STEP,
            tick: tick,
          });
        } else if (this.effect.type == EN_.EFFECT._HYPED) {
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
            case EN_.EFFECT._REVERSED: this._applyReversedEffect(); break;
            case EN_.EFFECT._ENLARGED: this._applyEnlargedEffect({
                action: EN_.ACTION._INIT,
              }); break;
            case EN_.EFFECT._MUTANT: this._applyMutantEffect({
                action: EN_.ACTION._INIT,
              }); break;
            case EN_.EFFECT._SPLIT: this._applySplitEffect({
                action: EN_.ACTION._INIT,
                snakeData: snakeData,
              }); break;
            case EN_.EFFECT._CIRCULATED: this._applyCirculatedEffect({
                action: EN_.ACTION._INIT,
              }); break;
            case EN_.EFFECT._EARTHQUAKE: this._applyEarthQuakeEffect(); break;
            case EN_.EFFECT._BOMBER: this._applyBomberEffect({
                action: EN_.ACTION._INIT,
              }); break;
            case EN_.EFFECT._WORMLIKE: this._applyWormlikeEffect({
                action: EN_.ACTION._INIT,
              }); break;
          }

          this._scoutNewPrey();
        }
      },
      _scoutNewPrey(effect = PA_.DEFAULT_EFFECT) {
        this.map.splice(this.getRandomAvailablePos(), 1, {
            type: EN_.NODE_TYPE._PREY,
            effect: effect,
          });
      },
      //------------------------------------------------------------------------------------------
      //  effect functions
      //------------------------------------------------------------------------------------------
      _applyReversedEffect(arg) {
        if (this.effect.type != EN_.EFFECT._REVERSED) {
          this.effect = {
            type: EN_.EFFECT._REVERSED,
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
          type: EN_.NODE_TYPE._SNAKE,
          color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
        });
        this.map.splice(this.snake.bodyData[this.snake.bodyData.length - 1].pos, 1, {
          type: EN_.NODE_TYPE._SNAKE,
        });
      },
      _applyDrunkEffect(arg) {
        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._DRUNK) {
              this.effect = {
                type: EN_.EFFECT._DRUNK,
                drunkFactor: 0,
              };
            }

            break;
          }
          case EN_.ACTION._STEP_MOVE: {
            if (this.effect.drunkFactor >= 0) {
              let drunkLvl = PA_.DRUNK_LEVEL[Math.floor(Math.random() * ((PA_.DRUNK_LEVEL.length - 1) + 1))];

              if ((drunkLvl > PA_.DRUNK_LEVEL_PENALTY) && (this.effect.drunkFactor > PA_.DRUNK_MAX_STEP)) {
                let drunkStep = (Math.floor(Math.random() * PA_.DRUNK_MAX_STEP) + 1);

//                this.colorSet.snake = PA_.FROZEN_COLOR;
                this.effect.drunkFactor = -1;
                this._applyReversedEffect();

                let intervalID = setInterval(() => {
                    this._stepMove(this.snake, false);

                    if (--drunkStep == 0) {
                      clearInterval(intervalID);

                      this._applyReversedEffect();
                      this.effect.drunkFactor = 0;
//                      this.colorSet.snake = PA_.DEFAULT_SNAKE_COLOR;
                      this._scheduleNextStep();
                    }
                  }, (1000 / drunkLvl));
              } else {
                this.effect.drunkFactor++;
                this._scheduleNextStep();
              }
            }

            break;
          }
          case EN_.ACTION._SCHEDULE_NEXT_STEP: {
            return (arg.tick / PA_.DRUNK_LEVEL[Math.floor(Math.random() * ((PA_.DRUNK_LEVEL.length - 1) + 1))]);
          }
          case EN_.ACTION._CTRL_INPUT: {
            //--- block if being too drunk
            return (this.effect.drunkFactor < 0);
          }
        }
      },
      _applyUpsideDownEffect(arg) {
        if (this.effect.type != EN_.EFFECT._UPSIDEDOWN) {
          this.effect = {
            type: EN_.EFFECT._UPSIDEDOWN,
          };
        }

        return ME_.reverseDir(arg.dir);
      },
      _applyHypedEffect(arg) {
        if (this.effect.type != EN_.EFFECT._HYPED) {
          this.effect = {
            type: EN_.EFFECT._HYPED,
          };
        }

        return (arg.tick / (Math.floor(Math.random() * (PA_.HYPED_LEVEL[PA_.HYPED_LEVEL.length - 1] - PA_.HYPED_LEVEL[0] + 1)) + PA_.HYPED_LEVEL[0]));
      },
      _applyChameleonicEffect(arg) {
        if (this.effect.type != EN_.EFFECT._CHAMELEONIC) {
          this.effect = {
            type: EN_.EFFECT._CHAMELEONIC,
            curChameleonicLvlID: 0,
          };
        }

        this.effect.curChameleonicLvlID = ((this.effect.curChameleonicLvlID + 1) % PA_.CHAMELEONIC_LEVEL.length);
        this.colorSet.snake = PA_.CHAMELEONIC_COLOR[PA_.CHAMELEONIC_LEVEL[this.effect.curChameleonicLvlID]];

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
                type: EN_.NODE_TYPE._SNAKE,
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

          while (curSpanningLvl <= this.effect.curRatio) {
            let leftSpanPos = curPos, rightSpanPos = curPos;

            if (curSpanningLvl > 0) {
              if (isRendering) {

                if (this.map[curPos] && this.map[curPos].type == EN_.NODE_TYPE._PREY) {
                  this._devourPrey(curPos, this.snake);
                }

                markBodySpanNode(curPos, EN_.NODE_TYPE._SNAKE_SPAN);
                this.effect.headSpanPos.push(curPos);
              } else {
                markBodySpanNode(curPos, null);
              }
            }

            for (let i = 0; i < this.effect.curRatio - curSpanningLvl; i++) {
              leftSpanPos = this.getNextPos(leftSpanPos, (toDir + 3) % 4);
              rightSpanPos = this.getNextPos(rightSpanPos, (toDir + 1) % 4);

              if (isRendering) {
                let newEffect = undefined;

                if (this.map[leftSpanPos] && this.map[leftSpanPos].type == EN_.NODE_TYPE._PREY) {
console.log(curSpanningLvl,i,'L prey at',this.DBGPOS(leftSpanPos));
                  newEffect = this.map[leftSpanPos].effect;
                  this.map[leftSpanPos] = null;
                } else if (this.map[rightSpanPos] && this.map[rightSpanPos].type == EN_.NODE_TYPE._PREY) {
console.log(curSpanningLvl,i,'R prey at',this.DBGPOS(rightSpanPos));
                  newEffect = this.map[rightSpanPos].effect;
                  this.map[rightSpanPos] = null;
                }

                if (newEffect != undefined) {
                  this.snake.length++;

                  switch (this.effect.type) {
                    case EN_.EFFECT._REVERSED: this._applyReversedEffect(); break;
                    case EN_.EFFECT._ENLARGED: this._applyEnlargedEffect({
                      action: EN_.ACTION._INIT,
                    }); break;
                    case EN_.EFFECT._MUTANT: this._applyMutantEffect(); break;
                    case EN_.EFFECT._SPLIT: this._applySplitEffect(); break;
                  }

                  this._scoutNewPrey();
                }

                markBodySpanNode(leftSpanPos, EN_.NODE_TYPE._SNAKE_SPAN);
                markBodySpanNode(rightSpanPos, EN_.NODE_TYPE._SNAKE_SPAN);
                this.effect.headSpanPos.push(leftSpanPos, rightSpanPos);
              }  else {
                markBodySpanNode(leftSpanPos, null);
                markBodySpanNode(rightSpanPos, null);
              }
            }

            curPos = this.getNextPos(curPos, toDir);
            curSpanningLvl++;
          }

          if (!isRendering) {
            this.effect.headSpanPos.length = 0;
          }
        };

        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._ENLARGED) {
              this.effect = {
                type: EN_.EFFECT._ENLARGED,
                curRatio: 0,
                headSpanPos: [],
              };
            }

            if (this.effect.curRatio < PA_.ENLARGED_MAX_RATIO) {
              this.effect.curRatio++;
console.log('init');
              this.effect.headSpanPos = [];
              updateBodySpan(this.snake.bodyData[0].pos, this.snake.curHeadingDir);
            }

            break;
          }
          case EN_.ACTION._HEAD_MOVE: {
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
          case EN_.ACTION._TAIL_MOVE: {
            let curTailPos = this.snake.bodyData[this.snake.bodyData.length - 1].pos;

            if (this.effect.headSpanPos.includes(curTailPos)) {
              this.map.splice(curTailPos, 1, {
                type: EN_.NODE_TYPE._SNAKE_SPAN,
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
      		case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._MUTANT) {
                this.effect = {
                  type: EN_.EFFECT._MUTANT,
                  bodyMap: this.snake.bodyData.slice(),
                  curMutantNode: null,
                };
            }

      			let candBodyNodes = this.snake.bodyData.slice(),
      				candDirs = [ EN_.DIR._LEFT, EN_.DIR._UP, EN_.DIR._RIGHT, EN_.DIR._DOWN ];

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
      						this.effect.curMutantNode = candBodyNodes[n];
      						//--- add a new empty sub-branch into the branches property
      						if (this.effect.curMutantNode.branches) {
      							this.effect.curMutantNode.branches.unshift([]);
      						} else {
      							this.effect.curMutantNode.branches = [[]];
      						}

                  this.map.splice(this.snake.bodyData[0].pos, 1, {
                    type: EN_.NODE_TYPE._SNAKE,
                  });
                  this.map.splice(this.effect.curMutantNode.pos, 1, {
                    type: EN_.NODE_TYPE._SNAKE,
                    color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
                  });

      						let mutantSpawningPath = [], curBodyRoot = this.effect.curMutantNode;
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
console.log('mutant:',this.DBGPOS(this.effect.curMutantNode.pos),'dir:',this.snake.curHeadingDir,'path:',mutantSpawningPath.length,buf);
buf = [];
for (let i=0;i<this.snake.bodyData.length;i++) {
buf.push(this.DBGPOS(this.snake.bodyData[i].pos));
}
console.log('before:',buf);
console.log('map:', displayBodyMap(this.effect.bodymap, 1));*/

      						let reArrangeBodyData = (bodyMap) => {
      							let bodyData = [];

      							while (bodyMap.length) {
      								let curBodyNode = bodyMap[bodyMap.length - 1];

      								if (mutantSpawningPath.find((bodyNode) => {
      									return bodyNode == curBodyNode;
      								})) {
      									if (bodyMap.length == 1) {
      										if (curBodyNode == this.effect.curMutantNode) {
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
console.log('mutant:',this.DBGPOS(this.effect.curMutantNode.pos),'dir:',this.snake.curHeadingDir,'path:',mutantSpawningPath.length,buf);
console.log('cur:',this.DBGPOS(curBodyNode.pos),'spawn:',mutantSpawningBranch,'map:',displayBodyMap(this.effect.bodymap, 1),this.DBGPOS(curBodyNode.pos));*/
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
      						this.snake.bodyData = reArrangeBodyData(this.effect.bodyMap.slice());

/*buf = [];
for (let i=0;i<this.snake.bodyData.length;i++) {
  buf.push(this.DBGPOS(this.snake.bodyData[i].pos));
}
console.log('after:',buf);
console.log('map:', displayBodyMap(this.effect.bodymap, 1));*/

      						n = candBodyNodes.length;
      						break;
      					}
      				}
      			}

      			break;
      		}
      		case EN_.ACTION._HEAD_MOVE: {
      			let headData = {
      				pos: arg.nextHeadPos,
      			};

      			if (this.effect.curMutantNode) {
      				//--- we are moving in a sub-branch of the body, therefore we need to add root pointer to current node
      				//--- and also add a pointer into an entry in the branches property of the root to allow bi-direction referencing
      				headData.root = this.effect.curMutantNode;
      				this.effect.curMutantNode.branches[0].unshift(headData);
      			} else if (this.effect.bodyMap) {
              this.effect.bodyMap.unshift(headData);
            }

      			this.snake.bodyData.unshift(headData);
//console.log('head:',this.DBGPOS(headData.pos),'map:', displayBodyMap(this.effect.bodymap, 1));
      			break;
      		}
      		case EN_.ACTION._TAIL_MOVE: {
      			//--- update 2-D bodyMap depends on which part of the body is currently being moved
      			let curTailNode = this.snake.bodyData[this.snake.bodyData.length - 1];

      			if (curTailNode.branches && curTailNode.branches.length == 1) {
      				//--- there is NO WAY the mutant node is being moved while there is still more than one branch remaining
      				//--- update bodyMap pointer to the one and only branch of the mutant node
//console.log('tail before:',this.DBGPOS(curTailNode.pos),'map:', displayBodyMap(this.effect.bodymap, 1));
      				this.effect.bodyMap = curTailNode.branches[0];

      				//--- clear root property of each body node in the branch since it's now the main branch
              this.snake.bodyData.forEach((bodyNode) => {
                if (bodyNode.root == curTailNode) {
                  bodyNode.root = undefined;
                }
              });
              if (curTailNode == this.effect.curMutantNode) {
                this.effect.curMutantNode = undefined;
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
      				this.effect.bodyMap.splice(this.effect.bodymap.indexOf(curTailNode), 1);
      			}
//console.log('tail:',this.DBGPOS(curTailNode.pos),'map:', displayBodyMap(this.effect.bodymap, 1));

      			break;
      		}
      	}
      },
      _applySplitEffect(arg) {
        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._SPLIT) {
              this.effect = {
                type: EN_.EFFECT._SPLIT,
                curSplitCtrlID: 0,
                split: [],
              };
            }

            let splitLength = Math.floor(arg.snakeData.bodyData.length / 2);
            arg.snakeData.length -= splitLength;

            this.effect.split.push({
              length: splitLength,
              curHeadingDir: this.getMovingDir(arg.snakeData.bodyData[arg.snakeData.bodyData.length - 1].pos, arg.snakeData.trailingData[0].pos),
              bodyData: arg.snakeData.bodyData.splice((arg.snakeData.bodyData.length - splitLength), splitLength).reverse(),
              trailingLength: PA_.INIT_TRAILING_LENGTH,
              trailingData: [],
            });
for (let i = 0; i < this.effect.split.length; i++) {
  console.log(this.effect.split[i].length);
}
            break;
          }
          case EN_.ACTION._ACTION: {
            switch (arg.key) {
              case EN_.DIR._BTN_A: {
                this.effect.curSplitCtrlID = (this.effect.curSplitCtrlID + 1) % this.effect.split.length;
                break;
              }
              case EN_.DIR._BTN_B: {
                this.effect.split[this.effect.curSplitCtrlID].curHeadingDir = (this.effect.split[this.effect.curSplitCtrlID].curHeadingDir + 1) % 4;
                break;
              }
              case EN_.DIR._BTN_C: {
                this.effect.split[this.effect.curSplitCtrlID].curHeadingDir = (this.effect.split[this.effect.curSplitCtrlID].curHeadingDir + 3) % 4;
                break;
              }
            }

            break;
          }
        }
      },
      _applyCirculatedEffect(arg) {
        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._CIRCULATED) {
              this.effect = {
                type: EN_.EFFECT._CIRCULATED,
                curDegree: 45,
              };
            }

            this.effect.curDegree = (this.effect.curDegree + 45) % 360;
            break;
          }
          case EN_.ACTION._HEAD_MOVE: {
            let nextHeadPos;

            if (this.effect.curDegree % 90 == 0) {
              nextHeadPos = this.getNextPos(this.snake.bodyData[0].pos,
                (this.snake.curHeadingDir + (this.effect.curDegree / 90)) % 4);
            } else {
              let curHeadingDirHalfVec = (this.snake.curHeadingDir + ((this.effect.curDegree - 45) / 90)) % 4;
              nextHeadPos = this.getNextPos(this.getNextPos(this.snake.bodyData[0].pos, curHeadingDirHalfVec), (curHeadingDirHalfVec + 1) % 4);
            }

            return nextHeadPos;
          }
          case EN_.ACTION._ACTION: {
            this.effect.curDegree = (this.effect.curDegree + 45) % 360;
            break;
          }
        }
      },
      _applyFrozenEffect(arg) {
        var ret = false;

        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._FROZEN) {
              this.effect = {
                type: EN_.EFFECT._FROZEN,
                movingDir: undefined,
              };
            }

            break;
          }
          case EN_.ACTION._STEP_MOVE: {
            if (Math.random() >= PA_.FROZEN_CHANCE) {
              //--- restore to normal gameStep
              this.colorSet.snake = PA_.DEFAULT_SNAKE_COLOR;
              this.effect.movingDir = undefined;
            } else {
              //--- frozen gameStep
              if (this.effect.movingDir == undefined) {
                //--- initialize
                this.colorSet.snake = PA_.FROZEN_COLOR;
                this.effect.movingDir = this.snake.curHeadingDir;

                if (this.snake.length > this.snake.bodyData.length) {
                  this.snake.length = this.snake.bodyData.length;
                }
              }

              //--- frozen body move
              this.snake.bodyData.forEach((bodyNode) => {
                this.map.splice(bodyNode.pos, 1, null);
                bodyNode.pos = this.getNextPos(bodyNode.pos, this.effect.movingDir);
              });
              this.snake.bodyData.forEach((bodyNode) => {
                if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN_.NODE_TYPE._PREY) {
                  this._devourPrey(bodyNode.pos, this.snake);
                }
                this.map.splice(bodyNode.pos, 1, {
                  type: EN_.NODE_TYPE._SNAKE,
                });
              });

              ret = true;
            }

            break;
          }
          case EN_.ACTION._CTRL_INPUT: {
            if (this.effect.movingDir != undefined) {
              this.effect.movingDir = arg.dir;
//              console.log('frozen:',this.effect.movingDir);
              ret = true;
            }

            break;
          }
        }

        return ret;
      },
      _applyDimensionalEffect(arg) {
        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._DIMENSIONAL) {
              this.effect = {
                type: EN_.EFFECT._DIMENSIONAL,
              };
            }

            break;
          }
          case EN_.ACTION._ACTION: {
            this.nextHeadPos = this.getRandomAvailablePos();

            break;
          }
          case EN_.ACTION._HEAD_MOVE: {
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
        if (this.effect.type != EN_.EFFECT._EARTHQUAKE) {
          this.effect = {
            type: EN_.EFFECT._EARTHQUAKE,
          };
        }

        let shakingDir = Math.floor(Math.random() * 4);

        this.snake.bodyData.forEach((bodyNode) => {
          this.map.splice(bodyNode.pos, 1, null);
          bodyNode.pos = this.getNextPos(bodyNode.pos, shakingDir);
        });
        this.snake.bodyData.forEach((bodyNode) => {
          if (this.snake.bodyData.indexOf(bodyNode) == 0) {
            if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN_.NODE_TYPE._PREY) {
              this._devourPrey(nodyNode.pos, this.snake);
            }
            this.map.splice(bodyNode.pos, 1, {
              type: EN_.NODE_TYPE._SNAKE,
              color: PA_.DEFAULT_SNAKE_HEAD_COLOR,
            });
          } else {
            if (this.map[bodyNode.pos] && this.map[bodyNode.pos].type == EN_.NODE_TYPE._PREY) {
              this._scoutNewPrey();
            }
            this.map.splice(bodyNode.pos, 1, {
              type: EN_.NODE_TYPE._SNAKE,
            });
          }
        });

        setTimeout(this._applyEarthQuakeEffect, (40 * (Math.floor(Math.random() * 10) + 1)));
      },
      _applyBomberEffect(arg) {
        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._BOMBER) {
              this.effect = {
                type: EN_.EFFECT._BOMBER,
                nodeNum: Math.floor(Math.random() * (this.snake.bodyData.length - 1)) + 1,
                CountDown: Math.floor(Math.random() * PA_.BOMBER_MAX_COUNTDOWN) + 1,
              };
//console.log('num:',this.bomberBodyNodeNum);
              this.effect.curCountDown = this.effect.CountDown;
              this.colorSet.snake = PA_.BOMBER_COLOR[this.effect.curCountDown];
            }

            break;
          }
          case EN_.ACTION._STEP_MOVE: {
            if (this.effect.curCountDown) {
//console.log('cnt:',this.effect.curCountDown);
              this.effect.curCountDown--;
              this.colorSet.snake = PA_.BOMBER_COLOR[Math.floor(this.effect.curCountDown * PA_.BOMBER_COLOR.length / this.effect.countDown)];

              if (this.effect.curCountDown == 0) {
                this.snake.trailingData = [this.snake.bodyData[this.snake.bodyData.length - this.effect.nodeNum]];

                let cnt = 0;
                do {
                  this.map.splice(this.snake.bodyData[this.snake.bodyData.length - 1].pos, 1, null);

                  //--- split body into pieces and randomly place on map
                  this.map.splice(this.getRandomAvailablePos(), 1, {
                    type: EN_.NODE_TYPE._PREY,
                    effect: EN_.EFFECT._NORMAL,
                    color: PA_.DEFAULT_SNAKE_COLOR,
                  });

                  this.snake.bodyData.pop();
                  cnt++;
                } while (cnt < this.effect.nodeNum);

                this.snake.length = this.snake.bodyData.length;

                this.effect = {
                  type: EN_.EFFECT._NORMAL,
                }
              }
            }

            break;
          }
        }
      },
      _applyWormlikeEffect(arg) {
        switch (arg.action) {
          case EN_.ACTION._INIT: {
            if (this.effect.type != EN_.EFFECT._WORMLIKE) {
              this.effect = {
                type: EN_.EFFECT._WORMLIKE,
                isShrinking: true,
              };
            }

            break;
          }
          case EN_.ACTION._ACTION: {
            this.effect.isShrinking = !this.effect.isShrinking;
            break;
          }
          case EN_.ACTION._HEAD_MOVE: {
            return this.effect.isShrinking;
          }
          case EN_.ACTION._TAIL_MOVE: {
            return (this.effect.isShrinking && this.snake.bodyData.length > 1);
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
            case EN_.DIR._LEFT: {
              nextPos -= 1;
              if (isContinuous && (curPos % this.mapSize.width) == 0) {
                nextPos += this.mapSize.width;
              }
              break;
            }
            case EN_.DIR._UP: {
              nextPos -= this.mapSize.width;
              if (isContinuous && nextPos < 0) {
                nextPos += (this.mapSize.width * this.mapSize.height);
              }
              break;
            }
            case EN_.DIR._RIGHT: {
              nextPos += 1;
              if (isContinuous && (curPos % this.mapSize.width) == (this.mapSize.width - 1)) {
                nextPos -= this.mapSize.width;
              }
              break;
            }
            case EN_.DIR._DOWN: {
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
      			ret = EN_.DIR._LEFT;
      			break;

      		case -this.mapSize.width:
      		case ((this.mapSize.height - 1) * this.mapSize.width):
      			ret = EN_.DIR._UP;
      			break;
      		case 1:
      		case -(this.mapSize.width - 1):
      			ret = EN_.DIR._RIGHT;
      			break;
      		case this.mapSize.width:
      		case -((this.mapSize.height - 1) * this.mapSize.width):
      			ret = EN_.DIR._DOWN;
      			break;
      	}

      	return ret;
      },
      handleControlInput(dir) {
        switch (this.effect.type) {
          case EN_.EFFECT._DRUNK: {
            if (this._applyDrunkEffect({
              action: EN_.ACTION._CTRL_INPUT,
            })) {
              return;
            }
            break;
          }
          case EN_.EFFECT._CIRCULATED: {
            return;
          }
          case EN_.EFFECT._FROZEN: {
            if (this._applyFrozenEffect({
              action: EN_.ACTION._CTRL_INPUT,
              dir: dir,
            })) {
              return;
            }
            break;
          }
          case EN_.EFFECT._UPSIDEDOWN: {
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
        if (event.keyCode == EN_.DIR._BTN_A ||
          event.keyCode == EN_.DIR._BTN_B ||
          event.keyCode == EN_.DIR._BTN_C) {
          event.preventDefault();

          if (vm.effect.type == EN_.EFFECT._SPLIT) {
            vm._applySplitEffect({
              action: EN_.ACTION._ACTION,
              key: event.keyCode,
            });
          } else if (vm.effect.type == EN_.EFFECT._CIRCULATED) {
            vm._applyCirculatedEffect({
              action: EN_.ACTION._ACTION,
            });
          } else if (vm.effect.type == EN_.EFFECT._DIMENSIONAL) {
            vm._applyDimensionalEffect({
              action: EN_.ACTION._ACTION,
            });
          } else if (vm.effect.type == EN_.EFFECT._WORMLIKE) {
            vm._applyWormlikeEffect({
              action: EN_.ACTION._ACTION,
            });
          }
        } else {
          let dir = event.keyCode - EN_.DIR._BASE;

          if ((dir >= EN_.DIR._LEFT) && (dir <= EN_.DIR._DOWN)) {
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
