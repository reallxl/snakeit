<template>
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

      };
    },
    methods: {
      //------------------------------------------------------------------------------------------
      //  private functions
      //------------------------------------------------------------------------------------------
      _stepMove(snakeData, scheduleNext = true) {
        do {
          if (this.effectModifier.type == EN._EFFECT._SPLIT && snakeData == this.snake) {
            snakeData.split.forEach((split) => {
              this._stepMove(split, false);
            });
          }

          //--- phase 1: head move
          do {
            let nextHeadPos, curPrey = undefined;

            //--- determine next head position
            nextHeadPos = this.getNextPos(snakeData.bodyData[0].pos, snakeData.curHeadingDir);

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
            if (snakeData.bodyData.length > snakeData.length) {
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
      _devourPrey(pos, snakeData) {
        snakeData.length++;

        if (this.map[pos].color == PA_.DEFAULT_SNAKE_COLOR) {
          //--- collecting left body parts only
        } else {
          //--- apply new prey effects
          switch (this.map[pos].effect) {
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
          }

          this._scoutNewPrey();
        }
      },
      //------------------------------------------------------------------------------------------
      //  effect functions
      //------------------------------------------------------------------------------------------
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
      _applyHypedEffect(arg) {
        if (this.effectModifier.type != EN._EFFECT._HYPED) {
          this.effectModifier = {
            type: EN._EFFECT._HYPED,
          };
        }

        return (arg.tick / (Math.floor(Math.random() * (PA_.HYPED_LEVEL[PA_.HYPED_LEVEL.length - 1] - PA_.HYPED_LEVEL[0] + 1)) + PA_.HYPED_LEVEL[0]));
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
      //------------------------------------------------------------------------------------------
      //  primitive functions
      //------------------------------------------------------------------------------------------
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
        }

        if ((this.snake.bodyData.length == 1 && dir !=  this.getMovingDir(this.snake.bodyData[0].pos, this.snake.trailingData[0].pos)) ||
          (this.snake.bodyData.length > 1 && dir != this.getMovingDir(this.snake.bodyData[0].pos, this.snake.bodyData[1].pos))) {
          this.snake.curHeadingDir = dir;
        }
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
