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

import {DoubleSide, FrontSide, MeshStandardMaterial, NoBlending, NormalBlending} from 'three';

import {AlphaMode, GLTF, Material as GLTFMaterial} from '../../three-components/gltf-instance/gltf-2.0.js';
import {ALPHA_CUTOFF_BLEND, ALPHA_CUTOFF_GLTF_DEFAULT, ALPHA_CUTOFF_OPAQUE} from '../../three-components/gltf-instance/ModelViewerGLTFInstance.js';

import {Material as MaterialInterface, RGB} from './api.js';
import {PBRMetallicRoughness} from './pbr-metallic-roughness.js';
import {TextureInfo, TextureUsage} from './texture-info.js';
import {$correlatedObjects, $onUpdate, $sourceObject, ThreeDOMElement} from './three-dom-element.js';



const $pbrMetallicRoughness = Symbol('pbrMetallicRoughness');
const $normalTexture = Symbol('normalTexture');
const $occlusionTexture = Symbol('occlusionTexture');
const $emissiveTexture = Symbol('emissiveTexture');
const $backingThreeMaterial = Symbol('backingThreeMaterial');

/**
 * Material facade implementation for Three.js materials
 */
export class Material extends ThreeDOMElement implements MaterialInterface {
  private[$pbrMetallicRoughness]: PBRMetallicRoughness;

  private[$normalTexture]: TextureInfo;
  private[$occlusionTexture]: TextureInfo;
  private[$emissiveTexture]: TextureInfo;
  get[$backingThreeMaterial](): MeshStandardMaterial {
    return (this[$correlatedObjects] as Set<MeshStandardMaterial>)
        .values()
        .next()
        .value;
  }
  constructor(
      onUpdate: () => void, gltf: GLTF, gltfMaterial: GLTFMaterial,
      correlatedMaterials: Set<MeshStandardMaterial>|undefined) {
    super(onUpdate, gltfMaterial, correlatedMaterials);

    if (correlatedMaterials == null) {
      return;
    }

    if (gltfMaterial.pbrMetallicRoughness == null) {
      gltfMaterial.pbrMetallicRoughness = {};
    }
    this[$pbrMetallicRoughness] = new PBRMetallicRoughness(
        onUpdate, gltf, gltfMaterial.pbrMetallicRoughness, correlatedMaterials);

    if (gltfMaterial.emissiveFactor == null) {
      gltfMaterial.emissiveFactor = [0, 0, 0];
    }

    const {
      normalTexture: gltfNormalTexture,
      occlusionTexture: gltfOcculsionTexture,
      emissiveTexture: gltfEmissiveTexture
    } = gltfMaterial;

    const {normalMap, aoMap, emissiveMap} =
        correlatedMaterials.values().next().value;

    this[$normalTexture] = new TextureInfo(
        onUpdate,
        TextureUsage.Normal,
        normalMap,
        correlatedMaterials,
        gltf,
        gltfNormalTexture ? gltfNormalTexture : null,
    );

    this[$occlusionTexture] = new TextureInfo(
        onUpdate,
        TextureUsage.Occlusion,
        aoMap,
        correlatedMaterials,
        gltf,
        gltfOcculsionTexture ? gltfOcculsionTexture : null,
    );

    this[$emissiveTexture] = new TextureInfo(
        onUpdate,
        TextureUsage.Emissive,
        emissiveMap,
        correlatedMaterials,
        gltf,
        gltfEmissiveTexture ? gltfEmissiveTexture : null,
    );

    const message = (textureType: string) => {
      console.info(`A group of three.js materials are represented as a
        single material but share different ${textureType} textures.`);
    };
    for (const gltfMaterial of correlatedMaterials) {
      const {
        normalMap: verifyNormalMap,
        aoMap: verifyAoMap,
        emissiveMap: verifyEmissiveMap
      } = gltfMaterial;
      if (verifyNormalMap != normalMap) {
        message('normal');
      }
      if (verifyAoMap != aoMap) {
        message('occlusion');
      }
      if (verifyEmissiveMap != emissiveMap) {
        message('emissive');
      }
    }
  }

  get name(): string {
    return (this[$sourceObject] as any).name || '';
  }

  get pbrMetallicRoughness(): PBRMetallicRoughness {
    return this[$pbrMetallicRoughness];
  }

  get normalTexture(): TextureInfo {
    return this[$normalTexture];
  }

  get occlusionTexture(): TextureInfo {
    return this[$occlusionTexture];
  }

  get emissiveTexture(): TextureInfo {
    return this[$emissiveTexture];
  }

  get emissiveFactor(): RGB {
    return (this[$sourceObject] as GLTFMaterial).emissiveFactor!;
  }

  setEmissiveFactor(rgb: RGB) {
    for (const material of this[$correlatedObjects] as
         Set<MeshStandardMaterial>) {
      material.emissive.fromArray(rgb);
    }
    (this[$sourceObject] as GLTFMaterial).emissiveFactor = rgb;
    this[$onUpdate]();
  }

  setAlphaCutoff(cutoff: number): void {
    cutoff = Math.min(1.0, cutoff);
    for (const material of this[$correlatedObjects] as
         Set<MeshStandardMaterial>) {
      material.alphaTest = cutoff;
      material.needsUpdate = true;
    }
    (this[$sourceObject] as GLTFMaterial).alphaCutoff = cutoff;
    this[$onUpdate]();
  }

  getAlphaCutoff(): number {
    return (this[$sourceObject] as GLTFMaterial).alphaCutoff ??
        this[$correlatedObjects]!.values().next().value.alphaTest;
  }

  setDoubleSided(doubleSided: boolean): void {
    for (const material of this[$correlatedObjects] as
         Set<MeshStandardMaterial>) {
      // When double-sided is disabled gltf spec dictates that Back-Face culling
      // must be disabled, in three.js parlance that would mean FrontSide
      // rendering only.
      // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#double-sided
      material.side = doubleSided ? DoubleSide : FrontSide;
      material.needsUpdate = true;
    }
    (this[$sourceObject] as GLTFMaterial).doubleSided = doubleSided;
    this[$onUpdate]();
  }

  getDoubleSided(): boolean {
    return (this[$sourceObject] as GLTFMaterial).doubleSided ??
        this[$correlatedObjects]!.values().next().value.side === DoubleSide;
  }

  setAlphaMode(alphaMode: AlphaMode): void {
    for (const material of this[$correlatedObjects] as
         Set<MeshStandardMaterial>) {
      material.blending = NormalBlending;
      if (alphaMode === 'OPAQUE') {
        this.setAlphaCutoff(ALPHA_CUTOFF_OPAQUE);
      } else if (alphaMode === `BLEND`) {
        this.setAlphaCutoff(ALPHA_CUTOFF_BLEND);
      } else {
        // MASK mode.
        if (this.getAlphaCutoff() < 0) {
          this.setAlphaCutoff(ALPHA_CUTOFF_GLTF_DEFAULT);
        }
      }
      material.needsUpdate = true;
    }

    (this[$sourceObject] as GLTFMaterial).alphaMode = alphaMode;
    this[$onUpdate]();
  }

  getAlphaMode(): AlphaMode {
    if ((this[$sourceObject] as GLTFMaterial).alphaMode !== undefined) {
      return (this[$sourceObject] as GLTFMaterial).alphaMode!;
    }

    const blendMode = this[$correlatedObjects]!.values().next().value.blending;

    if (blendMode === NormalBlending && this.getAlphaCutoff() >= 0) {
      return 'BLEND';
    } else if (blendMode === NoBlending && this.getAlphaCutoff() > 0) {
      // Checks if masking is in use, given that three.js implements masking in
      // the shader and is thus always 'enabled'.
      return 'MASK';
    }

    return 'OPAQUE';
  }
}
