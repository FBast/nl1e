import {Pl1eItem} from "../documents/item.mjs";

/** @type {DynamicAttribute} */
export class DynamicAttribute {

    constructor(param) {
        if (param instanceof Pl1eItem) {
            if (["feature"].includes(param.type)) {
                this.activation = "passive";
                this.showActivationToggle = false;
            } else if (["consumable"].includes(item.type)) {
                this.activation = "action";
                this.showActivationToggle = false;
            } else {
                this.activation = "passive";
                this.showActivationToggle = true;
            }
        }
        else if (param instanceof Object) {
            this.activation = param.activation;
            this.showActivationToggle = param.showActivationToggle;
        }
    }

    /**
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     * @returns {AttributeModificationsData} attributeModificationsData
     */
    apply(characterData, targetsData) {
        throw new Error("apply method is not implemented")
    }

    /**
     * @param {DynamicAttribute} previousDynamicAttribute
     */
    merge(previousDynamicAttribute) {
        throw new Error("merge method is not implemented")
    }

    /**
     * @param {Token} characterToken
     * @param {Token} targetToken
     * @returns {boolean}
     * @protected
     */
    _isTargetValid(characterToken, targetToken) {
        if (this.targetGroup !== undefined) {
            if (this.targetGroup === "self" && targetToken !== characterToken) return false;
            if (this.targetGroup === "allies" && targetToken.document.disposition !== characterToken.document.disposition) return false;
            if (this.targetGroup === "opponents" && targetToken.document.disposition === characterToken.document.disposition) return false;
        }
        return true;
    }

}