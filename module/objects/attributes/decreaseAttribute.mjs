/**
 * @typedef {Object} DecreaseAttribute
 * @property {string} damageType
 */

import {DynamicAttribute} from "../dynamicAttribute.mjs";

/**
 * @type {DecreaseAttribute}
 */
export class DecreaseAttribute extends DynamicAttribute {

    /** @override */
    constructor(item) {
        super(item);
        this.function = "decrease";
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