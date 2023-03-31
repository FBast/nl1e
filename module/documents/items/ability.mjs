import {Pl1eSubItem} from "./subItem.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {AbilityTemplate} from "../../helpers/abilityTemplate.mjs";

export class Pl1eAbility extends Pl1eSubItem {

    /**
     * Internal type used to manage ability data
     *
     * @typedef {object} AbilityData
     * @property {LauncherData} launcherData The launcher data
     * @property {AbilityTemplate[]} templates  An array of the measure templates
     */

    /**
     * @type {AbilityData}
     */
    abilityData;

    /** @override */
    async toggle(options) {
        if (!this.item.system.isMemorized && this.actor.system.misc.slots - this.item.system.attributes.level.value < 0) return;

        await this.item.update({
            ["system.isMemorized"]: !this.item.system.isMemorized
        });
    }

    /** @override */
    async use(options) {
        if (!this._isContextValid(this.actor)) return;

        const token = this.actor.bestToken;
        if (token === null) return;

        /**
         * Internal type used to manage ability data
         *
         * @typedef {object} LauncherData
         * @property {Pl1eActor} actor The actor using the ability
         * @property {string} tokenId The token of the actor which originate the ability
         * @property {Pl1eItem} item The ability itself
         * @property {string} itemId The ability uuid
         * @property {number} result The result of the roll
         * @property {object} attributes The attributes of the item
         * @property {object} optionalAttributes The optionalAttributes of the item
         * @property {Pl1eItem} linkedItem The linked item in case of abilityLink
         */

        /**
         * @type {LauncherData}
         */
        const launcherData = {
            actor: this.actor,
            tokenId: token?.uuid || null,
            item: this.item,
            itemId: this.item.uuid,
            result: 0,
            attributes: JSON.parse(JSON.stringify(this.item.system.attributes)),
            optionalAttributes: JSON.parse(JSON.stringify(this.item.system.optionalAttributes)),
            linkedItem: null
        }

        // Get linked attributes
        if (launcherData.attributes.abilityLink.value === 'mastery') {
            const relatedMastery = attributes.mastery.value;
            const relatedItems = launcherData.actor.items.filter(value => value.type === 'weapon'
                && value.system.attributes.mastery.value === relatedMastery);
            if (relatedItems.length > 1) {
                ui.notifications.warn(game.i18n.localize("PL1E.MultipleRelatedMastery"));
                return;
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoRelatedMastery"));
                return;
            }
            launcherData.linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(launcherData.attributes, launcherData.linkedItem.system.attributes);
            Pl1eHelpers.mergeDeep(launcherData.attributes, launcherData.linkedItem.system.optionalAttributes);
        }
        if (launcherData.attributes.abilityLink.value === 'parent') {
            let relatedItems = [];
            for (const item of launcherData.actor.items) {
                if (!item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
                if (item.system.subItemsMap === undefined) continue;
                for (let [key, subItem] of item.system.subItemsMap) {
                    const subItemFlag = subItem.getFlag('core', 'sourceId');
                    const itemFlag = launcherData.item.getFlag('core', 'sourceId');
                    if (subItemFlag !== itemFlag) continue;
                    relatedItems.push(item);
                }
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoEquippedParent"));
                return;
            }
            launcherData.linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(launcherData.attributes, launcherData.linkedItem.system.attributes);
            for (let [id, optionalAttribute] of Object.entries(launcherData.linkedItem.system.optionalAttributes)) {
                if (optionalAttribute.attributeLink !== "child") continue;
                launcherData.optionalAttributes[id] = optionalAttribute;
            }
        }

        // Roll Data
        if (launcherData.attributes.skillRoll.value !== 'none') {
            launcherData.result = await launcherData.actor.rollAbilityLauncher(launcherData);
        }

        // Calculate launcher attributes
        let calculatedAttributes = {};
        for (let [id, attribute] of Object.entries(launcherData.attributes)) {
            calculatedAttributes[id] = this._calculateAttribute(attribute, launcherData.result, launcherData.actor);
        }
        launcherData.attributes = calculatedAttributes;

        // Calculate launcher optionalAttributes
        let calculatedOptionalAttributes = [];
        for (let [id, optionalAttribute] of Object.entries(launcherData.optionalAttributes)) {
            if (optionalAttribute.targetGroup !== "self") continue;
            if (optionalAttribute.attributeLink === "passive") continue;
            let calculatedAttribute = this._calculateOptionalAttribute(optionalAttribute, launcherData.result, launcherData.actor);
            calculatedOptionalAttributes.push(calculatedAttribute);
        }
        launcherData.optionalAttributes = calculatedOptionalAttributes;

        // Ability Data
        const abilityData = {
            launcherData: launcherData,
            templates: []
        };

        // Target launcher if areaShape is self
        if (launcherData.attributes.areaShape.value === "self") {
            token.setTarget(true, { user: game.user, releaseOthers: false, groupSelection: false });
        }
        // Else create target selection templates
        else {
            if (launcherData.attributes.areaNumber.value !== 0 && calculatedAttributes.areaShape.value !== "self") {
                await launcherData.actor.sheet?.minimize();
                for (let i = 0; i < calculatedAttributes.areaNumber.value; i++) {
                    const template = await AbilityTemplate.fromItem(launcherData.item, launcherData.attributes, launcherData.optionalAttributes);
                    abilityData.templates.push(template);
                    await template?.drawPreview();
                }
                await launcherData.actor.sheet?.maximize();
            }
        }

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
            if (attributes.oppositeRolls.value !== "none") {
                const skill = targetToken.actor.system.skills[attributes.oppositeRolls.value];
                rollResult = await targetToken.actor.rollSkill(skill);
            }
            let totalResult = abilityData.launcherData.result - rollResult;

            // Calculate target attributes
            let calculatedOptionalAttributes = [];
            for (let [id, optionalAttribute] of Object.entries(optionalAttributes)) {
                if ((attributes.areaShape.value === "self" || optionalAttribute.targetGroup === "self") && targetToken.actor !== launcherData.actor) continue;
                if (optionalAttribute.targetGroup === "allies" && targetToken.document.disposition !== launcherData.actor.bestToken.disposition) continue;
                if (optionalAttribute.targetGroup === "opponents" && targetToken.document.disposition === launcherData.actor.bestToken.disposition) continue;
                let calculatedAttribute = this._calculateOptionalAttribute(optionalAttribute, totalResult, targetToken.actor);
                calculatedOptionalAttributes.push(calculatedAttribute);
            }

            abilityData.targetData = {
                actor: targetToken.actor,
                tokenId: targetToken?.uuid || null,
                result: rollResult,
                totalResult: totalResult,
                optionalAttributes: calculatedOptionalAttributes
            };

            const html = await renderTemplate("systems/pl1e/templates/chat/resolution-card.hbs", abilityData);

            // Create the ChatMessage data object
            const chatData = {
                user: game.user.id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: html,
                flavor: '[' + game.i18n.localize("PL1E.Ability") + '] ' + this.item.name,
                speaker: ChatMessage.getSpeaker({actor: targetToken.actor, targetToken}),
                flags: {"core.canPopout": true}
            };

            await ChatMessage.create(chatData);

            //TODO-fred Apply launcher effects such as resources cost

            // Apply target effects
            for (const calculatedOptionalAttribute of abilityData.targetData.optionalAttributes) {
                await abilityData.targetData.actor.applyOptionalAttribute(calculatedOptionalAttribute, false, true);
            }
            abilityData.targetData.actor.sheet.render(false);
        }
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