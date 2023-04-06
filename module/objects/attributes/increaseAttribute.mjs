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
        this.name = "increase";
        this.value = 0;
        this.dataGroup = "resources";
        this.data = "health";
    }

    calculate(characterActor, targetActors) {
        return [];
    }

    apply(actors) {
        return undefined;
    }

}