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

import {Action, ModelViewerConfig, State} from '../../types.js';

import {Limits, SphericalPositionDeg, Vector3D} from './types.js';

const SET_CAMERA_CONTROLS_ENABLED = 'SET_CAMERA_CONTROLS_ENABLED';
export function dispatchCameraControlsEnabled(enabled?: boolean) {
  return {type: SET_CAMERA_CONTROLS_ENABLED, payload: !!enabled};
}

const SET_AUTO_ROTATE = 'SET_AUTO_ROTATE';
export function dispatchAutoRotate(autoRotate?: boolean) {
  return {type: SET_AUTO_ROTATE, payload: autoRotate};
}

const SET_AUTOPLAY_ENABLED = 'SET_AUTOPLAY_ENABLED';
export function dispatchAutoplayEnabled(enabled?: boolean) {
  return {type: SET_AUTOPLAY_ENABLED, payload: !!enabled};
}

const SET_ANIMATION_NAME = 'SET_ANIMATION_NAME';
export function dispatchAnimationName(animationName?: string) {
  return {type: SET_ANIMATION_NAME, payload: animationName};
}

const UPDATE_IBL = 'UPDATE_IBL';
export function dispatchEnvrionmentImage(ibl?: string) {
  return {type: UPDATE_IBL, payload: ibl};
}

const UPDATE_EXPOSURE = 'UPDATE_EXPOSURE';
export function dispatchExposure(exposure?: number) {
  return {type: UPDATE_EXPOSURE, payload: exposure};
}

const SET_USE_ENV_AS_SKYBOX = 'SET_USE_ENV_AS_SKYBOX';
export function dispatchUseEnvAsSkybox(useEnvAsSkybox?: boolean) {
  return {type: SET_USE_ENV_AS_SKYBOX, payload: useEnvAsSkybox};
}

const UPDATE_SHADOW_INTENSITY = 'UPDATE_SHADOW_INTENSITY';
export function dispatchShadowIntensity(shadowIntensity?: number) {
  return {type: UPDATE_SHADOW_INTENSITY, payload: shadowIntensity};
}

const UPDATE_SHADOW_SOFTNESS = 'UPDATE_SHADOW_SOFTNESS';
export function dispatchShadowSoftness(shadowSoftness?: number) {
  return {type: UPDATE_SHADOW_SOFTNESS, payload: shadowSoftness};
}

const SET_POSTER = 'SET_POSTER';
export function dispatchSetPoster(poster?: string) {
  return {type: SET_POSTER, payload: poster};
}

// CURRENTLY UNUSED
const SET_REVEAL = 'SET_REVEAL';
export function dispatchSetReveal(reveal?: string) {
  return {type: SET_REVEAL, payload: reveal};
}

// CAMERA //////////////

const SET_CAMERA_YAW_LIMITS = 'SET_CAMERA_YAW_LIMITS';
export function dispatchYawLimits(yawLimitsDeg?: Limits) {
  if (!yawLimitsDeg) {
    throw new Error('No limits given');
  }
  return {type: SET_CAMERA_YAW_LIMITS, payload: yawLimitsDeg};
}

const SET_CAMERA_RADIUS_LIMITS = 'SET_CAMERA_RADIUS_LIMITS';
export function dispatchRadiusLimits(radiusLimits?: Limits) {
  return {type: SET_CAMERA_RADIUS_LIMITS, payload: radiusLimits};
}

const SET_CAMERA_PITCH_LIMITS = 'SET_CAMERA_PITCH_LIMITS';
export function dispatchPitchLimits(pitchLimitsDeg?: Limits) {
  return {type: SET_CAMERA_PITCH_LIMITS, payload: pitchLimitsDeg};
}

const SET_CAMERA_FOV_LIMITS = 'SET_CAMERA_FOV_LIMITS';
export function dispatchFovLimits(fovLimitsDeg?: Limits) {
  return {type: SET_CAMERA_FOV_LIMITS, payload: fovLimitsDeg};
}

const SET_MIN_ZOOM = 'SET_MIN_ZOOM';
export function dispatchSetMinZoom(
    fovDeg: number|string, radius: number|string) {
  return {
    type: SET_MIN_ZOOM, payload: {radius: radius, fov: fovDeg}
  }
}

const SET_ZOOM_ENABLED = 'SET_ZOOM_ENABLED';
export function dispatchZoomEnabled(isEnabled: boolean) {
  return {
    type: SET_ZOOM_ENABLED, payload: isEnabled
  }
}

const SAVE_CAMERA_ORBIT = 'SAVE_CAMERA_ORBIT';
export function dispatchSaveCameraOrbit(orbit: SphericalPositionDeg|undefined) {
  return {type: SAVE_CAMERA_ORBIT, payload: orbit};
}

const SET_CAMERA_TARGET = 'SET_CAMERA_TARGET';
export function dispatchCameraTarget(target?: Vector3D) {
  return {type: SET_CAMERA_TARGET, payload: target};
}

const SET_CONFIG = 'SET_CONFIG';
export function dispatchConfig(config: ModelViewerConfig) {
  return {type: SET_CONFIG, payload: config};
}

export const getConfig = (state: State) =>
    state.entities.modelViewerSnippet.config;

export function configReducer(
    state: ModelViewerConfig = {}, action: Action): ModelViewerConfig {
  switch (action.type) {
    case SET_CONFIG: {
      return action.payload;
    }
    case SET_REVEAL:
      return {...state, reveal: action.payload};
    case SET_POSTER:
      return {
        ...state, poster: action.payload
      }
    case UPDATE_SHADOW_SOFTNESS:
      return {
        ...state, shadowSoftness: action.payload
      }
    case UPDATE_SHADOW_INTENSITY:
      return {
        ...state, shadowIntensity: action.payload
      }
    case SET_USE_ENV_AS_SKYBOX:
      return {
        ...state, useEnvAsSkybox: action.payload
      }
    case UPDATE_EXPOSURE:
      return {
        ...state, exposure: action.payload
      }
    case UPDATE_IBL:
      return {
        ...state, environmentImage: action.payload
      }
    case SET_AUTOPLAY_ENABLED:
      return {
        ...state, autoplay: action.payload
      }
    case SET_ANIMATION_NAME:
      return {...state, animationName: action.payload};
    case SET_CAMERA_CONTROLS_ENABLED:
      return {
        ...state, cameraControls: action.payload
      }
    case SET_AUTO_ROTATE:
      return {
        ...state, autoRotate: action.payload
      }
    case SET_CAMERA_TARGET:
      return {
        ...state, cameraTarget: action.payload
      }
    case SAVE_CAMERA_ORBIT:
      return {...state, cameraOrbit: action.payload};
    case SET_CAMERA_FOV_LIMITS:
      return {
        ...state, fovLimitsDeg: action.payload
      }
    case SET_CAMERA_PITCH_LIMITS:
      return {
        ...state, pitchLimitsDeg: action.payload
      }
    case SET_CAMERA_RADIUS_LIMITS:
      return {
        ...state, radiusLimits: action.payload
      }
    case SET_CAMERA_YAW_LIMITS:
      return {
        ...state, yawLimitsDeg: action.payload
      }
    case SET_MIN_ZOOM:
      return {
        ...state,
            radiusLimits: {...state.radiusLimits!, min: action.payload.radius},
            fovLimitsDeg: {...state.fovLimitsDeg!, min: action.payload.fov}
      }
    case SET_ZOOM_ENABLED:
      return {
        ...state,
            radiusLimits: {...state.radiusLimits!, enabled: action.payload},
            fovLimitsDeg: {...state.fovLimitsDeg!, enabled: action.payload}
      }
    default:
      return state;
  }
}