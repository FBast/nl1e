/**
 * @typedef {Object} DecreaseAttribute
 * @property {number} reduction
 */

import {DynamicAttribute} from "../attribute.mjs";

/**
 * @type {DecreaseAttribute}
 */
export class DecreaseAttribute extends DynamicAttribute {

    reduction;

    constructor(item) {
        super(item);
        this.reduction = 0;
    }

    calculate(characterActor, targetActors) {
        return [];
    }

    apply(actors) {
        return undefined;
    }

}