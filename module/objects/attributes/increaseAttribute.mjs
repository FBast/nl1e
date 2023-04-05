/**
 * @typedef {Object} IncreaseAttribute
 */

import {DynamicAttribute} from "../attribute.mjs";

/**
 * @type {IncreaseAttribute}
 */
export class IncreaseAttribute extends DynamicAttribute {

    constructor(item) {
        super(item);
    }

    calculate(characterActor, targetActors) {
        return [];
    }

    apply(actors) {
        return undefined;
    }

}