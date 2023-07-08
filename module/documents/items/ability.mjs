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
        if (!this._canActivate(token, token.actor)) return;

        token.actor.system.misc.actionInProgress = true;

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
            if (!await this._linkItem(this.characterData)) return;
        }

        // Character rollData if exist
        if (this.characterData.attributes.characterRoll !== 'none') {
            this.characterData.rollData = await this.characterData.actor.rollSkill(this.characterData.attributes.characterRoll);
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
        const chatMessage = await Pl1eChat.abilityRoll(this.characterData);

        // If the ability don't trigger reaction then apply
        if (!this.characterData.attributes.triggerReactions)
            await this.apply({action: "launch"});
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

        // Remove all buttons
        const cardButtons = $(event.currentTarget).closest(".card-buttons");
        cardButtons.remove();

        // Action is resolved
        this.characterData.token.actor.system.misc.actionInProgress = false;

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
                if (this.characterData.attributes.targetRoll.length > 0) {
                    targetData.rollData = await token.actor.rollSkills(this.characterData.attributes.targetRoll);
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
        for (let [key, value] of Object.entries(characterData.attributes)) {
            let calculatedAttribute = value;
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig !== undefined) {
                if (attributeConfig.type === "number") {
                    // Apply resolution type
                    if (characterData.attributes[`${key}ResolutionType`] !== undefined) {
                        const resolutionType = characterData.attributes[`${key}ResolutionType`];
                        if (resolutionType === "multiplyBySuccess") {
                            calculatedAttribute *= characterData.result > 0 ? characterData.result : 0;
                        }
                        if (resolutionType === "valueIfSuccess") {
                            calculatedAttribute = characterData.result > 0 ? calculatedAttribute : 0;
                        }
                    }

                    // Negate some attributes
                    if (value > 0 && attributeConfig.invertSign) {
                        calculatedAttribute *= -1;
                    }
                }
            }
            calculatedAttributes[key] = calculatedAttribute;
        }
        return calculatedAttributes;
    }

    /**
     * Apply the attributes effects
     * @returns {Promise<void>}
     * @private
     */
    async _applyAttributes() {
       for (const [key, value] of Object.entries(this.characterData.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig?.data === undefined || value === 0) continue;

            // Retrieve document for attribute modification
            let document = undefined;
            switch (attributeConfig.document) {
                case "actor":
                    document = this.characterData.actor;
                    break;
                case "linkedItem":
                    document = this.characterData.linkedItem;
                    break;
                default:
                    throw new Error("PL1E | unknown document type : " + attributeConfig.document);
            }
            if (document === undefined)
                throw new Error("PL1E | no document correspond to : " + attributeConfig.document);

            // Calculate modification
            const attributeDataConfig = CONFIG.PL1E[attributeConfig.dataGroup][attributeConfig.data];
            let currentValue = foundry.utils.getProperty(document, attributeDataConfig.path);
            switch (attributeConfig.type) {
                case "number":
                    currentValue += value;
                    break;
                case "bool":
                    currentValue = attributeConfig.applyIfTrue ? value : currentValue;
                    break;
            }

           // Apply attribute modification
            await document.update({
                [attributeDataConfig.path]: currentValue
            });
        }
    }

    /**
     * Add item attributes and dynamic attributes if ability link defined
     * @param {CharacterData} characterData
     * @private
     */
    async _linkItem(characterData) {
        // Get weapons using the same mastery
        const relatedItems = this._getLinkableItems(characterData.attributes, characterData.actor.items);
        if (relatedItems.length === 1) {
            characterData.linkedItem = relatedItems[0];
        }
        else {
            characterData.linkedItem = await this._itemsDialog(relatedItems);
            if (characterData.linkedItem === null) return false;
        }

        // Get linked attributes
        if (characterData.attributes.weaponLink !== "special") {
            characterData.attributes.areaShape = "target";
            characterData.attributes.rangeResolutionType = "value";
            characterData.attributes.areaNumber = 1;
        }
        if (characterData.attributes.weaponLink === "melee") {
            characterData.attributes.range = characterData.linkedItem.system.attributes.reach;
        } else if (characterData.attributes.weaponLink === "ranged") {
            characterData.attributes.range = characterData.linkedItem.system.attributes.range;
        }
        characterData.attributes.masters = characterData.linkedItem.system.attributes.masters;
        Pl1eHelpers.mergeDeep(characterData.activeAspects, characterData.linkedItem.system.activeAspects);

        return true;
    }

    /**
     * @param items
     * @return {Pl1eItem}
     * @private
     */
    _itemsDialog(items) {
        // Generate the HTML for the buttons dynamically based on the item data
        let buttonsHTML = "";
        for (const key in items) {
            const item = items[key];
            const imageSrc = item.img; // Replace with your item image source getter
            const altText = `Button ${key}`;
            buttonsHTML += `<button style="width: 100px; height: 100px; margin-right: 10px;" data-action="${key}">
                    <img style="width: 100%; height: 100%;" src="${imageSrc}" alt="${altText}">
                </button>`;
        }

        return new Promise((resolve) => {
            const dialog = new Dialog({
                title: `${this.name} : ${game.i18n.localize("PL1E.SelectAnItem")}`,
                content: `<div style="display: flex;">${buttonsHTML}</div>`,
                buttons: {},
                close: (html) => resolve(null),
                render: (html) => {
                    html.find("button[data-action]").on("click", (event) => {
                        const button = event.currentTarget;
                        const action = button.dataset.action;
                        resolve(items[Number(action)]);
                        dialog.close();
                    });
                },
                default: "",
                closeOnSubmit: false,
                submitOnClose: false,
                jQuery: false,
                resizable: false
            }).render(true);
        });
    }

    /**
     * Return the linkable items for this ability
     * @param {Object} itemAttributes
     * @param {Pl1eItem[]} items
     * @returns {*[]}
     */
    _getLinkableItems(itemAttributes, items) {
        const relatedItems = [];
        for (const item of items) {
            if (item.type !== "weapon" && item.type !== "wearable" && !item.isEnabled) continue;
            if (itemAttributes.isMajorAction && item.system.isMajorActionUsed) continue;
            if (itemAttributes.weaponLink === "melee" && !item.system.attributes.melee) continue;
            if (itemAttributes.weaponLink === "ranged" && !item.system.attributes.ranged) continue;
            if (!itemAttributes.masters.some(mastery => item.system.attributes.masters.includes(mastery))) continue;
            relatedItems.push(item);
        }
        return relatedItems;
    }

    /** @inheritDoc */
    _canActivate(token, actor) {
        if (!super._canActivate(token, actor)) return false;

        const itemAttributes = this.system.attributes;
        if (this.system.isMemorized) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotMemorized"));
            return false;
        }
        if (!token.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotInCombat"));
            return false;
        }
        if (itemAttributes.weaponLink !== "none" && this._getLinkableItems(itemAttributes, actor.items).length === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoLinkedItemMatch"));
            return false;
        }
        return true;
    }

}