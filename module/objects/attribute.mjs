/** @type {DynamicAttribute} */
export class DynamicAttribute {

    constructor(item) {
        if (["feature"].includes(item.type)) {
            this.activation = "passive";
            this.showActivationToggle = false;
        }
        else if (["consumable"].includes(item.type)) {
            this.activation = "action";
            this.showActivationToggle = false;
        }
        else {
            this.activation = "passive";
            this.showActivationToggle = true;
        }
    }

    /**
     * @param {DynamicAttribute} dynamicAttribute
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     * @returns {AttributeModificationsData} attributeModificationsData
     */
    static apply(dynamicAttribute, characterData, targetsData) {
        throw new Error("apply method is not implemented")
    }

    /**
     * @param {DynamicAttribute} dynamicAttribute
     * @param {DynamicAttribute} previousDynamicAttribute
     */
    static merge(dynamicAttribute, previousDynamicAttribute) {
        throw new Error("merge method is not implemented")
    }

    /**
     * @param {DynamicAttribute} dynamicAttribute
     * @param {Token} characterToken
     * @param {Token} targetToken
     * @returns {boolean}
     * @protected
     */
    static _isTargetValid(dynamicAttribute, characterToken, targetToken) {
        if (dynamicAttribute.targetGroup !== undefined) {
            if (dynamicAttribute.targetGroup === "self" && targetToken !== characterToken) return false;
            if (dynamicAttribute.targetGroup === "allies" && targetToken.document.disposition !== characterToken.document.disposition) return false;
            if (dynamicAttribute.targetGroup === "opponents" && targetToken.document.disposition === characterToken.document.disposition) return false;
        }
        return true;
    }

}