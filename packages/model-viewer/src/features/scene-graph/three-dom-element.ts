/* @license
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
 */

import {Material, Object3D, Texture} from 'three';

import {GLTF, GLTFElement} from '../../three-components/gltf-instance/gltf-2.0.js';

import {Model, ThreeDOMElement as ThreeDOMElementInterface} from './api.js';
import {ModelGraft} from './model-graft.js';

export const $correlatedObjects = Symbol('correlatedObjects');
export const $sourceObject = Symbol('sourceObject');
const $graft = Symbol('graft');

export type CorrelatedObjects = Set<Object3D>|Set<Material>|Set<Texture>;

/**
 * A SerializableThreeDOMElement is the common primitive of all scene graph
 * elements that have been facaded in the host execution context. It adds
 * a common interface to these elements in support of convenient
 * serializability.
 */
export class ThreeDOMElement implements ThreeDOMElementInterface {
  private[$graft]: ModelGraft;
  // The canonical GLTF or GLTFElement represented by this facade.
  readonly[$sourceObject]: GLTFElement|GLTF;
  // The backing Three.js scene graph construct for this element.
  readonly[$correlatedObjects]: CorrelatedObjects|null;

  constructor(
      graft: ModelGraft, element: GLTFElement|GLTF,
      correlatedObjects: CorrelatedObjects|null = null) {
    this[$graft] = graft;
    this[$sourceObject] = element;
    this[$correlatedObjects] = correlatedObjects;
  }

  /**
   * The Model of provenance for this scene graph element.
   */
  get ownerModel(): Model {
    return this[$graft].model;
  }

  /**
   * Some (but not all) scene graph elements may have an optional name. The
   * Object3D.prototype.name property is sometimes auto-generated by Three.js.
   * We only want to expose a name that is set in the source glTF, so Three.js
   * generated names are ignored.
   */
  get name(): string|undefined {
    return (this[$sourceObject] as unknown as {name?: string}).name ||
        undefined;
  }
}
