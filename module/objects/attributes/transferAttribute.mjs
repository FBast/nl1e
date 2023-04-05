/**
 * @typedef {Object} TransferAttribute
 * @property {number} reduction
 */

import {DynamicAttribute} from "../attribute.mjs";

/**
 * @type {TransferAttribute}
 */
export class TransferAttribute extends DynamicAttribute {

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