import {PL1E} from "../config/config.mjs";
import {Pl1eHelpers} from "./helpers.mjs";

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
                return await this._transfer(aspect, characterData, targetsData);
            case "status":
                return await this._status(aspect, characterData, targetsData);
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
            if (!this._isTargetValid(aspect.targetGroup, targetData.token, characterData.token)) continue;

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
                await this._createActiveEffect(aspectCopy, characterData, targetData);
            }
            else {
                // Apply the aspect
                await this._applyTargetAspect(aspectCopy, targetData);
            }

            // Add label for Sequence
            aspectCopy.label = game.i18n.localize(PL1E[aspectCopy.dataGroup][aspectCopy.data].label);

            // Push the aspect
            targetData.activeAspects ??= [];
            // let existingAspect = targetData.activeAspects.find(aspect => aspect.name === aspectCopy.name);
            // existingAspect === undefined ? targetData.activeAspects.push(aspectCopy) : existingAspect.value += aspectCopy.value;
            targetData.activeAspects.push(aspectCopy)
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
            if (!this._isTargetValid(aspect.transferSource, targetData.token, characterData.token)) continue;

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
            return this._isTargetValid(aspect.transferDestination, target.token, characterData.token);
        }).length;

        // Split sum into destination number
        transferValue /= destinationNumber;
        transferValue = Math.floor(transferValue);

        // Second pass for destination
        for (const targetData of targetsData) {
            // Check transferSource validation for aspect
            if (!this._isTargetValid(aspect.transferDestination, targetData.token, characterData.token)) continue;

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
        for (const targetData of targetsData) {
            // Check targetGroup validation for aspect
            if (!this._isTargetValid(aspect.targetGroup, targetData.token, characterData.token)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Modify duration or skip based on statusType
            switch (aspectCopy.statusType) {
                case "permanentIfSuccess":
                    if (targetData.result <= 0) continue;
                    break;
                case "durationFromSuccess":
                    if (targetData.result <= 0) continue;
                    aspectCopy.effectDuration = targetData.result;
                    break;
                case "durationIfSuccess":
                    if (targetData.result <= 0) continue;
                    break;
            }

            // Create the status
            const statusEffect = CONFIG.statusEffects.find(status => status.id === aspectCopy.data);
            if (!statusEffect) throw new Error("PL1E | no status corresponding to " + aspectCopy.data);
            const activeEffect = targetData.actor.effects.find(effect => effect.statuses.has(aspectCopy.data));
            if (!activeEffect) {
                const effectData = {
                    label: statusEffect.label,
                    icon: statusEffect.icon,
                    changes: [],
                    duration: {
                        rounds: aspectCopy.effectDuration,
                    },
                    flags: {
                        core: {
                            sourceId: characterData.actorId,
                            statusId: statusEffect.id
                        }
                    }
                };
                await targetData.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
            }

            // Add label for Sequence
            aspectCopy.label = game.i18n.localize(PL1E[aspectCopy.dataGroup][aspectCopy.data].label);

            // Push the aspect
            targetData.activeAspects ??= [];
            targetData.activeAspects.push(aspectCopy)
        }
        return targetsData;
    }

    /**
     * Create an active effect
     * @param {Object} aspect
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<void>}
     * @private
     */
    static async _createActiveEffect(aspect, characterData, targetData) {
        // Calculate duration
        let effectDuration = aspect.effectDuration;
        if (aspect.effectDurationResolutionType === "valueIfSuccess" && characterData.result <= 0) effectDuration = 0;
        else if (aspect.effectDurationResolutionType === "multiplyBySuccess") effectDuration *= characterData.result;
        aspect.effectDuration = effectDuration;

        // Abort if the duration is null
        if (aspect.effectDuration <= 0) return;

        // Get configuration data
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`

        // Create effect
        await targetData.actor.createEmbeddedDocuments("ActiveEffect", [{
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
                    sourceId: characterData.actorId,
                    itemId: characterData.item._id,
                    aspectId: aspect._id
                }
            }
        }]);
    }

    static async _applyTargetAspect(aspect, targetData) {
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        let currentValue = getProperty(targetData.actor, dataConfig.path);
        currentValue = aspect.name === "set" ? aspect.value : currentValue + aspect.value;
        console.log("Value on apply target aspect : " + currentValue);
        if (game.user.isGM) {
            await targetData.actor.update({
                [dataConfig.path]: currentValue
            });
        }
        else {
            if (Pl1eHelpers.isGMConnected()) {
                CONFIG.PL1E.socket.executeAsGM('tokenUpdate', {
                    tokenId: targetData.tokenId,
                    sceneId: targetData.sceneId,
                    updateData: {
                        [dataConfig.path]: currentValue
                    }
                });
            }
            else {
                ui.notifications.warn(game.i18n.localize("PL1E.NoGMConnected"));
            }
        }
    }

    static _isTargetValid(group, targetToken, characterToken) {
        if (group === "self" && targetToken !== characterToken) return false;
        if (group === "allies" && targetToken.document.disposition !== characterToken.document.disposition) return false;
        if (group === "opponents" && targetToken.document.disposition === characterToken.document.disposition) return false;
        return true;
    }

}