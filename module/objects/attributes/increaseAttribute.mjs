/**
 * @typedef {Object} IncreaseAttribute
 */

import {DynamicAttribute} from "../dynamicAttribute.mjs";

/**
 * @type {IncreaseAttribute}
 */
export class IncreaseAttribute extends DynamicAttribute {

    constructor(item) {
        super(item);
        this.function = "increase";
        this.value = 0;
        this.dataGroup = "resources";
        this.data = "health";
    }

    /** @override */
    static apply(dynamicAttribute, characterData, targetsData) {
        const attributeModificationsData = [];
        for (const targetData of targetsData) {
            // Check target validation
            if (!this._isTargetValid(dynamicAttribute, characterData.token, targetData.token)) continue;

            /** @type {AttributeModificationData} */
            const attributeModificationData = {};
            attributeModificationData.token = targetData.token;

            // Calculate the attribute new values
            let calculatedAttribute = { ...dynamicAttribute };
            if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
                calculatedAttribute.value *= targetData.result > 0 ? targetData.result : 0;
            }
            if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
                calculatedAttribute.value = targetData.result > 0 ? calculatedAttribute.value : 0;
            }
            attributeModificationData.calculatedAttribute = calculatedAttribute;

            attributeModificationsData.push(attributeModificationData);
        }
        return attributeModificationsData;
    }

    /** @override */
    static merge(dynamicAttribute, previousDynamicAttribute) {
        previousDynamicAttribute.value += dynamicAttribute.value;
    }

}