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
     *
     * @param actor
     * @param aspect
     * @returns {Promise<any>}
     */
    static getAspectValue(actor, aspect) {
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        let value = getProperty(actor, dataConfig.path);

        const isArray = Array.isArray(value);
        if (isArray) {
            switch (aspect.name) {
                case "increase":
                    value.push(aspect.value);
                    break;
                case "decrease":
                    value.push(-aspect.value);
                    break;
                case "set":
                    value = [aspect.value];
                    break;
            }
        }
        else {
            switch (aspect.name) {
                case "increase":
                    value += aspect.value;
                    break;
                case "decrease":
                    value -= aspect.value;
                    break;
                case "set":
                    value = aspect.value;
                    break;
            }
        }
        return value;
    }

    /**
     * Create a passive effect
     * @param actor
     * @param item
     * @param aspectId
     * @param aspect
     * @returns {Promise<void>}
     */
    static async createPassiveEffect(actor, item, aspectId, aspect) {
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const label = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
        const value = await Pl1eAspect.getAspectValue(actor, aspect);
        await actor.createEmbeddedDocuments("ActiveEffect", [{
            label: label,
            icon: aspectConfig.img,
            duration: { // How long the effect should last (in seconds)
                seconds: 10
            },
            changes: [{
                key: dataConfig.path,
                mode: 2,
                value: value
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
     * Remove a passive aspect
     * @param actor
     * @param item
     * @param effect
     * @returns {Promise<void>}
     */
    static async removePassiveEffect(actor, item, effect) {
        await actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id])
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

            // Apply the aspect
            const dataConfig = CONFIG.PL1E[aspectCopy.dataGroup][aspectCopy.data];
            await targetData.actor.update({
                [dataConfig.path]: this.getAspectValue(targetData.actor, aspectCopy)
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