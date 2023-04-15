import {Pl1eItem} from "../documents/item.mjs";

/** @type {DynamicAttribute} */
export class DynamicAttribute {

    constructor(param) {
        if (param instanceof Pl1eItem) {
            if (["weapon", "wearable"].includes(param.type)) {
                this.activationLink = "passive";
                this.showActivationLinkToggle = true;
            }
        }
        else if (param instanceof Object) {
            this.activationLink = param.activationLink;
            this.showActivationLinkToggle = param.showActivationLinkToggle;
        }
    }

    /**
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     * @returns {AttributeModificationsData} attributeModificationsData
     */
    apply(characterData, targetsData) {
        throw new Error("PL1E | apply method is not implemented")
    }

    /**
     * @param {DynamicAttribute} previousDynamicAttribute
     */
    merge(previousDynamicAttribute) {
        throw new Error("PL1E | merge method is not implemented")
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