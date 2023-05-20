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
            case "effect":
                return this._effect(aspect, characterData, targetsData);
            default:
                throw new Error("PL1E | unknown aspect : " + aspect.name);
        }
    }

    /**
     * Apply a passive aspect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @param {Pl1eItem} item
     */
    static async applyPassive(aspect, aspectId, actor, item) {
        const value = aspect.name === "decrease" ? -aspect.value : aspect.value;
        if (aspect.createEffect) {
            const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
            const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
            const label = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
            await actor.createEmbeddedDocuments("ActiveEffect", [{
                label: label,
                icon: aspectConfig.img,
                changes: [{
                    key: dataConfig.path,
                    mode: aspect.name === "set" ? 5 : 2,
                    value: value
                }],
                flags: {
                    pl1e: {
                        itemId: item._id,
                        aspectId: aspectId
                    }
                }
            }]);
        } else {
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
    }

    /**
     * Remove a passive aspect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @returns {Promise<void>}
     */
    static async removePassive(aspect, aspectId, actor) {
        // We don't remove aspect which does not create effect because they are not saved
        if (aspect.createEffect) {
            const effect = actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === aspectId);
            if (effect) await actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id])
        }
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
     * @returns {Promise<*>}
     * @private
     */
    static async _numeric(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check target validation
            if (!this._isTargetValid(characterData.token, targetData.token)) continue;

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
            aspectCopy.value = aspect.name === "decrease" ? -aspectCopy.value : aspectCopy.value

            if (aspectCopy.createEffect) {
                // Create the effect
                await this._createActiveEffect(targetData.actor, characterData.item, aspectCopy._id, aspectCopy);
            }
            else {
                // Apply the aspect
                const dataConfig = CONFIG.PL1E[aspectCopy.dataGroup][aspectCopy.data];
                let currentValue = getProperty(targetData.actor, dataConfig.path);
                await targetData.actor.update({
                    [dataConfig.path]: aspectCopy.name === "set" ? aspectCopy.value : currentValue += aspectCopy.value
                });
            }

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
     * Create an active effect
     * @param actor
     * @param item
     * @param aspectId
     * @param aspect
     * @returns {Promise<void>}
     * @private
     */
    static async _createActiveEffect(actor, item, aspectId, aspect) {
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const label = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
        await actor.createEmbeddedDocuments("ActiveEffect", [{
            label: label,
            icon: aspectConfig.img,
            changes: [{
                key: dataConfig.path,
                mode: aspect.name === "set" ? 5 : 2,
                value: aspect.value
            }],
            flags: {
                pl1e: {
                    itemId: item._id,
                    aspectId: aspectId
                }
            }
        }]);
    }

    /**
     *
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