/**
 * @typedef {Object} OverrideAttribute
 */

import {DynamicAttribute} from "../dynamicAttribute.mjs";

/**
 * @type {OverrideAttribute}
 */
export class OverrideAttribute extends DynamicAttribute {

    calculate(characterActor, targetActors) {
        return [];
    }

    apply(actors) {
        return undefined;
    }

}