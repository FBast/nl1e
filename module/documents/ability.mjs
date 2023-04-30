import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {AbilityTemplate} from "../helpers/abilityTemplate.mjs";
import {Pl1eChat} from "../helpers/chat.mjs";
import {Pl1eItem} from "./item.mjs";
import {Pl1eAspect} from "../helpers/aspect.mjs";

export class Pl1eAbility extends Pl1eItem {

    /**
     * @type {AbilityData}
     */
    abilityData;

    /** @override */
    async toggle(options) {
        if (!this.system.isMemorized && this.actor.system.general.slots - this.system.attributes.level.value < 0) return;

        await this.update({
            ["system.isMemorized"]: !this.system.isMemorized
        });
    }

    /** @override */
    async activate() {
        if (!this._canActivate(this.actor)) return;

        const token = this.actor.bestToken;
        if (token === null) return;

        /**
         * @type {CharacterData}
         */
        let characterData = {
            actor: this.actor,
            token: token,
            tokenId: token.document.uuid,
            item: this,
            itemId: this.uuid,
            attributes: JSON.parse(JSON.stringify(this.system.attributes)),
            activeAspects: this.system.activeAspects,
            linkedItem: null
        }

        // Get linked attributes
        this._linkItem(characterData);

        // Character rollData if exist
        if (characterData.attributes.characterRoll.value !== 'none') {
            const skill = characterData.actor.system.skills[characterData.attributes.characterRoll.value];
            characterData.rollData = await characterData.actor.rollSkill(skill);
            characterData.result = characterData.rollData.total;
        }
        else {
            characterData.result = 1;
        }

        // Apply and calculate attributes
        await this._applyAttributes(characterData);

        // Ability Data
        const abilityData = {
            characterData: characterData,
            templates: []
        }

        // Target character if areaShape is self
        if (characterData.attributes.areaShape.value === "self") {
            token.setTarget(true, { user: game.user, releaseOthers: false, groupSelection: false });
        }
        // Else create target selection templates
        else {
            if (characterData.attributes.areaNumber.value !== 0 && characterData.attributes.areaShape.value !== "self") {
                await characterData.actor.sheet?.minimize();
                for (let i = 0; i < characterData.attributes.areaNumber.value; i++) {
                    const template = await AbilityTemplate.fromItem(characterData.item, characterData.attributes, characterData.aspects);
                    abilityData.templates.push(template);
                    await template?.drawPreview();
                }
                await characterData.actor.sheet?.maximize();
            }
        }

        // Display message
        await Pl1eChat.abilityRoll(characterData);

        // Update data
        this.abilityData = abilityData;
    }

    /** @override */
    async apply(options) {
        // Handle different actions
        if (options.action === 'resolve') await this._resolveAbility();

        // Destroy templates after fetching target with df-template
        for (const template of this.abilityData.templates) {
            await template.releaseTemplate();
        }

        // Release all targets
        for (let token of game.user.targets) {
            token.setTarget(false, { user: game.user, releaseOthers: false, groupSelection: false });
        }

        // Reset abilityData
        this.abilityData = {};
    }

    /**
     * Calculate and apply the attributes
     * @param characterData
     * @returns {Promise<void>}
     * @private
     */
    async _applyAttributes(characterData) {
        // Calculate character attributes
        let calculatedAttributes = {};
        for (let [id, attribute] of Object.entries(characterData.attributes)) {
            let calculatedAttribute = {...attribute};
            const attributeConfig = CONFIG.PL1E.attributes[id];
            if (attributeConfig.type === "number") {
                if (calculatedAttribute.resolutionType === "multiplyBySuccess") {
                    calculatedAttribute.value *= characterData.result > 0 ? characterData.result : 0;
                }
                if (calculatedAttribute.resolutionType === "valueIfSuccess") {
                    calculatedAttribute.value = characterData.result > 0 ? calculatedAttribute.value : 0;
                }
            }
            // Type select attribute are very specific and should handle one by one
            if (attributeConfig.type === "select") {
                if (id === "activation") {
                    calculatedAttributes[calculatedAttribute.value] = {
                        value: -1
                    };
                }
            }
            // Negate some attributes
            if (attributeConfig.invertSign) {
                calculatedAttribute.value *= -1;
            }
            calculatedAttributes[id] = calculatedAttribute;
        }
        characterData.attributes = calculatedAttributes;

        // Apply attributes and notify effects
        characterData.hasEffects = false;
        for (const [key, attribute] of Object.entries(characterData.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig?.data === undefined || attribute.value === 0) continue;
            // Apply effects
            const attributeDataConfig = CONFIG.PL1E[attributeConfig.dataGroup][attributeConfig.data];
            let actorValue = foundry.utils.getProperty(characterData.token.actor, attributeDataConfig.path);
            actorValue += attribute.value;
            await characterData.token.actor.update({
                [attributeDataConfig.path]: actorValue
            });
            // Notify effects
            characterData.hasEffects = true;
        }
    }

    /**
     * Resolve the ability
     * @returns {Promise<void>}
     * @private
     */
    async _resolveAbility() {
        let targetTokens = game.user.targets;
        const characterData = this.abilityData.characterData;

        // Roll data for every targets
        /** @type {TargetData[]} */
        let targetsData = []
        for (let targetToken of targetTokens) {
            const targetData = {};
            if (characterData.attributes.targetRoll.value !== "none") {
                const skill = targetToken.actor.system.skills[characterData.attributes.targetRoll.value];
                targetData.rollData = await targetToken.actor.rollSkill(skill);
                targetData.result = characterData.result - targetData.rollData.total;
            }
            else {
                targetData.result = characterData.result;
            }
            targetData.token = targetToken;
            targetData.tokenId = targetToken.document.uuid;
            targetsData.push(targetData);
        }

        // Apply dynamic attributes, here we calculate each aspect for all targets
        for (let aspect of characterData.activeAspects) {
            targetsData = await Pl1eAspect.apply(characterData, targetsData);
        }

        // Notify if attributes has effects
        for (const targetData of targetsData) {
            targetData.hasEffects = targetData.activeAspects.length > 0;
        }

        // Display messages
        for (const targetData of targetsData) {
            await Pl1eChat.abilityRoll(characterData, targetData);
        }
    }

    /**
     * Add item attributes and dynamic attributes if ability link defined
     * @param {CharacterData} characterData
     * @private
     */
    _linkItem(characterData) {
        // Get linked attributes
        if (characterData.attributes.abilityLink.value === 'mastery') {
            const relatedMastery = attributes.mastery.value;
            const relatedItems = characterData.actor.items.filter(value => value.type === 'weapon'
                && value.system.attributes.mastery.value === relatedMastery);
            if (relatedItems.length > 1) {
                ui.notifications.warn(game.i18n.localize("PL1E.MultipleRelatedMastery"));
                return;
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoRelatedMastery"));
                return;
            }
            characterData.linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(characterData.attributes, characterData.linkedItem.system.attributes);
            Pl1eHelpers.mergeDeep(characterData.activeAspects, characterData.linkedItem.system.activeAspects);
        }
        if (characterData.attributes.abilityLink.value === 'parent') {
            let relatedItems = [];
            for (const item of characterData.actor.items) {
                if (!item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
                if (item.system.subItems === undefined) continue;
                for (let [key, subItem] of item.system.subItems) {
                    if (characterData.item.linkId !== subItem.linkId) continue;
                    relatedItems.push(item);
                }
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoEquippedParent"));
                return;
            }
            characterData.linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(characterData.attributes, characterData.linkedItem.system.attributes);
            for (let [id, dynamicAttribute] of Object.entries(characterData.linkedItem.system.activeAspects)) {
                if (dynamicAttribute.attributeLink !== "child") continue;
                characterData.activeAspects[id] = dynamicAttribute;
            }
        }
    }

    /**
     * Check if the ability activation is valid
     * @param {Actor} actor
     * @private
     */
    _canActivate(actor) {
        let isValid = true;
        const itemAttributes = this.system.attributes;
        // If is not in battle
        if (!actor.bestToken.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotInBattle"));
            isValid = false;
        }
        // If is not memorized
        if (!this.system.isMemorized) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotMemorized"));
            isValid = false;
        }
        // If cost is not affordable
        if (itemAttributes.staminaCost.value > actor.system.resources.stamina.value) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughStamina"));
            isValid = false;
        }
        if (itemAttributes.manaCost.value > actor.system.resources.mana.value) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughMana"));
            isValid = false;
        }
        if (itemAttributes.manaCost.value > actor.system.resources.mana.value) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughMana"));
            isValid = false;
        }
        if (itemAttributes.activation.value === "action" && actor.system.misc.action <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            isValid = false;
        }
        if (itemAttributes.activation.value === "reaction" && actor.system.misc.reaction <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreRection"));
            isValid = false;
        }
        if (itemAttributes.activation.value === "instant" && actor.system.misc.instant <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreInstant"));
            isValid = false;
        }
        return isValid;
    }

}