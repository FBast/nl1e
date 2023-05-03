export class Pl1eAspect {

    /**
     * @param {Object} aspect
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     */
    static async apply(aspect, characterData, targetsData) {
        // Calculate the aspect
        switch (aspect.name) {
            case "increase":
                return this._increase(aspect, characterData, targetsData);
            case "decrease":
                return this._decrease(aspect, characterData, targetsData);
            case "override":
                return this._override(aspect, characterData, targetsData);
            case "transfer":
                return this._transfer(aspect, characterData, targetsData);
            case "effect":
                return this._effect(aspect, characterData, targetsData);
            default:
                throw new Error("PL1E | unknown aspect : " + aspect.name);
        }
    }

    /**
     *
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _increase(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check target validation
            if (!this._isTargetValid(characterData.token, targetData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));
            switch (aspect.resolutionType) {
                case "multiplyBySuccess":
                    aspectCopy.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "valueIfSuccess":
                    aspectCopy.value = targetData.result > 0 ? aspectCopy.value : 0;
                    break;
            }

            // Apply the aspect
            const aspectDataConfig = CONFIG.PL1E[aspectCopy.dataGroup][aspectCopy.data];
            let actorValue = foundry.utils.getProperty(targetData.token.actor, aspectDataConfig.path);
            actorValue += aspectCopy.value;
            await targetData.token.actor.update({
                [aspectDataConfig.path]: actorValue
            });

            // Check for existing aspect related to same function
            targetData.activeAspects ??= [];
            let existingAspect = targetData.activeAspects.find(aspect => aspect.name === aspectCopy.name);
            existingAspect === undefined ? targetData.activeAspects.push(aspectCopy) : existingAspect.value += aspectCopy.value;
        }
        return targetsData;
    }

    /**
     *
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _decrease(aspect, characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     *
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _override(aspect, characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     *
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _transfer(aspect, characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     *
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _effect(aspect, characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     * @param {Token} characterToken
     * @param {Token} targetToken
     * @returns {boolean}
     * @private
     */
    static _isTargetValid(characterToken, targetToken) {
        if (this.targetGroup !== undefined) {
            if (this.targetGroup === "self" && targetToken !== characterToken) return false;
            if (this.targetGroup === "allies" && targetToken.document.disposition !== characterToken.document.disposition) return false;
            if (this.targetGroup === "opponents" && targetToken.document.disposition === characterToken.document.disposition) return false;
        }
        return true;
    }

}