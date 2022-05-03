/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


import {customElement, state} from 'lit/decorators.js';

import {reduxStore} from '../../../space_opera_base.js';
import {State} from '../../../types.js';
import {dispatchPitchLimits} from '../../config/reducer.js';
import {getModelViewer} from '../../model_viewer_preview/reducer.js';
import {radToDeg} from '../../utils/reducer_utils.js';
import {getIsDirtyCamera} from '../reducer.js';

import {LimitsBase} from './limits_base.js';

// Pitch is degrees from the up-vector.

/** Default minimum pitch angle (degrees) */
export const DEFAULT_MIN_PITCH = 0;

/** Default maximum pitch angle (degrees) */
export const DEFAULT_MAX_PITCH = 180;


/** The Camera Settings panel. */
@customElement('me-camera-pitch-limits')
export class PitchLimits extends LimitsBase {
  @state() isDirtyCamera: boolean = false;

  stateChanged(state: State) {
    this.isDirtyCamera = getIsDirtyCamera(state);
  }

  dispatchLimits() {
    reduxStore.dispatch(dispatchPitchLimits(this.limitsProperty));
  }

  get label() {
    return 'Apply Pitch Limits';
  }

  get minimumLabel() {
    return 'Top-down Limit';
  }

  get maximumLabel() {
    return 'Bottom-up Limit';
  }

  get absoluteMinimum() {
    return DEFAULT_MIN_PITCH;
  }

  get absoluteMaximum() {
    return DEFAULT_MAX_PITCH;
  }

  get currentPreviewValue() {
    const currentOrbit = getModelViewer()!.getCameraOrbit();
    return Math.round(radToDeg(currentOrbit.phi));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-camera-pitch-limits': PitchLimits;
  }
}
