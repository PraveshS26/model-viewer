/* @license
 * Copyright 2023 Google LLC. All Rights Reserved.
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

import { ModelViewerElement } from '@beilinson/model-viewer';
import { EventDispatcher, WebGLRenderer } from 'three';

export const timePasses = (ms: number = 0): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Converts a partial URL string to a fully qualified URL string.
 *
 * @param {String} url
 * @return {String}
 */
export const toFullUrl = (partialUrl: string): string => {
  const url = new URL(partialUrl, window.location.toString());
  return url.toString();
};

export const deserializeUrl = (url: string | null): string | null => (!!url && url !== 'null' ? toFullUrl(url) : null);

export const elementFromLocalPoint = (document: Document | ShadowRoot, x: number, y: number): Element | null => {
  const host: HTMLElement = document === window.document ? window.document.body : ((document as ShadowRoot).host as HTMLElement);
  const actualDocument = (window as any).ShadyCSS ? window.document : document;
  const boundingRect = host.getBoundingClientRect();

  return actualDocument.elementFromPoint(boundingRect.left + x, boundingRect.top + y);
};

export const pickShadowDescendant = (element: Element, x: number = 0, y: number = 0): Element | null => {
  return element.shadowRoot != null ? elementFromLocalPoint(element.shadowRoot, x, y) : null;
};

export const rafPasses = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));

export interface SyntheticEventProperties {
  clientX?: number;
  clientY?: number;
  deltaY?: number;
  key?: string;
  shiftKey?: boolean;
}

/**
 * Dispatch a synthetic event on a given element with a given type, and
 * optionally with custom event properties. Returns the dispatched event.
 *
 * @param {HTMLElement} element
 * @param {type} string
 * @param {*} properties
 */
export const dispatchSyntheticEvent = (
  target: EventTarget,
  type: string,
  properties: SyntheticEventProperties = {
    clientX: 0,
    clientY: 0,
    deltaY: 1.0,
  }
): CustomEvent => {
  const event = new CustomEvent(type, { cancelable: true, bubbles: true });
  Object.assign(event, properties);
  target.dispatchEvent(event);
  return event;
};

export const ASSETS_DIRECTORY = '../base/shared-assets/';

/**
 * Returns the full path for an asset by name. This is a convenience helper so
 * that we don't need to change paths throughout all test suites if we ever
 * decide to move files around.
 *
 * @param {string} name
 * @return {string}
 */
export const assetPath = (name: string): string => deserializeUrl(`${ASSETS_DIRECTORY}${name}`)!;

/**
 * Returns true if the given element is in the tree of the document of the
 * current frame.
 *
 * @param {HTMLElement} element
 * @return {boolean}
 */
export const isInDocumentTree = (node: Node): boolean => {
  let root: Node = node.getRootNode();

  while (root !== node && root != null) {
    if (root.nodeType === Node.DOCUMENT_NODE) {
      return root === document;
    }

    root = (root as ShadowRoot).host && (root as ShadowRoot).host.getRootNode();
  }

  return false;
};

/**
 * "Spies" on a particular object by replacing a specified part of its
 * implementation with a custom version. Returns a function that restores the
 * original implementation to the object when invoked.
 */
export const spy = (object: Object, property: string, descriptor: PropertyDescriptor): (() => void) => {
  let sourcePrototype = object;

  while (sourcePrototype != null && !sourcePrototype.hasOwnProperty(property)) {
    sourcePrototype = (sourcePrototype as any).__proto__;
  }

  if (sourcePrototype == null) {
    throw new Error(`Cannot spy property "${property}" on ${object}`);
  }

  const originalDescriptor = Object.getOwnPropertyDescriptor(sourcePrototype, property);

  if (originalDescriptor == null) {
    throw new Error(`Cannot read descriptor of "${property}" on ${object}`);
  }

  Object.defineProperty(sourcePrototype, property, descriptor);

  return () => {
    Object.defineProperty(sourcePrototype, property, originalDescriptor);
  };
};

/**
 * Creates a ModelViewerElement with a given src, attaches to document as first child and returns
 * @param src Model to load
 * @returns element
 */
export const createModelViewerElement = (src: string | null): ModelViewerElement => {
  const element = new ModelViewerElement();
  document.body.insertBefore(element, document.body.firstChild);
  element.src = src;
  return element;
};

/**
 * Three.js EventDispatcher and DOM EventTarget use different event patterns,
 * so AnyEvent covers the shape of both event types.
 */
export type AnyEvent = Event | CustomEvent<any> | { [index: string]: string };

export type PredicateFunction<T = void> = (value: T) => boolean;

/**
 * @param {EventTarget|EventDispatcher} target
 * @param {string} eventName
 * @param {?Function} predicate
 */
export const waitForEvent = <T extends AnyEvent = Event>(
  target: EventTarget | EventDispatcher,
  eventName: string,
  predicate: PredicateFunction<T> | null = null
): Promise<T> =>
  new Promise((resolve) => {
    function handler(event: AnyEvent) {
      if (!predicate || predicate(event as T)) {
        resolve(event as T);
        target.removeEventListener(eventName, handler);
      }
    }
    target.addEventListener(eventName, handler);
  });

const COMPONENTS_PER_PIXEL = 4;

export function screenshot(renderer: WebGLRenderer) {
  const screenshotContext = renderer.getContext();
  const width = screenshotContext.drawingBufferWidth;
  const height = screenshotContext.drawingBufferHeight;

  const pixels = new Uint8Array(width * height * COMPONENTS_PER_PIXEL);
  // this function reads in the bottom-up direction from the coordinate
  // specified ((0,0) is the bottom-left corner).
  screenshotContext.readPixels(0, 0, width, height, screenshotContext.RGBA, screenshotContext.UNSIGNED_BYTE, pixels);

  return pixels;
}

interface TypedArray<T = unknown> {
  readonly BYTES_PER_ELEMENT: number;
  length: number;
  [n: number]: T;
  reduce(
    callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8Array) => number,
    initialValue?: number
  ): number;
}

export function ArraysAreEqual(arr1: TypedArray, arr2: TypedArray): boolean {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}

/**
 *
 * @param arr1
 * @param arr2
 * @returns Percentage of similarity
 */
export function CompareArrays(arr1: TypedArray<number>, arr2: TypedArray<number>): number {
  if (arr1.length !== arr2.length || arr1.BYTES_PER_ELEMENT !== arr2.BYTES_PER_ELEMENT) return 0;

  let similarity: number[] = [];
  const max = maxValue(arr1.BYTES_PER_ELEMENT);
  for (let i = 0; i < arr1.length; i++) {
    similarity.push(percentage(arr1[i], arr2[i], max));
  }
  return average(similarity);
}

function maxValue(bytes: number): number {
  return Math.pow(2, 8 * bytes) - 1;
}

function percentage(n1: number, n2: number, maxN: number): number {
  return Math.abs(n1 - n2) / maxN;
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
