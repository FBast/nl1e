import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {AbilityTemplate} from "../../helpers/abilityTemplate.mjs";
import {Pl1eChat} from "../../helpers/chat.mjs";
import {Pl1eItem} from "../item.mjs";
import {Pl1eAspect} from "../../helpers/aspect.mjs";

export class Pl1eAbility extends Pl1eItem {

    /**
     * Data of the character
     * @type {CharacterData}
     */
    characterData;

    /** @inheritDoc */
    async toggle(options) {
        if (!this.system.isMemorized && this.actor.system.general.slots - this.system.attributes.level < 0) return;

        await this.update({
            ["system.isMemorized"]: !this.system.isMemorized
        });

        await super.toggle(options);
    }

    /** @inheritDoc */
    async activate() {
        const token = this.actor.bestToken;
        if (token === null) return;

        if (!this._canActivate(token.actor)) return;

        /**
         * @type {CharacterData}
         */
        this.characterData = {
            actor: token.actor,
            actorId: token.actor._id,
            token: token,
            tokenId: token.document._id,
            item: this,
            itemId: this._id,
            attributes: this.system.attributes,
            activeAspects: this.system.activeAspects,
            linkedItem: null,
            templates: []
        }

        // Get linked attributes
        if (this.characterData.attributes.weaponLink !== "none") {
            if (!this._linkItem(this.characterData)) return;
        }

        // Character rollData if exist
        if (this.characterData.attributes.characterRoll !== 'none') {
            const skill = this.characterData.actor.system.skills[this.characterData.attributes.characterRoll];
            this.characterData.rollData = await this.characterData.actor.rollSkill(skill);
            this.characterData.result = this.characterData.rollData.total;
        }
        else {
            this.characterData.result = 1;
        }

        // Calculate attributes
        this.characterData.attributes = await this._calculateAttributes(this.characterData);

        // Target character if areaShape is self
        if (this.characterData.attributes.areaShape === "self") {
            token.setTarget(true, { user: game.user, releaseOthers: false, groupSelection: false });
        }
        // Else create target selection templates
        else {
            if (this.characterData.attributes.areaNumber !== 0 && this.characterData.attributes.areaShape !== "self") {
                await this.characterData.actor.sheet?.minimize();
                for (let i = 0; i < this.characterData.attributes.areaNumber; i++) {
                    const template = await AbilityTemplate.fromItem(this.characterData.item, this.characterData.attributes, this.characterData.activeAspects);
                    this.characterData.templates.push(template);
                    await template?.drawPreview();
                }
                await this.characterData.actor.sheet?.maximize();
            }
        }

        // Find activationMacro (pass for activation)
        const macroId = this.characterData.attributes.activationMacro;
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const activationMacro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute activationMacro
        if (enableVFXAndSFX && activationMacro !== undefined) activationMacro.execute({characterData: this.characterData, active: true});

        // Display message
        await Pl1eChat.abilityRoll(this.characterData);
    }

    /** @inheritDoc */
    async apply(options) {
        // Handle different actions
        switch (options.action) {
            case "launch":
                await this._applyAttributes();
                await this._launchAbility();
                break;
            case "counter":
                await this._applyAttributes();
                break;
        }

        // Find activationMacro (pass for deactivation)
        const macroId = this.characterData.item.system.attributes.activationMacro;
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const activationMacro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute activationMacro
        if (enableVFXAndSFX && activationMacro !== undefined) activationMacro.execute({characterData: this.characterData, active: false});

        // Destroy templates after fetching target with df-template
        for (const template of this.characterData.templates) {
            await template.releaseTemplate();
        }

        // Release all targets
        for (let token of game.user.targets) {
            token.setTarget(false, { user: game.user, releaseOthers: false, groupSelection: false });
        }

        // Empty ability data
        this.characterData = {};
    }

    /**
     * Launch the ability
     * @returns {Promise<void>}
     * @private
     */
    async _launchAbility() {
        // Roll data for every targets
        /** @type {TargetData[]} */
        let targetsData = []

        // Populate targetsData
        for (let template of this.characterData.templates) {
            for (let token of template.getTargets()) {
                const targetData = {};
                if (this.characterData.attributes.targetRoll !== "none") {
                    const skill = token.actor.system.skills[this.characterData.attributes.targetRoll];
                    targetData.rollData = await token.actor.rollSkill(skill);
                    targetData.result = this.characterData.result - targetData.rollData.total;
                }
                else {
                    targetData.result = this.characterData.result;
                }
                targetData.actor = token.actor;
                targetData.actorId = token.actor._id;
                targetData.token = token;
                targetData.tokenId = token.document._id;
                targetsData.push(targetData);
            }
        }

        // Apply aspects, here we calculate each aspect for all targets
        for (let [id, aspect] of Object.entries(this.characterData.activeAspects)) {
            targetsData = await Pl1eAspect.applyActive(aspect, this.characterData, targetsData);
        }

        // Find launchMacro
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const macroId = this.characterData.attributes.launchMacro;
        const launchMacro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute launchMacro
        if (enableVFXAndSFX && launchMacro !== undefined) launchMacro.execute({characterData: this.characterData, targetsData: targetsData});

        // Display messages
        for (const targetData of targetsData) {
            await Pl1eChat.abilityRoll(this.characterData, targetData);
        }
    }

    /**
     * Calculate the attributes
     * @param characterData
     * @returns {Promise<void>}
     * @private
     */
    _calculateAttributes(characterData) {
        // Calculate character attributes
        let calculatedAttributes = {};
        for (let [id, attribute] of Object.entries(characterData.attributes)) {
            let calculatedAttribute = attribute;
            const attributeConfig = CONFIG.PL1E.attributes[id];
            if (attributeConfig !== undefined) {
                if (attributeConfig.type === "number" && characterData.attributes[`${id}ResolutionType`] !== undefined) {
                    const resolutionType = characterData.attributes[`${id}ResolutionType`];
                    if (resolutionType === "multiplyBySuccess") {
                        calculatedAttribute *= characterData.result > 0 ? characterData.result : 0;
                    }
                    if (resolutionType === "valueIfSuccess") {
                        calculatedAttribute = characterData.result > 0 ? calculatedAttribute : 0;
                    }
                }

                // Negate some attributes
                if (attribute.value > 0 && attributeConfig.invertSign) {
                    calculatedAttribute *= -1;
                }
            }
            calculatedAttributes[id] = calculatedAttribute;
        }
        return calculatedAttributes;
    }

    /**
     * Apply the attributes effects
     * @returns {Promise<void>}
     * @private
     */
    async _applyAttributes() {
       for (const [key, attribute] of Object.entries(this.characterData.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig?.data === undefined || attribute === 0) continue;

            // Apply effects
            const attributeDataConfig = CONFIG.PL1E[attributeConfig.dataGroup][attributeConfig.data];
            let actorValue = foundry.utils.getProperty(this.characterData.actor, attributeDataConfig.path);
            actorValue += attribute;
            await this.characterData.actor.update({
                [attributeDataConfig.path]: actorValue
            });
        }
    }

    /**
     * Add item attributes and dynamic attributes if ability link defined
     * @param {CharacterData} characterData
     * @private
     */
    _linkItem(characterData) {
        // Get weapons using the same mastery
        const relatedItems = [];
        for (const item of characterData.actor.items) {
            if (item.type !== "weapon" || !item.isEnabled) continue;
            if (characterData.item.system.attributes.weaponLink === "melee" && !item.system.attributes.melee) continue;
            if (characterData.item.system.attributes.weaponLink === "ranged" && !item.system.attributes.ranged) continue;
            if (characterData.item.system.attributes.mastery !== "none" && item.system.attributes.mastery !== characterData.item.system.attributes.mastery) continue;
            if (characterData.item.system.attributes.mastery === "none" && !item.system.refItems.includes(characterData.item.sourceId)) continue;
            relatedItems.push(item);
        }

        if (relatedItems.length === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoLinkedItemMatch"));
            return false;
        }

        // // Open dialogue if multiple related items
        // new Dialog({
        //     title: "Image Buttons",
        //     content: `<div>
        //                 <button data-action="button1">
        //                     <img src="image1.png" alt="Button 1">
        //                 </button>
        //                 <button data-action="button2">
        //                     <img src="image2.png" alt="Button 2">
        //                 </button>
        //                 <button data-action="button3">
        //                     <img src="image3.png" alt="Button 3">
        //                 </button>
        //             </div>`,
        //     buttons: {},
        //     close: () => {},
        //     render: () => {},
        //     default: "",
        //     closeOnSubmit: false,
        //     submitOnClose: false,
        //     jQuery: false,
        //     resizable: true
        // }).render(true);

        characterData.linkedItem = relatedItems[0];

        // Get linked attributes
        if (characterData.attributes.weaponLink === "melee") {
            characterData.attributes.areaShape = "target";
            characterData.attributes.range = characterData.linkedItem.system.attributes.reach;
            characterData.attributes.rangeResolutionType = "value";
            characterData.attributes.areaNumber = 1;
        }
        else if (characterData.attributes.weaponLink === "ranged") {
            characterData.attributes.areaShape = "target";
            characterData.attributes.range = characterData.linkedItem.system.attributes.range;
            characterData.attributes.rangeResolutionType = "value";
            characterData.attributes.areaNumber = 1;
        }
        characterData.attributes.mastery = characterData.linkedItem.system.attributes.mastery;
        Pl1eHelpers.mergeDeep(characterData.activeAspects, characterData.linkedItem.system.activeAspects);

        return true;
    }

    /** @inheritDoc */
    _canActivate(actor) {
        if (!super._canActivate(actor)) return false;

        const itemAttributes = this.system.attributes;
        // If is not memorized
        if (!this.system.isMemorized) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotMemorized"));
            return false;
        }
        // If cost is not affordable
        if (itemAttributes.staminaCost > actor.system.resources.stamina) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughStamina"));
            return false;
        }
        if (itemAttributes.manaCost > actor.system.resources.mana) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughMana"));
            return false;
        }
        if (itemAttributes.manaCost > actor.system.resources.mana) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughMana"));
            return false;
        }
        // If not enough actions points
        if (itemAttributes.activation === "action" && actor.system.misc.action <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            return false;
        }
        if (itemAttributes.activation === "reaction" && actor.system.misc.reaction <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreReaction"));
            return false;
        }
        if (itemAttributes.activation === "instant" && actor.system.misc.instant <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreInstant"));
            return false;
        }
        if (itemAttributes.weaponLink !== "none") {
            for (const item of actor.items) {
                if (item.type !== "weapon" || !item.isEnabled) continue;
                if (itemAttributes.weaponLink === "melee" && !item.system.attributes.melee) continue;
                if (itemAttributes.weaponLink === "ranged" && !item.system.attributes.ranged) continue;
                if (itemAttributes.mastery !== "none" && item.system.attributes.mastery !== itemAttributes.mastery) continue;
                if (itemAttributes.mastery === "none" && !item.system.refItems.includes(this.sourceId)) continue;
                return true;
            }
            ui.notifications.warn(game.i18n.localize("PL1E.NoLinkedItemMatch"));
            return false;
        }
        return true;
    }

}