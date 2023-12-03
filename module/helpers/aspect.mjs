import {PL1E} from "../config/config.mjs";
import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eActiveEffect} from "../documents/effect.mjs";

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
            case "modify":
                return await this._modify(aspect, characterData, targetsData);
            case "transfer":
                return await this._transfer(aspect, characterData, targetsData);
            case "status":
                return await this._status(aspect, characterData, targetsData);
            case "movement":
                return await this._movement(aspect, characterData, targetsData);
            case "invocation":
                return await this._invocation(aspect, characterData, targetsData);
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
        const value = aspect.operator === "remove" ? -aspect.value : aspect.value;
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        let currentValue = getProperty(actor, dataConfig.path);
        switch (aspect.operator) {
            case "add":
            case "remove":
                if (Array.isArray(currentValue)) {
                    if (Array.isArray(value)) currentValue = currentValue.concat(value);
                    else currentValue.push(value);
                }
                else currentValue += value;
                break;
            case "set":
                if (Array.isArray(currentValue)) {
                    if (Array.isArray(value)) currentValue = value;
                    else currentValue = [value];
                }
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
        const value = aspect.operator === "remove" ? -aspect.value : aspect.value;
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
        await actor.createEmbeddedDocuments("ActiveEffect", [{
            name: name,
            icon: aspect.effectIcon,
            tint: aspect.effectIconTint,
            changes: [{
                key: dataConfig.path,
                mode: aspect.operator === "set" ? 5 : 2,
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
    static async getDefaultValue(aspect) {
        const data = PL1E[aspect.dataGroup][aspect.data];
        switch (data.type) {
            case "number":
                return 0;
            case "array":
                if (!data.select) throw new Error("PL1E | config array type should have a select value");
                return Object.keys(PL1E[data.select])[0];
            case "select":
                return Object.keys(PL1E[data.select])[0];
            case "bool":
                return true;
        }
    }

    static async getDescription(aspect) {
        let descriptionParts = [];
        if (aspect.operator) descriptionParts.push(game.i18n.localize(CONFIG.PL1E.numberOperators[aspect.operator]));
        if (aspect.value) {
            if (typeof aspect.value === "boolean") {
                descriptionParts.push(game.i18n.localize(aspect.value ? "PL1E.Yes" : "PL1E.No"));
            } else if (typeof aspect.value === "string") {
                descriptionParts.push(game.i18n.localize(aspect.value));
            } else if (Array.isArray(aspect.value)) {
                let values = aspect.value.map(value => {
                    const label = CONFIG.PL1E[aspect.data][value];
                    return game.i18n.localize(label);
                });
                descriptionParts.push(values.join(", "));
            } else {
                descriptionParts.push(aspect.value);
            }
        }
        if (aspect.damageType) descriptionParts.push(game.i18n.localize(CONFIG.PL1E.damageTypes[aspect.damageType]));
        if (aspect.resolutionType) descriptionParts.push(game.i18n.localize(CONFIG.PL1E.resolutionTypes[aspect.resolutionType]));
        if (aspect.data) {
            descriptionParts.push(game.i18n.localize("PL1E.On"));
            descriptionParts.push(game.i18n.localize(CONFIG.PL1E[aspect.dataGroup][aspect.data].label));
        }
        if (aspect.targetGroup) {
            descriptionParts.push(game.i18n.localize("PL1E.For"));
            descriptionParts.push(game.i18n.localize(CONFIG.PL1E.targetGroups[aspect.targetGroup]));
        }
        const description = descriptionParts.join(' ');
        return description.toLowerCase();
    }


    /**
     * Apply the modify aspect
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _modify(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check targetGroup validation for aspect
            if (!this._isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Modify aspect value by resolution type
            switch (aspect.resolutionType) {
                case "multipliedBySuccess":
                    aspectCopy.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "ifSuccess":
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
            aspectCopy.value = aspect.operator === "remove" ? -aspectCopy.value : aspectCopy.value

            if (aspectCopy.createEffect) {
                // Create the effect
                await Pl1eActiveEffect.createActiveEffect(aspectCopy, characterData, targetData);
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
     * Apply the transfer aspect
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
            if (!this._isTargetValid(aspect.transferSource, targetData, characterData)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Modify aspect value by resolution type
            switch (aspect.resolutionType) {
                case "multipliedBySuccess":
                    aspectCopy.value *= targetData.result > 0 ? targetData.result : 0;
                    break;
                case "ifSuccess":
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
            return this._isTargetValid(aspect.transferDestination, target, characterData);
        }).length;

        // Split sum into destination number
        transferValue /= destinationNumber;
        transferValue = Math.floor(transferValue);

        // Second pass for destination
        for (const targetData of targetsData) {
            // Check transferSource validation for aspect
            if (!this._isTargetValid(aspect.transferDestination, targetData, characterData)) continue;

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
     * Apply the status aspect
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _status(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check targetGroup validation for aspect
            if (!this._isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

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
            await Pl1eActiveEffect.createStatusEffect(targetData.actor, aspectCopy.data, {
                duration: {
                    rounds: aspectCopy.effectDuration
                },
                flags: {
                    core: {
                        sourceId: characterData.actorId
                    }
                }
            });

            // Add label for Sequence
            aspectCopy.label = game.i18n.localize(PL1E[aspectCopy.dataGroup][aspectCopy.data].label);

            // Push the aspect
            targetData.activeAspects ??= [];
            targetData.activeAspects.push(aspectCopy)
        }
        return targetsData;
    }

    /**
     * Apply the movement aspect
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _movement(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check targetGroup validation for aspect
            if (!this._isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Get all template except this target template or template if this target has no template
            const otherTemplates = targetData.template ? characterData.templates
                .filter(template => template._id !== targetData.template._id) : characterData.templates;

            // Fallback on this target template (could be undefined)
            let randomTemplate = targetData.template;

            // Take a template at random
            if (otherTemplates.length > 0)
                randomTemplate = otherTemplates[Math.floor(Math.random() * otherTemplates.length)];

            // If no random template then skip
            if (!randomTemplate) continue;

            // Move the target on this template
            const offset = canvas.dimensions.size / 2;
            if (aspect.data === "walk") {
                await targetData.token.document.update({
                    x: randomTemplate.x - offset,
                    y: randomTemplate.y - offset,
                }, {animate: true, noRestriction: false});
            }
            if (aspect.data === "push") {
                await targetData.token.document.update({
                    x: randomTemplate.x - offset,
                    y: randomTemplate.y - offset,
                }, {animate: true, noRestriction: true});
            }
            if (aspect.data === "teleport") {
                await targetData.token.document.update({
                    x: randomTemplate.x - offset,
                    y: randomTemplate.y - offset,
                }, {animate: false, noRestriction: true});
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
     * Apply the invocation aspect
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _invocation(aspect, characterData, targetsData) {
        const offset = canvas.dimensions.size / 2;

        for (const template of characterData.templates) {
            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Retrieve the actor
            let actor = game.actors.get(aspectCopy.invocation);

            // If the actor is not found, import it from the compendium
            if (!actor) {
                actor = await Pl1eHelpers.getDocument("Actor", aspectCopy.invocation);
                if (actor) actor = await Actor.create(actor, {keepId: true});
            }

            const tokenData = await actor.getTokenData({
                x: template.x - offset,
                y: template.y - offset,
                width: 1,
                height: 1,
                disposition: characterData.actor.disposition
            });

            // Create the token
            const token = await characterData.scene.createEmbeddedDocuments("Token", [tokenData]);

            // Add the combatant if in combat
            if (game.combat) {
                await game.combat.createEmbeddedDocuments('Combatant', [{
                    tokenId: token.id,
                    sceneId: characterData.scene.id,
                    actorId: actor.id
                }]);
            }
        }

        return targetsData;
    }

    /**
     *
     * @param aspect
     * @param targetData
     * @return {Promise<void>}
     * @private
     */
    static async _applyTargetAspect(aspect, targetData) {
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        let currentValue = getProperty(targetData.actor, dataConfig.path);
        currentValue = aspect.operator === "set" ? aspect.value : currentValue + aspect.value;
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

    /**
     *
     * @param {string} group
     * @param {TargetData} targetData
     * @param {CharacterData} characterData
     * @return {boolean}
     * @private
     */
    static _isTargetValid(group, targetData, characterData) {
        const targetToken = targetData.token;
        const characterToken = characterData.token;
        if ("targets" === group && targetData.actor === characterData.actor && !targetData.template) return false;
        if (["targets", "self", "alliesAndSelf", "opponentsAndSelf"].includes(group) && targetToken !== characterToken) return false;
        if (["targets", "allies", "alliesAndSelf"].includes(group) && targetToken.document.disposition !== characterToken.document.disposition) return false;
        if (["targets", "opponents","opponentsAndSelf"].includes(group) && targetToken.document.disposition === characterToken.document.disposition) return false;
        return true;
    }

    /**
     * TODO should be refactored to properly merge the new aspects
     * Merge aspects with the same properties except for the value.
     * @param {Object} aspectsArray
     * @return {Object}
     */
    static mergeAspectsObjects(aspectsArray) {
        const mergedAspects = {};

        for (const aspect of aspectsArray) {
            const key = this._generateAspectKey(aspect);
            const aspectConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
            if (!mergedAspects[key]) {
                mergedAspects[key] = { ...aspect };
                mergedAspects[key].value = aspectConfig.type === "array" ? [aspect.value] : aspect.value;
            } else {
                if (aspectConfig.type === "number") {
                    mergedAspects[key].value += aspect.value;
                } else if (aspectConfig.type === "array") {
                    mergedAspects[key].value.push(aspect.value);
                }
            }
        }

        return mergedAspects;
    }

    /**
     * Generate a unique key for an aspect based on its properties except for the value.
     * @param {Object} aspect
     * @return {string}
     * @private
     */
    static _generateAspectKey(aspect) {
        const { value, ...restOfAspect } = aspect;
        return JSON.stringify(restOfAspect);
    }

}