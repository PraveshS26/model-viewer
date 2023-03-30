/* @license
 * Copyright 2023 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MVBloomEffect } from './effects/bloom.js';
import { MVColorGradeEffect } from './effects/color-grade.js';
import { MVFXAAEffect } from './effects/fxaa.js';
import { MVGlitchEffect } from './effects/glitch.js';
import { MVOutlineEffect } from './effects/outline.js';
import { MVPixelateEffect } from './effects/pixelate.js';
import { MVSMAAEffect } from './effects/smaa.js';
import { MVSSAOEffect } from './effects/ssao.js';
import { MVEffectComposer } from './effect-composer.js';
import { MVEffectBase } from './effects/mixins/effect-base.js';

customElements.define('effect-composer', MVEffectComposer);
customElements.define('pixelate-effect', MVPixelateEffect);
customElements.define('bloom-effect', MVBloomEffect);
customElements.define('color-grade-effect', MVColorGradeEffect);
customElements.define('outline-effect', MVOutlineEffect);
customElements.define('smaa-effect', MVSMAAEffect);
customElements.define('fxaa-effect', MVFXAAEffect);
customElements.define('ssao-effect', MVSSAOEffect);
customElements.define('glitch-effect', MVGlitchEffect);

declare global {
  interface HTMLElementTagNameMap {
    'effect-composer': MVEffectComposer;
    'pixelate-effect': MVPixelateEffect;
    'bloom-effect': MVBloomEffect;
    'color-grade-effect': MVColorGradeEffect;
    'outline-effect': MVOutlineEffect;
    'smaa-effect': MVSMAAEffect;
    'fxaa-effect': MVFXAAEffect;
    'ssao-effect': MVSSAOEffect;
    'glitch-effect': MVGlitchEffect;
  }
}

export {
  MVEffectComposer,
  MVPixelateEffect,
  MVBloomEffect,
  MVColorGradeEffect,
  MVOutlineEffect,
  MVSMAAEffect,
  MVFXAAEffect,
  MVSSAOEffect,
  MVGlitchEffect,
  MVEffectBase,
};
