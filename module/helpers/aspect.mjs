import {Pl1eHelpers} from "./helpers.mjs";
import {PL1E} from "../pl1e.mjs";
import {ModifyAspectHandler} from "./aspects/modify-aspect-handler.mjs";
import {TransferAspectHandler} from "./aspects/transfer-aspect-handler.mjs";
import {StatusAspectHandler} from "./aspects/status-aspect-handler.mjs";
import {MovementAspectHandler} from "./aspects/movement-aspect-handler.mjs";
import {InvocationAspectHandler} from "./aspects/invocation-aspect-handler.mjs";
import {MacroAspectHandler} from "./aspects/macro-aspect-handler.mjs";

export class Pl1eAspect {
    /**
     * Apply a single aspect
     * @param {Object} aspect
     * @param {CharacterData} characterData
     * @param {TargetData[]} targetsData
     * @returns {Promise<TargetData[]>}
     */
    static async applyActiveAspect(aspect, characterData, targetsData) {
        const handlers = {
            modify: new ModifyAspectHandler(),
            transfer: new TransferAspectHandler(),
            status: new StatusAspectHandler(),
            movement: new MovementAspectHandler(),
            invocation: new InvocationAspectHandler(),
            activeMacro: new MacroAspectHandler()
        };

        const handler = handlers[aspect.name];
        if (!handler) {
            throw new Error(`PL1E | unknown aspect: ${aspect.name}`);
        }

        return await handler.apply(aspect, characterData, targetsData);
    }

    /**
     * Apply a passive aspect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     */
    static applyPassiveAspect(aspect, aspectId, actor) {
        if (aspect.value === undefined) return;
        const value = aspect.operator === "remove" ? -aspect.value : aspect.value;
        const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
        let currentValue = foundry.utils.getProperty(actor, dataConfig.path);
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
        foundry.utils.setProperty(actor, dataConfig.path, currentValue);
    }

    static async applyPassiveMacro(aspect, aspectId, scope) {
        const macroId = aspect.data;
        const macro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute actor update macro
        if (macro) await macro.execute(scope);
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
                descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("damageTypes", aspect.damageType, "label")));
            if (aspect.resolutionType !== undefined && aspect.resolutionType !== "fixed")
                descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("resolutionTypesKeys", aspect.resolutionType)));
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
                descriptionParts.push(game.i18n.localize(Pl1eHelpers.getConfig("resolutionTypesKeys", aspect.effectDurationResolutionType)));
        }
        const description = descriptionParts.join(' ');
        return description.toLowerCase();
    }

    /**
     *
     * @param {string} group
     * @param {TargetData} targetData
     * @param {CharacterData} characterData
     * @return {boolean}
     */
    static isTargetValid(group, targetData, characterData) {
        const targetToken = targetData.token;
        const characterToken = characterData.token;
        switch (group) {
            case "targetsExceptSelf":
                return targetData.actor !== characterData.actor;
            case "self":
                return targetData.actor === characterData.actor;
            case "allies":
                return targetToken.disposition === characterToken.disposition && targetData.actor !== characterData.actor;
            case "alliesAndSelf":
                return targetToken.disposition === characterToken.disposition;
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