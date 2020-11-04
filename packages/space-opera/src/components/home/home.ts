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

import '@material/mwc-tab';
import '../shared/expandable_content/expandable_tab.js';

import {customElement, html, property} from 'lit-element';

import {homeStyles} from '../../styles.css.js';
import {ConnectedLitElement} from '../connected_lit_element/connected_lit_element.js';

const CARD_CONTENT = {
  quick: {
    icon: 'play_arrow',
    header: 'Assembly Line',
    body:
        'This module is for beginners. Assembly Line is a bundle of features including: loading, basic editing, and export.'
  },
  save: {
    icon:
        'https://fonts.gstatic.com/s/i/materialiconsextended/save/v6/grey600-24dp/1x/baseline_save_grey600_24dp.png',
    header: 'Import/ Export',
    body:
        'Import or export your GLB models as well as insert or copy &lt;model-viewer&gt; HTML snippets.'
  },
  edit: {
    icon:
        'https://fonts.gstatic.com/s/i/googlematerialicons/create/v6/grey600-24dp/1x/gm_create_grey600_24dp.png',
    header: 'Edit',
    body: 'Adjust your lighting, hotspots, or posters in finer detail.'
  },
  camera: {
    icon:
        'https://fonts.gstatic.com/s/i/materialiconsextended/photo_camera/v6/grey600-24dp/1x/baseline_photo_camera_grey600_24dp.png',
    header: 'Camera',
    body:
        'Update the camera settings including adding interactivity, rotation, and targets.'
  },
  materials: {
    icon:
        'https://fonts.gstatic.com/s/i/materialiconsextended/color_lens/v7/grey600-24dp/1x/baseline_color_lens_grey600_24dp.png',
    header: 'Materials',
    body:
        'Modify properties of materials such as color, metallic roughness, normal maps, etc.'
  },
  inspector: {
    icon:
        'https://fonts.gstatic.com/s/i/materialiconsextended/search/v7/grey600-24dp/1x/baseline_search_grey600_24dp.png',
    header: 'Inspector',
    body: 'Visualize the gltf json string generated from your imported model.'
  }
};

/**
 * Home Container Card
 */
@customElement('home-container-card')
export class HomeContainerCard extends ConnectedLitElement {
  static styles = homeStyles;
  @property({type: String, reflect: true}) icon = '';
  @property({type: String}) homeCardHeader = '';
  @property({type: String}) homeCardBody = '';

  render() {
    return html`
      <div class="CardContainer">
        <div class="CardContent">
          <img src=${this.icon}>
        </div>
        <div class="CardContent text">
          <div class="HomeCardHeader">${this.homeCardHeader}</div> 
          <div class="HomeCardContent">${this.homeCardBody}</div>
        </div>
      </div>
    `;
  }
}

/**
 * Home Container
 */
@customElement('home-container')
export class HomeContainer extends ConnectedLitElement {
  static styles = homeStyles;

  render() {
    return html`
      <me-expandable-tab tabName="Home" .open=${true} .sticky=${true}>
        <div slot="content">
          <div class="note">
            Welcome to the model viewer editor where you can generate &lt;model-viewer&gt; HTML snippets, as well as edit GLBs.
          </div>
          <a href="https://policies.google.com/privacy" style="color: black">Privacy</a>
        </div>
      </me-expandable-tab>
      <me-expandable-tab tabName="Modules" .open=${true}>
        <div slot="content">
          <me-card title="File Manager">
            <div slot="content">
              <home-container-card 
                icon=${CARD_CONTENT.save.icon}
                homeCardHeader=${CARD_CONTENT.save.header}
                homeCardBody=${CARD_CONTENT.save.body}
              ></home-container-card>
            </div>
          </me-card>
          <me-card title="model-viewer snippet">
            <div slot="content">
              <home-container-card 
                icon=${CARD_CONTENT.edit.icon}
                homeCardHeader=${CARD_CONTENT.edit.header}
                homeCardBody=${CARD_CONTENT.edit.body}
              ></home-container-card>
              <home-container-card 
                icon=${CARD_CONTENT.camera.icon}
                homeCardHeader=${CARD_CONTENT.camera.header}
                homeCardBody=${CARD_CONTENT.camera.body}
              ></home-container-card>
            </div>
          </me-card>
          <me-card title="GLB Model">
            <div slot="content">
              <home-container-card 
                icon=${CARD_CONTENT.materials.icon}
                homeCardHeader=${CARD_CONTENT.materials.header}
                homeCardBody=${CARD_CONTENT.materials.body}
              ></home-container-card>
              <home-container-card 
                icon=${CARD_CONTENT.inspector.icon}
                homeCardHeader=${CARD_CONTENT.inspector.header}
                homeCardBody=${CARD_CONTENT.inspector.body}
              ></home-container-card>
            </div>
          </me-card>
        </div>
      </me-expandable-tab>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-container': HomeContainer;
    'home-container-card': HomeContainerCard;
  }
}
