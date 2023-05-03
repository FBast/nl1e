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
                return this._increase(characterData, targetsData);
            case "decrease":
                return this._decrease(characterData, targetsData);
            case "override":
                return this._override(characterData, targetsData);
            case "transfer":
                return this._transfer(characterData, targetsData);
            case "effect":
                return this._effect(characterData, targetsData);
            default:
                throw new Error("PL1E | unknown aspect : " + aspect.name);
        }
    }

    /**
     *
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _increase(characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check target validation
            if (!this._isTargetValid(characterData.token, targetData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspect = JSON.parse(JSON.stringify(this));
            switch (aspect.system.resolutionType) {
                case "multiplyBySuccess":
                    aspect.system.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "valueIfSuccess":
                    aspect.system.value = targetData.result > 0 ? aspect.system.value : 0;
                    break;
            }

            // Apply the aspect
            const aspectDataConfig = CONFIG.PL1E[aspect.system.dataGroup][aspect.system.data];
            let actorValue = foundry.utils.getProperty(targetData.token.actor, aspectDataConfig.path);
            actorValue += aspect.system.value;
            await targetData.token.actor.update({
                [aspectDataConfig.path]: actorValue
            });

            // Check for existing aspect related to same function
            targetData.aspects ??= [];
            let existingAspect = targetData.aspects.find(aspect => aspect.system.function === this.system.function);
            existingAspect === undefined ? targetData.aspects.push(aspect) : existingAspect.value += aspect.value;
        }
        return targetsData;
    }

    /**
     *
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _decrease(characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     *
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _override(characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     *
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _transfer(characterData, targetsData) {
        throw new Error("Not implemented yet");
    }

    /**
     *
     * @param characterData
     * @param targetsData
     * @returns {Promise<*>}
     * @private
     */
    static async _effect(characterData, targetsData) {
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