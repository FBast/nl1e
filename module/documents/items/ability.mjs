import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {AbilityTemplate} from "../../helpers/abilityTemplate.mjs";
import {Pl1eActorItem} from "./actorItem.mjs";

export class Pl1eAbility extends Pl1eActorItem {

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
    async use(options) {
        if (!this._isContextValid(this.actor)) return;

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
            dynamicAttributes: JSON.parse(JSON.stringify(this.system.dynamicAttributes)),
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

        // Calculate character attributes
        let calculatedAttributes = {};
        for (let [id, attribute] of Object.entries(characterData.attributes)) {
            let calculatedAttribute = { ...attribute };
            if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
                calculatedAttribute.value *= characterData.result > 0 ? characterData.result : 0;
            }
            if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
                calculatedAttribute.value = characterData.result > 0 ? calculatedAttribute.value : 0;
            }
            calculatedAttributes[id] = calculatedAttribute;
        }
        characterData.attributes = calculatedAttributes;

        // Notify if attributes has effects
        characterData.hasEffects = Object.values(characterData.attributes).some(atr => atr.data !== undefined);

        // Ability Data
        const abilityData = {
            characterData: characterData,
            templates: []
        };

        // Target character if areaShape is self
        if (characterData.attributes.areaShape.value === "self") {
            token.setTarget(true, { user: game.user, releaseOthers: false, groupSelection: false });
        }
        // Else create target selection templates
        else {
            if (characterData.attributes.areaNumber.value !== 0 && calculatedAttributes.areaShape.value !== "self") {
                await characterData.actor.sheet?.minimize();
                for (let i = 0; i < calculatedAttributes.areaNumber.value; i++) {
                    const template = await AbilityTemplate.fromItem(characterData.item, characterData.attributes, characterData.dynamicAttributes);
                    abilityData.templates.push(template);
                    await template?.drawPreview();
                }
                await characterData.actor.sheet?.maximize();
            }
        }

        // Display message
        await this._displayMessage(characterData);

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

        // Apply dynamic attributes, here we calculate each dynamic attribute for all targets
        let attributesModificationsData = [];
        for (let [id, dynamicAttribute] of Object.entries(this.system.dynamicAttributes)) {
            const attributeModificationsData = dynamicAttribute.apply(characterData, targetsData);
            attributesModificationsData.push(attributeModificationsData);
        }

        // Merging attributes modifications into more readable targetsData
        this.mergeAttributesModifications(targetsData, attributesModificationsData)

        // Notify if attributes has effects
        for (const targetData of targetsData) {
            targetData.hasEffects = targetData.dynamicAttributes.some(atr => atr.data !== undefined);
        }

        // Display messages
        for (const targetData of targetsData) {
            await this._displayMessage(characterData, targetData);
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
            Pl1eHelpers.mergeDeep(characterData.attributes, characterData.linkedItem.system.dynamicAttributes);
        }
        if (characterData.attributes.abilityLink.value === 'parent') {
            let relatedItems = [];
            for (const item of characterData.actor.items) {
                if (!item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
                if (item.system.subItems === undefined) continue;
                for (let [key, subItem] of item.system.subItems) {
                    const subItemFlag = subItem.getFlag('core', 'sourceId');
                    const itemFlag = characterData.item.getFlag('core', 'sourceId');
                    if (subItemFlag !== itemFlag) continue;
                    relatedItems.push(item);
                }
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoEquippedParent"));
                return;
            }
            characterData.linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(characterData.attributes, characterData.linkedItem.system.attributes);
            for (let [id, dynamicAttribute] of Object.entries(characterData.linkedItem.system.dynamicAttributes)) {
                if (dynamicAttribute.attributeLink !== "child") continue;
                characterData.dynamicAttributes[id] = dynamicAttribute;
            }
        }
    }

    /**
     * @param {TargetData[]} targetsData
     * @param {AttributesModificationsData} attributesModificationsData
     * @private
     */
    mergeAttributesModifications(targetsData, attributesModificationsData) {
        for (const attributeModificationsData of attributesModificationsData) {
            for (const attributeModificationData of attributeModificationsData) {
                // Get for the associated target
                const targetData = targetsData.find(td => td.token === attributeModificationData.token);
                if (targetData === undefined)
                    throw new Error("PL1E | Cannot find any target token associated to attribute modification data")

                // Check for an existing dynamic attribute with same data
                const existingDynamicAttribute = targetData.dynamicAttributes
                    .find(da => da.data === attributeModificationData.dynamicAttribute.data);

                // If found then merge
                if (existingDynamicAttribute) {
                    existingDynamicAttribute.merge(attributeModificationData.dynamicAttribute)
                }
            }
        }
    }

    /**
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<void>}
     * @private
     */
    async _displayMessage(characterData, targetData = undefined) {
        const rollData = targetData === undefined ? characterData.rollData : targetData.rollData;
        const template = targetData === undefined ? "character" : "target";
        // Render the chat card template
        const html = await renderTemplate(`systems/pl1e/templates/chat/ability-${template}.hbs`,
            {rollData: rollData, characterData: characterData, targetData: targetData});

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: this}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: '[' + game.i18n.localize("PL1E.Ability") + '] ' + characterData.item.name,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {"core.canPopout": true},
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

    /**
     * Check if the ability context is valid
     * @private
     */
    _isContextValid(actor) {
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
        if (itemAttributes.staminaCost.apply && itemAttributes.staminaCost.value > actor.system.resources.stamina.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughStamina"));
            isValid = false;
        }
        if (itemAttributes.manaCost.apply && itemAttributes.manaCost.value > actor.system.resources.mana.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughMana"));
            isValid = false;
        }
        return isValid;
    }

}