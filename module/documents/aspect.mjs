import {Pl1eItem} from "./item.mjs";

export class Pl1eAspect extends Pl1eItem {

    /**
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     * @returns {AttributeModificationsData} attributeModificationsData
     */
    apply(characterData, targetsData) {
        throw new Error("PL1E | apply method is not implemented")
    }

    /**
     * @param {Attribute} previousDynamicAttribute
     */
    merge(previousDynamicAttribute) {
        throw new Error("PL1E | merge method is not implemented")
    }

    /**
     * @param {Token} characterToken
     * @param {Token} targetToken
     * @returns {boolean}
     * @private
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