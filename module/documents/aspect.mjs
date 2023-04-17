import {Pl1eItem} from "./item.mjs";

export class Pl1eAspect extends Pl1eItem {

    /**
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     */
    apply(characterData, targetsData) {
        // Calculate the aspect
        switch (this.function) {
            case "increase":
                return this._increase(characterData, targetsData);
            case "decrease":
                return this._increase(characterData, targetsData);
            case "override":
                return this._increase(characterData, targetsData);
            case "transfer":
                return this._increase(characterData, targetsData);
            case "effect":
                return this._increase(characterData, targetsData);
            default:
                throw new Error("PL1E | unknown aspect function : " + this.function);
        }
    }

    /**
     * @param {Attribute} previousDynamicAttribute
     */
    merge(previousDynamicAttribute) {
        throw new Error("PL1E | merge method is not implemented")
    }

    async _increase(characterData, targetsData) {
        const attributeModificationsData = [];
        for (const targetData of targetsData) {
            // Check target validation
            if (!this._isTargetValid(characterData.token, targetData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspect = this.toObject(false);
            switch (this.system.resolutionType) {
                case "multiplyBySuccess":
                    aspect.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "valueIfSuccess":
                    aspect.value = targetData.result > 0 ? aspect.value : 0;
                    break;
            }

            // Apply the aspect
            const data = CONFIG.PL1E[aspect.data];
            let actorValue = targetData.token.actor[data.path];
            actorValue += aspect.value;
            await targetData.token.actor.update({
                [data.path]: actorValue
            });

            // Check for existing aspect related to same function
            let existingAspect = targetData.calculatedAspects.find(aspect => aspect.function === this.function);
            if (existingAspect === undefined) {
                // Add this aspect
                targetData.calculatedAspects.push(aspect);
            } else {
                // Merge with existing aspect
                existingAspect.value += aspect.value;
            }
        }
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