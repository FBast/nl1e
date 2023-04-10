/**
 * @typedef {Object} EffectAttribute
 */

import {DynamicAttribute} from "../dynamicAttribute.mjs";

/**
 * @type {EffectAttribute}
 */
export class EffectAttribute extends DynamicAttribute {

    calculate(characterActor, targetActors) {
        return [];
    }

    apply(actors) {
        return undefined;
    }

}