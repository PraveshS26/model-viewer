import {Vector3} from 'three';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {normalizeUnit} from '../../styles/conversions.js';
import {NumberNode, parseExpressions} from '../../styles/parsers.js';

export interface HotspotVisibilityDetails {
  visible: boolean;
}

/**
 * Hotspots are configured by slot name, and this name must begin with "hotspot"
 * to be recognized. The position and normal strings are in the form of the
 * camera-target attribute and default to "0m 0m 0m" and "0m 1m 0m",
 * respectively.
 */
export interface HotspotConfiguration {
  name: string;
  position?: string;
  normal?: string;
  visibilityAttribute?: string;
}

const $slot = Symbol('slot');
const $referenceCount = Symbol('referenceCount');
const $updateVisibility = Symbol('updateVisibility');
const $visible = Symbol('visible');

const $onSlotchange = Symbol('onSlotchange');
const $slotchangeHandler = Symbol('slotchangeHandler');

/**
 * The Hotspot object is a reference-counted slot. If decrement() returns true,
 * it should be removed from the tree so it can be garbage-collected.
 */
export class Hotspot extends CSS2DObject {
  public normal: Vector3 = new Vector3(0, 1, 0);
  private[$visible] = false;
  private[$referenceCount] = 1;
  private[$slot]: HTMLSlotElement = document.createElement('slot');
  private[$slotchangeHandler] = () => this[$onSlotchange]();

  constructor(config: HotspotConfiguration) {
    super(document.createElement('div'));

    this.element.classList.add('annotation-wrapper');

    this[$slot].name = config.name;
    this[$slot].addEventListener('slotchange', this[$slotchangeHandler]);

    this.element.appendChild(this[$slot]);

    this.updatePosition(config.position);
    this.updateNormal(config.normal);

    this.show();
  }

  /**
   * Sets the hotspot to be in the highly visible foreground state.
   */
  show() {
    if (!this[$visible]) {
      this[$visible] = true;
      this[$updateVisibility]({notify: true});
    }
  }

  /**
   * Sets the hotspot to be in the diminished background state.
   */
  hide() {
    if (this[$visible]) {
      this[$visible] = false;
      this[$updateVisibility]({notify: true});
    }
  }

  /**
   * Cleans up the held references of this Hotspot when it is done being used.
   */
  dispose() {
    this[$slot].removeEventListener('slotchange', this[$slotchangeHandler]);
  }

  /**
   * Call this when adding elements to the same slot to keep track.
   */
  increment() {
    this[$referenceCount]++;
  }

  /**
   * Call this when removing elements from the slot; returns true when the slot
   * is unused.
   */
  decrement(): boolean {
    if (this[$referenceCount] > 0) {
      --this[$referenceCount];
    }
    return this[$referenceCount] === 0;
  }

  /**
   * Change the position of the hotspot to the input string, in the same format
   * as the data-position attribute.
   */
  updatePosition(position?: string) {
    if (position == null)
      return;
    const positionNodes = parseExpressions(position)[0].terms;
    for (let i = 0; i < 3; ++i) {
      this.position.setComponent(
          i, normalizeUnit(positionNodes[i] as NumberNode<'m'>).number);
    }
  }

  /**
   * Change the hotspot's normal to the input string, in the same format as the
   * data-normal attribute.
   */
  updateNormal(normal?: string) {
    if (normal == null)
      return;
    const normalNodes = parseExpressions(normal)[0].terms;
    for (let i = 0; i < 3; ++i) {
      this.normal.setComponent(
          i, normalizeUnit(normalNodes[i] as NumberNode<'m'>).number);
    }
  }

  protected[$updateVisibility]({notify}: {notify: boolean}) {
    this.element.classList.toggle('hide', !this[$visible]);

    // NOTE: ShadyDOM doesn't support slot.assignedElements, otherwise we could
    // use that here.
    this[$slot].assignedNodes().forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const element = node as HTMLElement;
      const visibilityAttribute = element.dataset.visibilityAttribute;

      if (visibilityAttribute != null) {
        const attributeName = `data-${visibilityAttribute}`;

        // NOTE: IE11 doesn't support toggleAttribute
        if (this[$visible]) {
          element.setAttribute(attributeName, '');
        } else {
          element.removeAttribute(attributeName);
        }
      }

      if (notify) {
        element.dispatchEvent(new CustomEvent('hotspot-visibility', {
          detail: {
            visible: this[$visible],
          },
        }));
      }
    });
  }

  protected[$onSlotchange]() {
    this[$updateVisibility]({notify: false});
  }
}