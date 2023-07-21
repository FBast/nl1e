import {PL1E} from "../config/config.mjs";

export class Pl1eAspect {

    /**
     * Apply an active aspect
     * @param {Object} aspect
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     */
    static async applyActive(aspect, characterData, targetsData) {
        switch (aspect.name) {
            case "increase":
            case "decrease":
            case "set":
                return await this._numeric(aspect, characterData, targetsData);
            case "transfer":
                return this._transfer(aspect, characterData, targetsData);
            case "status":
                return this._status(aspect, characterData, targetsData);
            default:
                throw new Error("PL1E | unknown aspect : " + aspect.name);
        }
    }

    /**
     * Apply a passive value
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     */
    static applyPassiveValue(aspect, aspectId, actor) {
        const value = aspect.name === "decrease" ? -aspect.value : aspect.value;
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        let currentValue = getProperty(actor, dataConfig.path);
        switch (aspect.name) {
            case "increase":
            case "decrease":
                if (Array.isArray(currentValue)) currentValue.push(value);
                else currentValue += value;
                break;
            case "set":
                if (Array.isArray(currentValue)) currentValue = [value];
                else currentValue = value;
                break;
        }
        setProperty(actor, dataConfig.path, currentValue);
    }

    /**
     * Apply a passive effect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @param {Pl1eItem} item
     * @returns {Promise<void>}
     */
    static async applyPassiveEffect(aspect, aspectId, actor, item) {
        const value = aspect.name === "decrease" ? -aspect.value : aspect.value;
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
        await actor.createEmbeddedDocuments("ActiveEffect", [{
            name: name,
            icon: aspect.effectIcon,
            tint: aspect.effectIconTint,
            changes: [{
                key: dataConfig.path,
                mode: aspect.name === "set" ? 5 : 2,
                value: value
            }],
            flags: {
                pl1e: {
                    itemId: item._id,
                    aspectId: aspectId,
                    permanent: true
                }
            }
        }]);
    }

    /**
     * Remove a passive aspect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @returns {Promise<void>}
     */
    static async removePassiveEffect(aspect, aspectId, actor) {
        const effect = actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === aspectId);
        if (effect) await actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id])
    }

    /**
     * Get the default data (based on data group)
     * @param aspect
     */
    static getDefaultData(aspect) {
        return Object.keys(PL1E[aspect.dataGroup])[0];
    }

    /**
     * Get the default value (based in data group and data)
     * @param aspect
     * @returns {number|boolean|string}
     */
    static getDefaultValue(aspect) {
        const data = PL1E[aspect.dataGroup][aspect.data];
        switch (data.type) {
            case "number":
                return 0;
            case "select":
                return Object.keys(PL1E[data.select])[0];
            case "bool":
                return false;
        }
    }

    /**
     * Apply numeric aspect (such as increase, decrease or set)
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _numeric(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check targetGroup validation for aspect
            if (!this.isTargetValid(aspect.targetGroup, targetData.token, characterData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Modify aspect value by resolution type
            switch (aspect.resolutionType) {
                case "multiplyBySuccess":
                    aspectCopy.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "valueIfSuccess":
                    aspectCopy.value = targetData.result > 0 ? aspectCopy.value : 0;
                    break;
            }

            // Modify aspect value by damage type
            if (aspect.damageType && aspect.damageType !== "raw") {
                const damageTypeData = PL1E.reductions[aspect.damageType];
                aspectCopy.value -= getProperty(targetData.actor, damageTypeData.path);
                aspectCopy.value = Math.max(aspectCopy.value, 0);
            }

            // Negate the value
            aspectCopy.value = aspect.name === "decrease" ? -aspectCopy.value : aspectCopy.value

            if (aspectCopy.createEffect) {
                // Create the effect
                await this._createActiveEffect(aspectCopy, aspectCopy._id, targetData.actor, characterData.item, characterData.result);
            }
            else {
                // Apply the aspect
                const dataConfig = CONFIG.PL1E[aspectCopy.dataGroup][aspectCopy.data];
                let currentValue = getProperty(targetData.actor, dataConfig.path);

                CONFIG.PL1E.socket.executeAsGM('updateActor', {
                    actor: targetData.actor,
                    updateData: {
                        [dataConfig.path]: aspectCopy.name === "set" ? aspectCopy.value : currentValue += aspectCopy.value
                    }
                });
            }

            // Add label for Sequence
            let label = PL1E[aspectCopy.dataGroup][aspectCopy.data].label;
            aspectCopy.label = `${aspectCopy.value} ${game.i18n.localize(label)}`;

                // Check for existing aspect related to same function
            targetData.activeAspects ??= [];
            let existingAspect = targetData.activeAspects.find(aspect => aspect.name === aspectCopy.name);
            existingAspect === undefined ? targetData.activeAspects.push(aspectCopy) : existingAspect.value += aspectCopy.value;
        }
        return targetsData;
    }

    /**
     * Apply transfer aspect
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _transfer(aspect, characterData, targetsData) {
        // Source transfer sum
        let transferValue = 0;

        // First pass for source
        for (const targetData of targetsData) {
            // Check transferSource validation for aspect
            if (!this.isTargetValid(aspect.transferSource, targetData.token, characterData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Modify aspect value by resolution type
            switch (aspect.resolutionType) {
                case "multiplyBySuccess":
                    aspectCopy.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "valueIfSuccess":
                    aspectCopy.value = targetData.result > 0 ? aspectCopy.value : 0;
                    break;
            }

            // Modify aspect value by damage type
            if (aspect.damageType !== "raw") {
                const damageTypeData = PL1E.reductions[aspect.damageType];
                aspectCopy.value -= getProperty(targetData.actor, damageTypeData.path);
                aspectCopy.value = Math.max(aspectCopy.value, 0);
            }

            // Negate the value
            aspectCopy.value = -aspectCopy.value;

            // Add to the sum
            transferValue+= aspectCopy.value;

            // Check for existing aspect related to same function
            targetData.activeAspects ??= [];
            let existingAspect = targetData.activeAspects.find(aspect => aspect.name === aspectCopy.name);
            existingAspect === undefined ? targetData.activeAspects.push(aspectCopy) : existingAspect.value += aspectCopy.value;
        }

        // Count destination targets
        const destinationNumber = targetsData.filter(target => {
            return this.isTargetValid(aspect.transferDestination, target.token, characterData.token);
        }).length;

        // Split sum into destination number
        transferValue /= destinationNumber;
        transferValue = Math.floor(transferValue);

        // Second pass for destination
        for (const targetData of targetsData) {
            // Check transferSource validation for aspect
            if (!this.isTargetValid(aspect.transferDestination, targetData.token, characterData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Define aspect value based on transfer value
            aspectCopy.value = -transferValue;

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
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _status(aspect, characterData, targetsData) {

        throw new Error("Not implemented yet");
    }

    /**
     * Create an active effect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @param {Pl1eItem} item
     * @param {number} result
     * @returns {Promise<void>}
     * @private
     */
    static async _createActiveEffect(aspect, aspectId, actor, item, result) {
        // Calculate duration
        let effectDuration = aspect.effectDuration;
        if (aspect.effectDurationResolutionType === "valueIfSuccess" && result <= 0) effectDuration = 0;
        else if (aspect.effectDurationResolutionType === "multiplyBySuccess") effectDuration *= result;
        aspect.effectDuration = effectDuration;

        // Abort if the duration is null
        if (aspect.effectDuration <= 0) return;

        // Get configuration data
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`

        // Create effect
        await actor.createEmbeddedDocuments("ActiveEffect", [{
            name: name,
            icon: aspect.effectIcon,
            tint: aspect.effectIconTint,
            changes: [{
                key: dataConfig.path,
                mode: aspect.name === "set" ? 5 : 2,
                value: aspect.value
            }],
            duration: {
                rounds: effectDuration
            },
            flags: {
                pl1e: {
                    itemId: item._id,
                    aspectId: aspectId
                }
            }
        }]);
    }

    static isTargetValid(group, targetToken, characterToken) {
        if (group === "self" && targetToken !== characterToken) return false;
        if (group === "allies" && targetToken.document.disposition !== characterToken.document.disposition) return false;
        if (group === "opponents" && targetToken.document.disposition === characterToken.document.disposition) return false;
        return true;
    }

}