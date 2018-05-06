import * as EN_ from '../../include/Enums'

import { CBasicPhaseHandler } from './CBasicPhaseHandler'
import { CReversedEffectModifier } from './CReversedEffectModifier'

export class CPhaseHandler {
  constructor(processor) {
    this.processor = processor;
    this.modifier = new CBasicPhaseHandler(this.processor);
  }

  runPhase(phase, args = null) {
    switch (phase) {
      case EN_.PHASE._PRE_STEP_MOVE:
        return this.modifier.runPreStepMovePhase(args);
      case EN_.PHASE._HEAD_MOVE_CHECK:
        return this.modifier.runHeadMoveCheckPhase(args);
      case EN_.PHASE._HEAD_MOVE:
        if (args.foundPrey && args.foundPrey.effect != EN_.EFFECT._NORMAL) {
          this.updateModifier(args.foundPrey.effect);
        }
        return this.modifier.runHeadMovePhase(args);
      case EN_.PHASE._TAIL_MOVE:
        return this.modifier.runTailMovePhase(args);
      case EN_.PHASE._POST_STEP_MOVE:
        return this.modifier.runPostStepMovePhase(args);
      case EN_.PHASE._APPOINTMENT:
        return this.modifier.runAppointmentPhase(args);
    }
  }
  updateModifier(effect) {
    switch (effect) {
      case EN_.EFFECT._REVERSED:
        this.modifier = new CReversedEffectModifier(this.processor);
        break;
      default:
        this.modifier = new CBasicPhaseHandler(this.processor);
        break;
    }

    this.modifier.init();
  }
}
