import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eActiveEffect} from "../documents/effect.mjs";
import {PL1E} from "../pl1e.mjs";

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
            case "activeMacro":
                return await this._macro(aspect, characterData, targetsData);
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
        if (aspect.value === undefined) return;
        const value = aspect.operator === "remove" ? -aspect.value : aspect.value;
        const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
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

    static async applyPassiveMacro(aspect, aspectId, scope) {
        const macroId = aspect.value;
        const macro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute actor update macro
        if (macro) macro.execute(scope);
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
        // Skip if the effect already exist
        const effect = actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === aspectId);
        if (effect) return;

        if (aspect.name === "status") {
            await Pl1eActiveEffect.createStatusEffect(actor, aspect.data, {
                origin: item.id,
                flags: {
                    pl1e: {
                        originActor: actor.id,
                        aspectId: aspectId,
                        permanent: true
                    }
                }
            });
        }
        else {
            const value = aspect.operator === "remove" ? -aspect.value : aspect.value;
            const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
            const aspectConfig = Pl1eHelpers.getConfig("aspects", aspect.name);
            const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
            await actor.createEmbeddedDocuments("ActiveEffect", [{
                name: name,
                icon: item.img,
                origin: item.id,
                changes: [{
                    key: dataConfig.path,
                    mode: aspect.operator === "set" ? 5 : 2,
                    value: value
                }],
                flags: {
                    pl1e: {
                        originActor: actor.id,
                        aspectId: aspectId,
                        permanent: true
                    }
                }
            }]);
        }
    }

    /**
     * Remove a passive aspect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @returns {Promise<void>}
     */
    static async removePassiveEffect(aspect, aspectId, actor) {
        // Done if the effect exist
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
            case "array":
                if (!data.select) throw new Error("PL1E | config array type should have a select value");
                return Object.keys(PL1E[data.select])[0];
            case "select":
                return Object.keys(PL1E[data.select])[0];
            case "bool":
                return false;
        }
    }

    static async getDescription(aspect) {
        let descriptionParts = [];
        // if (aspect.macroId !== undefined) {
        //     const macro = await Pl1eHelpers.getDocument("Macro", aspect.macroId);
        //     descriptionParts.push(macro ? macro.name : game.i18n.localize("PL1E.None"));
        //     descriptionParts.push(game.i18n.localize("PL1E.On"));
        //     descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("aspects", aspect.name, "contexts", aspect.context)));
        // }
        // if (aspect.invocation !== undefined) {
        //     descriptionParts.push(game.i18n.localize("PL1E.Invocation"));
        //     descriptionParts.push(game.i18n.localize("PL1E.Of"));
        //     const actorInvocation = await Pl1eHelpers.getDocument("Actor", aspect.invocation);
        //     descriptionParts.push(actorInvocation ? actorInvocation.name : game.i18n.localize("PL1E.Unknown"));
        // }
        if (aspect.operator !== undefined) descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("numberOperators", aspect.operator)));
        if (aspect.value !== undefined) {
            if (typeof aspect.value === "boolean") {
                descriptionParts.push(game.i18n.localize(aspect.value ? "PL1E.Yes" : "PL1E.No"));
            } else if (typeof aspect.value === "string") {
                descriptionParts.push(game.i18n.localize(aspect.value));
            } else if (Array.isArray(aspect.value)) {
                let values = aspect.value.map(value => {
                    const label = Pl1eHelpers.getConfig(aspect.data, value);
                    return game.i18n.localize(label);
                });
                descriptionParts.push(values.join(", "));
            } else {
                descriptionParts.push(aspect.value);
            }
            if (aspect.damageType !== undefined && aspect.damageType !== "raw")
                descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("damageTypes", aspect.damageType)));
            if (aspect.resolutionType !== undefined && aspect.resolutionType !== "fixed")
                descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("resolutionTypes", aspect.resolutionType)));
            descriptionParts.push(game.i18n.localize("PL1E.On"));
        }
        if (aspect.data !== undefined) {
            descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data, "label")));
        }
        if (aspect.targetGroup !== undefined) {
            descriptionParts.push(game.i18n.localize("PL1E.For"));
            descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("targetGroups", aspect.targetGroup)));
        }
        if (aspect.transferSource !== undefined) {
            descriptionParts.push(game.i18n.localize("PL1E.From"));
            descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("targetGroups", aspect.transferSource)));
        }
        if (aspect.transferDestination !== undefined) {
            descriptionParts.push(game.i18n.localize("PL1E.To"));
            descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("targetGroups", aspect.transferDestination)));
        }
        if (aspect.movementDestination !== undefined) {
            descriptionParts.push(game.i18n.localize("PL1E.To"));
            descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("targetGroupWithTemplate", aspect.movementDestination)));
        }
        if (aspect.createEffect && aspect.effectDuration !== undefined) {
            descriptionParts.push(game.i18n.localize("PL1E.During"));
            descriptionParts.push(aspect.effectDuration);
            descriptionParts.push(game.i18n.localize("PL1E.Turn"));
            if (aspect.effectDurationResolutionType && aspect.effectDurationResolutionType !== "fixed")
                descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("resolutionTypes", aspect.effectDurationResolutionType)));
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
            aspectCopy.value = Pl1eHelpers.applyResolution(aspectCopy.value, targetData.result, aspect.resolutionType);

            // Modify aspect value by damage type
            if (aspect.damageType && aspect.damageType !== "raw") {
                const damageTypeData = PL1E.reductions[aspect.damageType];
                aspectCopy.value -= getProperty(targetData.actor, damageTypeData.path);
                aspectCopy.value = Math.max(aspectCopy.value, 0);
            }

            // Ignore the aspect if value equal to zero
            if (aspectCopy.value === 0) continue;

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
            aspectCopy.label = game.i18n.localize(Pl1eHelpers.getConfig(aspect.dataGroup, aspectCopy.data, "label"));

            // Push the aspect
            targetData.activeAspects ??= [];
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
            aspectCopy.value = Pl1eHelpers.applyResolution(aspectCopy.value, targetData.result, aspect.resolutionType);

            // Modify aspect value by damage type
            if (aspect.damageType !== "raw") {
                const damageTypeData = PL1E.reductions[aspect.damageType];
                aspectCopy.value -= getProperty(targetData.actor, damageTypeData.path);
                aspectCopy.value = Math.max(aspectCopy.value, 0);
            }

            // Ignore the aspect if value equal to zero
            if (aspectCopy.value === 0) continue;

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

            // Modify aspect value by resolution type
            aspectCopy.value = Pl1eHelpers.applyResolution(aspectCopy.value, targetData.result, aspect.resolutionType);

            // Modify aspect value by resolution type
            aspectCopy.effectDuration = Pl1eHelpers.applyResolution(aspectCopy.effectDuration, targetData.result, aspectCopy.effectDurationResolutionType);

            // Ignore the aspect if effect duration equal to zero
            if (aspectCopy.effectDuration === 0) continue;

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
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _movement(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Check targetGroup validation for aspect
            if (!this._isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Filter base on movement destination
            const possibleDestination = [];
            if (aspect.movementDestination === "template") {
                for (const template of characterData.templates) {
                    if (targetData.template && template._id === targetData.template._id) continue;
                    possibleDestination.push({
                        x: template.specialPosition.x,
                        y: template.specialPosition.y
                    });
                }
            }
            else {
                for (const otherTargetData of targetsData) {
                    if (otherTargetData.token === targetData.token) continue;
                    if (!this._isTargetValid(aspect.movementDestination, otherTargetData, characterData)) continue;
                    possibleDestination.push({
                        x: otherTargetData.tokenX,
                        y: otherTargetData.tokenY
                    });
                }
            }

            // Skip if no destination found
            if (possibleDestination.length === 0) continue;

            // Take a possible destination at random
            const destination = possibleDestination[Math.floor(Math.random() * possibleDestination.length)];
            console.log(`${targetData.token.name} at ${targetData.tokenX}(X) and ${targetData.tokenY}(Y) moves to ${destination.x}(X) and ${destination.y}(Y)`);

            // Move the target on this destination
            if (aspect.data === "walk") {
                await targetData.token.update(destination, {animate: true, noRestriction: false});
            }
            if (aspect.data === "push") {
                await targetData.token.update(destination, {animate: true, noRestriction: true});
            }
            if (aspect.data === "teleport") {
                await targetData.token.update(destination, {animate: false, noRestriction: true});
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
        for (const template of characterData.templates) {
            // Copy the aspect to calculate the new values
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Retrieve the invocation actor
            let invocationActor = game.actors.get(aspectCopy.data);

            // If the invocation actor is not found, import it from the compendium
            if (!invocationActor) {
                invocationActor = await Pl1eHelpers.getDocument("Actor", aspectCopy.data);
                if (invocationActor) invocationActor = await Actor.create(invocationActor, {keepId: true});
            }

            const tokenData = await invocationActor.getTokenData({
                x: template.specialPosition.x,
                y: template.specialPosition.y,
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
                    actorId: invocationActor.id
                }]);
            }
        }

        return targetsData;
    }

    /**
     * Apply the macro aspect
     * @param aspect
     * @param characterData
     * @param targetsData
     * @returns {Promise<TargetData[]>}
     * @private
     */
    static async _macro(aspect, characterData, targetsData) {
        if (aspect.dataGroup === "targetsResolution") {
            // Find macro
            const macro = await Pl1eHelpers.getDocument("Macro", aspect.data);

            // Execute macro
            if (macro !== undefined) macro.execute({
                characterData: characterData,
                targetsData: targetsData
            });
        }
        else {
            for (const targetData of targetsData) {
                // Check targetGroup validation for the aspect
                if (!this._isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

                // Copy the aspect to calculate the new values
                let aspectCopy = JSON.parse(JSON.stringify(aspect));

                // Modify aspect value by resolution type
                aspectCopy.effectDuration = Pl1eHelpers.applyResolution(aspectCopy.effectDuration, targetData.result, aspectCopy.effectDurationResolutionType);

                // Ignore the aspect if effect duration equal to zero
                if (aspectCopy.effectDuration === 0) continue;

                // Create the active effect
                await Pl1eActiveEffect.createActiveEffect(aspectCopy, characterData, targetData);

                // Push the aspect
                targetData.activeAspects ??= [];
                targetData.activeAspects.push(aspectCopy)
            }
        }
    }

    /**
     *
     * @param aspect
     * @param {TargetData} targetData
     * @return {Promise<void>}
     * @private
     */
    static async _applyTargetAspect(aspect, targetData) {
        const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
        let currentValue = getProperty(targetData.actor, dataConfig.path);
        currentValue = aspect.operator === "set" ? aspect.value : currentValue + aspect.value;
        if (game.user.isGM) {
            await targetData.actor.update({
                [dataConfig.path]: currentValue
            });
        }
        else {
            if (Pl1eHelpers.isGMConnected()) {
                PL1E.socket.executeAsGM('tokenUpdate', {
                    tokenId: targetData.tokenId,
                    sceneId: targetData.sceneId,
                    updateData: {
                        [dataConfig.path]: currentValue
                    }
                });
            }
            else {
                ui.notifications.info(game.i18n.localize("PL1E.NoGMConnected"));
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
        switch (group) {
            case "targetsExceptSelf":
                return targetData.actor !== characterData.actor;
            case "self":
                return targetData.actor === characterData.actor;
            case "allies":
                return targetToken.disposition === characterToken.disposition;
            case "alliesAndSelf":
                return targetToken.disposition === characterToken.disposition || targetData.actor === characterData.actor;
            case "opponents":
                return targetToken.disposition !== characterToken.disposition;
            case "opponentsAndSelf":
                return targetToken.disposition !== characterToken.disposition || targetData.actor === characterData.actor;
        }
        return true;
    }

    /**
     * Merge aspects with the same properties except for the value.
     * @param {Object} aspects
     * @return {Object}
     */
    static mergeAspectsObjects(aspects) {
        const mergeKeys = {};
        const mergedAspects = {};
        for (const [aspectId, aspect] of Object.entries(aspects)) {
            const mergeKey = this._generateMergeKey(aspect);
            const aspectConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
            if (aspectConfig && mergeKeys[mergeKey]) {
                const aspectId = mergeKeys[mergeKey];
                if (aspectConfig.type === "number") {
                    mergedAspects[aspectId].value += aspect.value;
                }
                else if (aspectConfig.type === "array") {
                    mergedAspects[aspectId].value.push(aspect.value);
                }
            }
            else {
                mergeKeys[mergeKey] = aspectId;
                mergedAspects[aspectId] = aspect;
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
    static _generateMergeKey(aspect) {
        const { value, ...restOfAspect } = aspect;
        return JSON.stringify(restOfAspect);
    }

}