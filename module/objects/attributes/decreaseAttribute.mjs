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
        this.type = "decrease";
        this.value = 0;
        this.dataGroup = "resources";
        this.data = "health";
        this.damageType = "raw";
    }

    /** @override */
    static apply(characterData, targetsData) {
        return undefined;
    }

}