import {Pl1eSubItem} from "./subItem.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {AbilityTemplate} from "../../helpers/abilityTemplate.mjs";

export class Pl1eAbility extends Pl1eSubItem {

    /**
     * Internal type used to manage ability data
     *
     * @typedef {object} AbilityData
     * @property {Pl1eActor} actor The actor using the ability
     * @property {string} tokenId The token of the actor which originate the ability
     * @property {Pl1eItem} item The ability itself
     * @property {string} itemId The ability uuid
     * @property {any} launcherData Data of the actor
     * @property {any[]} targetsData Data of the targets
     * @property {AbilityTemplate[]} templates  An array of the measure templates
     */

    /**
     * @type {AbilityData}
     */
    abilityData;

    /** @override */
    async toggle(options) {
        if (!this.item.system.isMemorized && this.actor.system.attributes.slots - this.item.system.attributes.level.value < 0) return;

        await this.item.update({
            ["system.isMemorized"]: !this.item.system.isMemorized
        });
    }

    /** @override */
    async use(options) {
        if (!this.actor.bestToken === null) return;
        if (!this._isContextValid(this.actor)) return;

        // Copy attributes
        const attributes = JSON.parse(JSON.stringify(this.item.system.attributes));
        const optionalAttributes = JSON.parse(JSON.stringify(this.item.system.optionalAttributes));

        // Get linked attributes
        let linkedItem;
        if (attributes.abilityLink.value === 'mastery') {
            const relatedMastery = attributes.mastery.value;
            const relatedItems = this.actor.items.filter(value => value.type === 'weapon'
                && value.system.attributes.mastery.value === relatedMastery);
            if (relatedItems.length > 1) {
                ui.notifications.warn(game.i18n.localize("PL1E.MultipleRelatedMastery"));
                return;
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoRelatedMastery"));
                return;
            }
            linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(attributes, linkedItem.system.attributes);
            Pl1eHelpers.mergeDeep(optionalAttributes, linkedItem.system.optionalAttributes);
        }
        if (attributes.abilityLink.value === 'parent') {
            let relatedItems = [];
            for (const item of this.actor.items) {
                if (!item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
                if (item.system.subItemsMap === undefined) continue;
                for (let [key, subItem] of item.system.subItemsMap) {
                    const subItemFlag = subItem.getFlag('core', 'sourceId');
                    const itemFlag = this.item.getFlag('core', 'sourceId');
                    if (subItemFlag !== itemFlag) continue;
                    relatedItems.push(item);
                }
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoEquippedParent"));
                return;
            }
            linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(attributes, linkedItem.system.attributes);
            for (let [id, optionalAttribute] of Object.entries(linkedItem.system.optionalAttributes)) {
                if (optionalAttribute.attributeLink !== "child") continue;
                optionalAttributes[id] = optionalAttribute;
            }
        }

        // Target selection template
        const templates = [];
        if (attributes.areaNumber.value !== 0) {
            await this.actor.sheet?.minimize();
            for (let i = 0; i < attributes.areaNumber.value; i++) {
                const template = await AbilityTemplate.fromItem(this.item, attributes, optionalAttributes);
                templates.push(template);
                await template?.drawPreview();
            }
            await this.actor.sheet?.maximize();
        }

        // Return if no area defined
        if (attributes.areaNumber.value > 0 && templates.length === 0) return;

        // Roll Data
        let rollResult = 0;
        if (attributes.skillRoll.value !== 'none') {
            const mainSkill = this.actor.system.skills[attributes.skillRoll.value];
            rollResult = await this.actor.rollSkill(mainSkill);
        }

        // Calculate launcher attributes
        let calculatedAttributes = [];
        calculatedAttributes.push()
        for (let [id, optionalAttribute] of Object.entries(optionalAttributes)) {
            if (optionalAttribute.targetGroup !== 'self') continue;
            let calculatedAttribute = this._calculateAttribute(optionalAttribute, rollResult, this.actor);
            calculatedAttributes.push(calculatedAttribute);
        }

        // Launcher Data
        const token = this.actor.bestToken;
        this.abilityData = {
            templates: templates,
            launcherData: {
                actor: this.actor,
                tokenId: token?.uuid || null,
                item: this,
                itemId: this.uuid,
                result: rollResult,
                attributes: attributes,
                optionalAttributes: optionalAttributes,
                calculatedAttributes: calculatedAttributes,
                linkedItem: linkedItem
            }
        };

        // Render the chat card template
        const html = await renderTemplate("systems/pl1e/templates/chat/item-card.hbs", this.abilityData);

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            flavor: '[' + game.i18n.localize("PL1E.Ability") + '] ' + this.name,
            content: html,
            speaker: ChatMessage.getSpeaker({actor: this.actor}),
            flags: {"core.canPopout": true}
        };

        await ChatMessage.create(chatData);
    }

    /** @override */
    async apply(options) {
        // Handle different actions
        if (options.action === 'resolve') await this._resolveAbility();

        // Destroy templates after fetching target with df-template
        for (const template of this.abilityData.templates) {
            await template.releaseTemplate();
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
        // Target Data
        let targetTokens = game.user.targets;

        for (let targetToken of targetTokens) {
            // Make a shallow copy of the ability data for this target
            let abilityData = {...this.abilityData};

            // Copy attributes
            const launcherData = abilityData.launcherData;
            const attributes = abilityData.launcherData.attributes;
            const optionalAttributes = abilityData.launcherData.optionalAttributes;

            // Opposite roll if exist
            let rollResult = 0;
            if (attributes.oppositeRolls.value !== 'none') {
                const skill = targetToken.actor.system.skills[attributes.oppositeRolls.value];
                rollResult = await targetToken.actor.rollSkill(skill);
            }
            let totalResult = abilityData.launcherData.result - rollResult;

            // Calculate target attributes
            let calculatedAttributes = [];
            for (let [id, optionalAttribute] of Object.entries(optionalAttributes)) {
                if (optionalAttribute.targetGroup === 'self' && targetToken.actor !== launcherData.actor) continue;
                if (optionalAttribute.targetGroup === 'allies' && targetToken.document.disposition !== launcherData.actor.bestToken.disposition) continue;
                if (optionalAttribute.targetGroup === 'opponents' && targetToken.document.disposition === launcherData.actor.bestToken.disposition) continue;
                let calculatedAttribute = this._calculateAttribute(optionalAttribute, totalResult, targetToken.actor);
                calculatedAttributes.push(calculatedAttribute);
            }

            abilityData.targetData = {
                actor: targetToken.actor,
                tokenId: targetToken?.uuid || null,
                result: rollResult,
                totalResult: totalResult,
                calculatedAttributes: calculatedAttributes
            };

            const html = await renderTemplate("systems/pl1e/templates/chat/opposite-card.hbs", abilityData);

            // Create the ChatMessage data object
            const chatData = {
                user: game.user.id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: html,
                // flavor: this.system.description || this.name,
                speaker: ChatMessage.getSpeaker({actor: targetToken.actor, targetToken}),
                flags: {"core.canPopout": true}
            };

            await ChatMessage.create(chatData);

            // Apply target effects
            for (const attribute of abilityData.targetData.calculatedAttributes) {
                await abilityData.targetData.actor.applyAttribute(attribute, false, true);
            }
            abilityData.targetData.actor.sheet.render(false);
        }

        // Apply launcher effects
        for (const calculatedAttribute of this.abilityData.launcherData.calculatedAttributes) {
            await this.abilityData.launcherData.actor.applyAttribute(calculatedAttribute, false, true);
        }
        this.abilityData.launcherData.actor.sheet.render(false);
    }

    /**
     * Check if the ability context is valid
     * @private
     */
    _isContextValid(actor) {
        let isValid = true;
        const itemAttributes = this.item.system.attributes;
        // If is not in battle
        if (!actor.bestToken.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotInBattle"));
            isValid = false;
        }
        // If is not memorized
        if (!this.item.system.isMemorized) {
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