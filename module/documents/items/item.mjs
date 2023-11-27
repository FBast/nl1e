import {Pl1eAspect} from "../../helpers/aspect.mjs";
import {Pl1eSynchronizer} from "../../helpers/synchronizer.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {ActionTemplate} from "../actionTemplate.mjs";
import {Pl1eChat} from "../../helpers/chat.mjs";

export class Pl1eItem extends Item {

    /**
     * The source id is related to the id of the original used to create this item
     * @return {string|*}
     */
    get sourceId() {
        const sourceId = this.getFlag("core", "sourceId")
        if (sourceId === undefined) return undefined;
        const sourceIdArray = sourceId.split(".");
        return sourceIdArray[sourceIdArray.length - 1];
    }

    /**
     * The parent id is shared by the child id of this item children
     * @return {string}
     */
    get parentId() {
        return this.getFlag("pl1e", "parentId");
    }

    /**
     * The parent item of this item (if currently in an actor)
     * @return {Pl1eItem|null}
     * */
    get parentItem() {
        return this.actor.items.find(otherItem => otherItem.parentId === this.childId) || null;
    }

    /**
     * The child id is shared by the parent id of this item parent
     * @return {string}
     */
    get childId() {
        return this.getFlag("pl1e", "childId");
    }

    /**
     * The children items of this item (if currently in an actor)
     * @return {Pl1eItem[]}
     * */
    get childItems() {
        return this.actor.items.filter(otherItem => otherItem.childId === this.parentId) || [];
    }

    get isEnabled() {
        switch (this.type) {
            case "weapon":
                if (this.system.attributes.hands > 0 || this.system.attributes.level > 0)
                    return this.system.isEquippedMain || this.system.isEquippedSecondary;
                return true;
            case "wearable":
                return this.system.isEquipped;
            case "ability":
                return this.system.isMemorized;
            default:
                return true;
        }
    }

    get realName() {
        return (this.system.customName && this.system.customName !== "") ? this.system.customName : this.name;
    }

    get realImg() {
        return this.system.customImg ? this.system.customImg : this.img;
    }

    get linkedParents() {
        const parentsItems = [];
        if (!this.actor || !this.sourceId) return parentsItems;
        for (/** @type {Pl1eItem} */ const parentItem of this.actor.items) {
            if (!parentItem.system.refItems.includes(this.sourceId)) continue;
            // Item parent is a module or a mastery
            if (["module", "mastery"].includes(parentItem.type)) {
                // Then push this module or mastery parents
                parentsItems.push(...parentItem.linkedParents);
            }
            else {
                parentsItems.push(parentItem);
            }
        }
        return parentsItems;
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
            scene: token.scene,
            sceneId: token.scene.id,
            item: this,
            itemId: this._id,
            attributes: {...this.system.attributes},
            activeAspects: {...await this.getCombinedActiveAspects()},
            templates: [],
            templatesIds: []
        }
    }

    /** @inheritDoc */
    static async create(docData, options = {}) {
        // Replace default image
        if (docData.img === undefined) {
            docData.img = `systems/pl1e/assets/icons/${docData.type}.svg`;
        }

        // Keep id if coming from compendium
        if (options.fromCompendium) options["keepId"] = true;

        const createdItem = await super.create(docData, options);

        // Remove the sourceId flag if not from compendium
        if (!options.fromCompendium && createdItem.sourceId) {
            await createdItem.unsetFlag("core", "sourceId");
        }

        return createdItem;
    }


    /** @inheritDoc */
    async _onDelete(options, userId) {
        // If the item is not embedded and is the last then update refs
        const documents = await Pl1eHelpers.getDocuments("Item", this._id);
        if (!this.isEmbedded && documents.length === 0) {
            // Remove item from items
            for (const item of await Pl1eHelpers.getDocuments("Item")) {
                if (item.system.refItems.includes(this._id))
                    await item.removeRefItem(this._id);
            }

            // Remove embedded from actors
            for (const actor of await Pl1eHelpers.getDocuments("Actor")) {
                for (const item of actor.items) {
                    if (item.sourceId !== this._id) continue;
                    await actor.removeItem(item);
                }
            }
        }

        super._onDelete(options, userId);
    }

    /** @inheritDoc */
    _preUpdate(changed, options, user) {
        if (!this.isEmbedded) {
            // Reset default values in case of changes
            if (changed.system?.attributes?.moduleType === "weapon") {
                changed["system.attributes.moduleSlot"] = [];
            }
            if (changed.system?.attributes?.moduleType === "shield") {
                changed["system.attributes.moduleSlot"] = [];
            }
            if (changed.system?.attributes?.activation === "action") {
                changed["system.attributes.reactionCost"] = 0;
            }
            if (changed.system?.attributes?.activation === "reaction") {
                changed["system.attributes.actionCost"] = 0;
                changed["system.attributes.isMajorAction"] = false;
            }
            if (changed.system?.attributes?.activation === "quickAction") {
                changed["system.attributes.reactionCost"] = 0;
                changed["system.attributes.actionCost"] = 0;
                changed["system.attributes.isMajorAction"] = false;
            }
            if (changed.system?.attributes?.roll?.length === 0)
                changed["system.attributes.oppositeRoll"] = [];
            if (changed.system?.attributes?.useParentRange === "none") {
                changed["system.attributes.isMajorAction"] = false;
                changed["system.attributes.usageCost"] = 0;
            }
            if (["target", "self"].includes(changed.system?.attributes?.areaShape))
                changed["system.attributes.excludeSelf"] = false;
            if (changed.system?.attributes?.areaShape === "self") {
                changed["system.attributes.areaNumber"] = 0;
                changed["system.attributes.includeSelf"] = true;
            }
        }

        return super._preUpdate(changed, options, user);
    }

    /** @inheritDoc */
    async _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        // If the item is an original
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
     * Get the items based on their refs
     * @return {Promise<Pl1eItem[]>}
     */
    async getSubItems() {
        const allRefs = [...this.system.refItems, ...this.system.localRefItems];
        const subItems = [];
        for (let id of allRefs) {
            const subItem = await Pl1eHelpers.getDocument("Item", id);
            if (subItem) subItems.push(subItem);
        }
        return subItems;
    }


    /**
     * Get all passive aspects including modules related
     * @return {Promise<Object[]>}
     */
    async getCombinedPassiveAspects() {
        const items = await this.getSubItems();
        const passiveAspectsFromModules = items
            .filter(item => item.type === "module")
            .flatMap(item => Object.values(item.system.passiveAspects));

        const allAspects = [...Object.values(this.system.passiveAspects), ...passiveAspectsFromModules];
        return Pl1eAspect.mergeAspectsObjects(allAspects);
    }

    /**
     * Get all active aspects including modules related
     * @return {Promise<Object[]>}
     */
    async getCombinedActiveAspects() {
        const items = await this.getSubItems();
        const activeAspectsFromModules = items
            .filter(item => item.type === "module")
            .flatMap(item => Object.values(item.system.activeAspects));

        const allAspects = [...Object.values(this.system.activeAspects), ...activeAspectsFromModules];
        return Pl1eAspect.mergeAspectsObjects(allAspects);
    }

    /**
     * Add an item ref
     * @param item
     * @returns {Promise<void>}
     */
    async addRefItem(item) {
        // This is embedded
        if (this.isEmbedded) {
            // Add item as child id to this
            this.system.localRefItems.push(item._id);
            await this.update({
                "system.localRefItems": this.system.localRefItems
            });
        }
        // This is original
        else {
            // Return if item with same id exist
            if (this.system.refItems.some(id => id === item._id) && !CONFIG.PL1E.itemTypes[this.type].stackable.includes(item.type)) {
                const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
                if (enableDebugUINotifications)
                    ui.notifications.warn(game.i18n.localize("PL1E.ChildWithSameIdExist"));
                return;
            }

            // Return against recursive loop
            if (await Pl1eHelpers.createRecursiveLoop(this, item)) {
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
        }
    }

    /**
     * Remove an item ref
     * @param {string} itemId
     * @returns {Promise<void>}
     */
    async removeRefItem(itemId) {
        // This is embedded
        if (this.isEmbedded) {
            // Remove item as child id from this
            const index = this.system.localRefItems.indexOf(itemId);
            if (index >= 0) {
                this.system.localRefItems.splice(index, 1);
                await this.update({
                    "system.localRefItems": this.system.localRefItems
                });
            }
        }
        // This is original
        else {
            // Remove item as child id from this
            const index = this.system.refItems.indexOf(itemId);
            if (index >= 0) {
                this.system.refItems.splice(index, 1);
                await this.update({
                    "system.refItems": this.system.refItems
                });
            }
        }
    }

    /* -------------------------------------------- */
    /*  Item actions                                */
    /* -------------------------------------------- */

    /**
     * Check if the reload is valid
     * @return {boolean}
     */
    canReload() {
        const token = this.actor.bestToken;

        if (token !== null && token.inCombat && token.id !== game.combat.current.tokenId) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
            return false;
        }
        if (token !== null && this.actor.system.general.action <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            return false;
        }
        return true;
    }

    /**
     * Reload an item uses (consumable)
     * @param options
     * @return {Promise<void>}
     */
    async reload(options = {}) {
        // Reload the item
        await this.update({
            ["system.removedUses"]: 0
        });
        // Remove the action
        await this.actor.update({
            ["system.general.action"]: this.actor.system.general.action - 1
        });
        await Pl1eChat.actionMessage(this.actor, "PL1E.Reload", 1, { item: this });
    }

    /**
     * Check if the toggle is valid
     * @return {boolean}
     */
    canToggle() {
        if (this.actor.statuses.has("paralysis")) {
            ui.notifications.warn(game.i18n.localize("PL1E.YouAreParalysed"));
            return false;
        }
        return true;
    }

    /**
     * Toggle the item state (ability, weapon or wearable)
     * @param options
     * @returns {Promise<void>}
     */
    async toggle(options = {}) {
        if (this.isEnabled) {
            for (const [id, aspect] of Object.entries(await this.getCombinedPassiveAspects())) {
                if (!aspect.createEffect) continue;
                await Pl1eAspect.applyPassiveEffect(aspect, id, this.actor, this);
            }
        }
        else {
            for (const [id, aspect] of Object.entries(await this.getCombinedPassiveAspects())) {
                await Pl1eAspect.removePassiveEffect(aspect, id, this.actor);
            }
        }
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
     * Activate the item (ability or consumable)
     * @returns {Promise<boolean>}
     */
    async activate() {
        // Preparation of characterData
        const characterData = await this._getCharacterData();
        if (!this._canActivate(characterData)) return false;
        if (!await this._preActivate(characterData)) return false;

        // Character rollData if exist
        if (characterData.attributes.roll.length > 0) {
            characterData.rollData = await characterData.actor.rollSkills(characterData.attributes.roll);
            characterData.result = characterData.rollData.total;
        }
        else {
            characterData.result = 1;
        }

        // Calculate attributes
        characterData.attributes = await this._calculateAttributes(characterData);

        let chatMessage = null;
        // If we have a token then we can process further and apply the effects
        if (characterData.token) {
            // If shape is target and range equal to 0 then self effect don't need template
            if (characterData.attributes.areaShape !== "target" || characterData.attributes.range !== 0) {
                // Minimize the actor sheet to facilitate templates creation
                await characterData.actor.sheet?.minimize();

                // Create templates
                for (let i = 0; i < characterData.attributes.areaNumber; i++) {
                    const templatePreview = await ActionTemplate.fromItem(characterData.item, characterData.attributes, characterData.activeAspects);
                    const template = await templatePreview?.drawPreview();

                    // If we have no template then break
                    if (!template) break;

                    characterData.templates.push(template);
                    characterData.templatesIds.push(template.id);
                }

                // Maximize the actor sheet
                await characterData.actor.sheet?.maximize();

                // Abort if no templates defined
                if (characterData.templates.length === 0) return false;
            }

            // Find activationMacro (pass for activation)
            const macroId = characterData.attributes.activationMacro;
            const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
            const activationMacro = await Pl1eHelpers.getDocument("Macro", macroId);

            // Execute activationMacro
            if (enableVFXAndSFX && activationMacro !== undefined) activationMacro.execute({
                characterData: characterData,
                active: true
            });

            // Display message
            chatMessage = await Pl1eChat.actionRoll(characterData);

            // Apply the effect on the character
            await this._applyAttributes(characterData);

            // Add the data to the message
            await chatMessage.setFlag("pl1e", "characterData", Pl1eHelpers.stringifyWithCircular(characterData));

            // Show the footer by setting its display property to "block"
            const $content = $(chatMessage.content);
            const footer = $content.find(".card-buttons");
            footer.addClass("show-footer");

            // Update the chat message with the modified content
            await chatMessage.update({
                content: $content[0].outerHTML
            });
        }
        // If we have no token
        else {
            // Display message
            await Pl1eChat.actionRoll(characterData);

            // Apply the effect on the character
            await this._applyAttributes(characterData);

            // In case of self area shape
            if (characterData.attributes.areaShape === "self") {
                await this.resolve(characterData, {
                    action: "launch"
                });
            }
        }

        await this._postActivate(characterData);
        return true;
    }

    /**
     * Check if the item activation is valid
     * @param {CharacterData} characterData
     * @returns {boolean}
     * @protected
     */
    _canActivate(characterData) {
        const itemAttributes = characterData.attributes;

        if (itemAttributes.activation === "action") {
            if (characterData.token.inCombat && characterData.tokenId !== game.combat.current.tokenId) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
                return false;
            }
            if (characterData.actor.system.general.action < itemAttributes.actionCost) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
                return false;
            }
        }
        else if (itemAttributes.activation === "reaction" && characterData.actor.system.misc.reaction <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreReaction"));
            return false;
        }
        else if (itemAttributes.activation === "quickAction" && characterData.actor.system.misc.quickAction <= 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreQuickAction"));
            return false;
        }
        return true;
    }

    /**
     * Calculate the attributes (also filter before display)
     * @param {CharacterData} characterData
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
                if (attributeConfig.combatOnly && (!characterData.token || !characterData.token.inCombat)) continue;
                if (attributeConfig.type === "number") {
                    // Apply resolution type
                    if (characterData.attributes[`${key}ResolutionType`] !== undefined) {
                        const resolutionType = characterData.attributes[`${key}ResolutionType`];
                        if (resolutionType === "multipliedBySuccess") {
                            calculatedAttribute *= characterData.result > 0 ? characterData.result : 0;
                        }
                        if (resolutionType === "ifSuccess") {
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
     * @param {CharacterData} characterData
     * @returns {Promise<void>}
     * @private
     */
    async _applyAttributes(characterData) {
        for (const [key, value] of Object.entries(characterData.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig?.data === undefined || value === 0) continue;

            // Retrieve document for attribute modification
            let document = undefined;
            switch (attributeConfig.document) {
                case "actor":
                    document = characterData.actor;
                    break;
                case "linkedItem":
                    document = characterData.linkedItem;
                    break;
                default:
                    throw new Error("PL1E | unknown document type : " + attributeConfig.document);
            }

            // If document not found then continue
            if (document === undefined) continue;

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
     * Override method after activation launched
     * @param characterData
     * @return {Promise<void>}
     * @protected
     */
    async _postActivate(characterData) {}

    /**
     * Resolve the item effect with an action (ability or consumable)
     * @param {CharacterData} characterData
     * @param options
     * @returns {Promise<void>}
     */
    async resolve(characterData, options) {
        // Handle launch action
        if (options.action === "launch") await this.launch(characterData);
        if (options.action === "cancel") return;

        // Find activationMacro (pass for deactivation)
        const macroId = characterData.item.system.attributes.activationMacro;
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const activationMacro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute activationMacro
        if (enableVFXAndSFX && activationMacro !== undefined) activationMacro.execute({
            characterData: characterData,
            active: false
        });

        // Destroy templates after fetching target with df-template
        for (const template of characterData.templates) {
            await template.delete();
        }

        // Release all targets
        for (let token of game.user.targets) {
            token.setTarget(false, {user: game.user, releaseOthers: false, groupSelection: false});
        }
    }

    /**
     * Launch the item effects
     * @param {CharacterData} characterData
     * @returns {Promise<void>}
     */
    async launch(characterData) {
        // Roll data for every targets
        /** @type {TargetData[]} */
        let targetsData = []

        // Reconstruct templates based on actionData flag
        for (const template of characterData.templates) {
            const actionData = template.getFlag("pl1e", "actionData");
            actionData.token = await Pl1eHelpers.getDocument("Token", actionData.tokenId, {
                scene: await Pl1eHelpers.getDocument("Scene", actionData.sceneId)
            });
            actionData.item = await actionData.token.actor.items.get(actionData.itemId);
            template.actionData = actionData;
        }

        // In case of include self
        if (characterData.attributes.includeSelf) {
            const targetData = await this._getTargetData(characterData, characterData.actor, characterData.token);
            targetsData.push(targetData);
        }
        if (characterData.attributes.areaShape !== "none") {
            // Populate targetsData
            for (let template of characterData.templates) {
                for (let token of ActionTemplate.getTemplateTargets(template)) {
                    const targetData = await this._getTargetData(characterData, token.actor, token, template);
                    targetsData.push(targetData);
                }
            }
        }

        // Find pre-launch macro
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const preLaunchMacroId = characterData.attributes.preLaunchMacro;
        const preLaunchMacro = await Pl1eHelpers.getDocument("Macro", preLaunchMacroId);

        // Execute pre-launch macro
        if (enableVFXAndSFX && preLaunchMacro !== undefined) await preLaunchMacro.execute({
            characterData: characterData,
            targetsData: targetsData
        });

        // Apply aspects, here we calculate each aspect for all targets
        for (let [id, aspect] of Object.entries(characterData.activeAspects)) {
            targetsData = await Pl1eAspect.applyActive(aspect, characterData, targetsData);
        }

        // Find post-launch macro
        const postLaunchMacroId = characterData.attributes.postLaunchMacro;
        const postLaunchMacro = await Pl1eHelpers.getDocument("Macro", postLaunchMacroId);

        // Execute post-launch macro
        if (enableVFXAndSFX && postLaunchMacro !== undefined) await postLaunchMacro.execute({
            characterData: characterData,
            targetsData: targetsData
        });

        // Display messages
        for (const targetData of targetsData) {
            await Pl1eChat.actionRoll(characterData, targetData);
        }
    }

    /**
     * Get the targetData from a token and its related actor
     * @param {CharacterData} characterData
     * @param {Pl1eActor} actor
     * @param {Token | null} token
     * @param {ActionTemplate} template
     * @return {Promise<TargetData>}
     * @private
     */
    async _getTargetData(characterData, actor, token = null, template = null) {
        const targetData = {};
        if (characterData.attributes.oppositeRoll.length > 0) {
            targetData.rollData = await actor.rollSkills(characterData.attributes.oppositeRoll);
            targetData.result = characterData.result - targetData.rollData.total;
        } else {
            targetData.result = characterData.result;
        }
        targetData.actor = actor;
        targetData.actorId = actor._id;
        targetData.scene = token.scene;
        targetData.sceneId = token.scene.id;
        targetData.token = token;
        targetData.tokenId = token?.id;
        targetData.template = template;
        return targetData;
    }

}
