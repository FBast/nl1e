/**
 * @typedef {Object} DecreaseAttribute
 * @property {string} damageType
 */

import {DynamicAttribute} from "../attribute.mjs";

/**
 * @type {DecreaseAttribute}
 */
export class DecreaseAttribute extends DynamicAttribute {

    constructor(item) {
        super(item);
        this.name = "decrease";
        this.value = 0;
        this.dataGroup = "resources";
        this.data = "health";
        this.damageType = "raw";
    }

    calculate(characterActor, targetActors) {
        return [];
    }

    apply(actors) {
        return undefined;
    }

}