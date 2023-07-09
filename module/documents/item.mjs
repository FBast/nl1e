import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eSynchronizer} from "../helpers/synchronizer.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {AbilityTemplate} from "../helpers/abilityTemplate.mjs";
import {Pl1eChat} from "../helpers/chat.mjs";

export class Pl1eItem extends Item {

    get sourceId() {
        const sourceId = this.getFlag("core", "sourceId")
        if (sourceId === undefined) return undefined;
        const sourceIdArray = sourceId.split(".");
        return sourceIdArray[sourceIdArray.length - 1];
    }

    get parentId() {
        return this.getFlag("pl1e", "parentId");
    }

    get childId() {
        return this.getFlag("pl1e", "childId");
    }

    get isEnabled() {
        switch (this.type) {
            case "feature":
                return true;
            case "weapon":
                return this.system.isEquippedMain || this.system.isEquippedSecondary;
            case "wearable":
                return this.system.isEquipped;
            case "ability":
                return this.system.isMemorized;
            default:
                return false;
        }
    }

    /** @inheritDoc */
    async _preCreate(data, options, userId) {
        const updateData = {};
        if (data.img === undefined) {
            const img = CONFIG.PL1E.defaultIcons[data.type];
            if (img) updateData['img'] = img;
        }
        if (data.name.includes("New Item")) {
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (name) updateData['name'] = name;
        }

        await this.updateSource(updateData);
        await super._preCreate(data, options, userId);
    }

    /** @inheritDoc */
    async _preDelete(options, user) {
        // If the item is not embedded and is the last then update refs
        const documents = await Pl1eHelpers.getDocuments("Item", this._id);
        if (!this.isEmbedded && documents.length === 1) {
            // Remove item from items
            for (const item of await Pl1eHelpers.getDocuments("Item")) {
                if (item.system.refItems.includes(this._id))
                    await item.removeRefItem(this);
            }

            // Remove embedded from actors
            for (const actor of await Pl1eHelpers.getDocuments("Actor")) {
                for (const item of actor.items) {
                    if (item.sourceId !== this._id) continue;
                    await actor.removeItem(item);
                }
            }
        }

        return super._preDelete(options, user);
    }

    async _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        if (!this.isEmbedded) {
            // Auto reset actors items on update
            const enableAutoResetActorsItems = game.settings.get("pl1e", "enableAutoResetActorsItems");
            if (enableAutoResetActorsItems) await Pl1eSynchronizer.resetActorsItems(this);
        }
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    async prepareData() {
        super.prepareData();

    }

    /**
     * Add a new ref Item
     * @param item
     * @returns {Promise<void>}
     */
    async addRefItem(item) {
        if (this.isEmbedded)
            throw new Error("PL1E | Cannot add ref item on embedded " + this.name);

        // Return if item with same id exist
        if (this.system.refItems.some(id => id === item._id)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize("PL1E.ChildWithSameIdExist"));
            return;
        }

        // Return against recursive loop
        if (await Pl1eHelpers.createRecursiveLoop(this, item.id)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize("PL1E.WillCreateRecursiveLoop"));
            return;
        }

        // Add item as child id to this
        this.system.refItems.push(item._id);
        await this.update({
            "system.refItems": this.system.refItems
        });

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceId !== this._id) continue;
                await actor.addItem(item, actorItem.parentId);
            }
        }
    }

    /**
     * Remove a new ref Item
     * @param item
     * @returns {Promise<void>}
     */
    async removeRefItem(item) {
        if (this.isEmbedded)
            throw new Error("PL1E | Cannot remove ref item on embedded " + this.name);

        // Remove item as child id from this
        this.system.refItems.splice(this.system.refItems.indexOf(item._id), 1);
        await this.update({
            "system.refItems": this.system.refItems
        });

        // Update actors with this item to remove the related embedded items
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceId !== this._id) continue;
                const itemToRemove = actor.items.find(otherItem => otherItem.sourceId === item._id &&
                    otherItem.childId === actorItem.parentId)
                await actor.removeItem(itemToRemove);
            }
        }
    }

    /* -------------------------------------------- */
    /*  Item actions                                */
    /* -------------------------------------------- */

    /**
     * Toggle the item state (ability, weapon or wearable)
     * @param options
     * @returns {Promise<void>}
     */
    async toggle(options) {
        if (this.isEnabled) {
            for (const [id, aspect] of Object.entries(this.system.passiveAspects)) {
                if (!aspect.createEffect) continue;
                await Pl1eAspect.applyPassiveEffect(aspect, id, this.actor, this);
            }
        }
        else {
            for (const [id, aspect] of Object.entries(this.system.passiveAspects)) {
                await Pl1eAspect.removePassiveEffect(aspect, id, this.actor);
            }
        }
    }

    /** @type {CharacterData} */
    characterData;

    /**
     * Activate the item (ability or consumable)
     * @returns {Promise<boolean>}
     */
    async activate() {
        // Preparation of characterData
        this.characterData = await this._getCharacterData();
        if (!this._canActivate(this.characterData)) return false;
        if (!await this._preActivate(this.characterData)) return false;

        // Character rollData if exist
        if (this.characterData.attributes.characterRoll !== 'none') {
            this.characterData.rollData = await this.characterData.actor.rollSkill(this.characterData.attributes.characterRoll);
            this.characterData.result = this.characterData.rollData.total;
        }
        else {
            this.characterData.result = 1;
        }

        // Calculate attributes
        this.characterData.attributes = await this._calculateAttributes();

        // If we have a token then we can process further and apply the effects
        if (this.characterData.token) {
            // Target character if areaShape is self
            if (this.characterData.attributes.areaShape === "self") {
                this.characterData.token.setTarget(true, { user: game.user, releaseOthers: false, groupSelection: false });
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
            await Pl1eChat.actionRoll(this.characterData);

            // Apply the effect on the character
            await this._applyAttributes();

            // If the ability don't trigger reaction then apply immediately
            if (!this.characterData.attributes.triggerReactions)
                await this.resolve({action: "launch"});
        }
        // If we have a no token then we only apply attributes to the character
        else {
            // Display message
            await Pl1eChat.actionRoll(this.characterData);

            // Apply the effect on the character
            await this._applyAttributes();

            // If the ability trigger self then we can apply it without need of a token
            if (this.characterData.attributes.areaShape === "self")
                await this.resolve({action: "launch"});
        }

        await this._postActivate(this.characterData);
        return true;
    }

    /**
     * Resolve the item effect with an action (ability or consumable)
     * @param options
     * @returns {Promise<void>}
     */
    async resolve(options) {
        // Handle launch action
        if (options.action === "launch") await this._launch();

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

        // Empty ability data
        this.characterData = undefined;
    }

    /**
     * Override method before activation launched (returning false prevent activation)
     * @param characterData
     * @return {Promise<boolean>}
     * @protected
     */
    async _preActivate(characterData) {
        return true;
    }

    /**
     * Override method after activation launched
     * @param characterData
     * @return {Promise<void>}
     * @protected
     */
    async _postActivate(characterData) {}

    /**
     * Check if the item activation is valid
     * @param {CharacterData} characterData
     * @returns {boolean}
     * @protected
     */
    _canActivate(characterData) {
        const itemAttributes = characterData.attributes;

        if (characterData.token !== null && characterData.token.inCombat) {
            if (itemAttributes.activation === "action" && characterData.actor.system.misc.action < itemAttributes.actionCost) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
                return false;
            }
            if (itemAttributes.activation === "reaction" && characterData.actor.system.misc.reaction <= 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMoreReaction"));
                return false;
            }
        }
        return true;
    }

    /**
     * Get the characterData
     * @return {Promise<CharacterData>}
     * @private
     */
    async _getCharacterData() {
        const token = this.actor.bestToken;
        // If the token is null then the request come from a non-token sheet
        const actor = token ? token.actor : this.actor;

        return {
            actor: actor,
            actorId: actor._id,
            token: token,
            tokenId: token?.document._id,
            item: this,
            itemId: this._id,
            attributes: {...this.system.attributes},
            activeAspects: {...this.system.activeAspects},
            templates: []
        }
    }

    /**
     * Launch the item effects
     * @returns {Promise<void>}
     * @private
     */
    async _launch() {
        // Roll data for every targets
        /** @type {TargetData[]} */
        let targetsData = []

        // In case of self target
        if (this.characterData.attributes.areaShape === "self") {
            const targetData = await this._getTargetData(this.characterData.actor, this.characterData.token);
            targetsData.push(targetData);
        }
        else {
            // Populate targetsData
            for (let template of this.characterData.templates) {
                for (let token of template.getTargets()) {
                    const targetData = await this._getTargetData(token.actor, token);
                    targetsData.push(targetData);
                }
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
            await Pl1eChat.actionRoll(this.characterData, targetData);
        }
    }

    /**
     * Get the targetData from a token and its related actor
     * @param {Pl1eActor} actor
     * @param {Token | null} token
     * @return {Promise<TargetData>}
     * @private
     */
    async _getTargetData(actor, token = null) {
        const targetData = {};
        if (this.characterData.attributes.targetRoll.length > 0) {
            targetData.rollData = await actor.rollSkills(this.characterData.attributes.targetRoll);
            targetData.result = this.characterData.result - targetData.rollData.total;
        } else {
            targetData.result = this.characterData.result;
        }
        targetData.actor = actor;
        targetData.actorId = actor._id;
        targetData.token = token;
        targetData.tokenId = token?.document._id;
        return targetData;
    }

    /**
     * Calculate the attributes (also filter before display)
     * @returns {Promise<void>}
     * @private
     */
    _calculateAttributes() {
        // Calculate character attributes
        let calculatedAttributes = {};
        for (let [key, value] of Object.entries(this.characterData.attributes)) {
            let calculatedAttribute = value;
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig !== undefined) {
                if (attributeConfig.combatOnly && (!this.characterData.token || !this.characterData.token.inCombat)) continue;
                if (attributeConfig.type === "number") {
                    // Apply resolution type
                    if (this.characterData.attributes[`${key}ResolutionType`] !== undefined) {
                        const resolutionType = this.characterData.attributes[`${key}ResolutionType`];
                        if (resolutionType === "multiplyBySuccess") {
                            calculatedAttribute *= this.characterData.result > 0 ? this.characterData.result : 0;
                        }
                        if (resolutionType === "valueIfSuccess") {
                            calculatedAttribute = this.characterData.result > 0 ? calculatedAttribute : 0;
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

}
