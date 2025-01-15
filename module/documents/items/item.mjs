import {Pl1eAspect} from "../../helpers/aspect.mjs";
import {Pl1eSynchronizer} from "../../helpers/synchronizer.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {Pl1eChatMessage} from "../chatMessage.mjs";
import {Pl1eMeasuredTemplateDocument} from "../measuredTemplateDocument.mjs";
import {Pl1eEffect} from "../effect.mjs";
import {Pl1eTemplate} from "../../helpers/template.mjs";

export class Pl1eItem extends Item {

    /**
     * The source id is related to the id of the original used to create this item
     * @return {string|*}
     */
    get sourceId() {
        // const deprecatedSourceId = this.getFlag("core", "sourceId");
        // if (deprecatedSourceId) {
        //     this.setFlag("pl1e", "sourceId", deprecatedSourceId);
        //     return deprecatedSourceId;
        // }
        return this.getFlag("pl1e", "sourceId");

        // V12 Method to get the source id
        //TODO probleme ici le compendiumSource est souvent null
        //Question ? pourquoi je me prend la tete à récupérer le source id alors que l'id est le même que le compendium...
        // const compendiumSource = this._stats?.compendiumSource;
        // if (compendiumSource) {
        //     const sourceIdArray = compendiumSource.split(".");
        //     return sourceIdArray[sourceIdArray.length - 1];
        // }
        //
        // Deprecated since V12
        // const deprecatedSourceId = this.getFlag("core", "sourceId");
        // if (deprecatedSourceId !== undefined) {
        //     const sourceIdArray = deprecatedSourceId.split(".");
        //     return sourceIdArray[sourceIdArray.length - 1];
        // }
        //
        // return undefined;
    }

    /**
     * The parent id is shared by the child id of this item children
     * @return {string}
     */
    get parentId() {
        return this.getFlag("pl1e", "parentId");
    }

    /**
     * The child id is shared by the parent id of this item parent
     * @return {string}
     */
    get childId() {
        return this.getFlag("pl1e", "childId");
    }

    get behavior() {
        return this.getFlag("pl1e", "behavior");
    }

    /**
     * Check if the item is equipped
     * @return {boolean}
     */
    get isEquipped() {
        // Recursive check on parents
        return this.parentItem ? this.parentItem.isEquipped : true;
    }

    /**
     * Check if the actor level is enough
     * @return {boolean}
     */
    get isUsableAtLevel() {
        // Recursive check on parents
        return this.parentItem ? this.parentItem.isUsableAtLevel : true;
    }

    /**
     * Check if the item need to be reloaded
     * @return {*|boolean}
     */
    get isReloaded() {
        // Recursive check on parents
        return this.parentItem ? this.parentItem.isReloaded : true;
    }

    /**
     * Check if the item major action as been used
     * @return {*|boolean}
     */
    get isMajorActionAvailable() {
        // If this is a key or a container, it cannot be used for a major action
        if (this.behavior === "key" && this.behavior === "container") return false;

        // If the major action as been used
        if (this.system.majorActionUsed) return false;

        // Recursive check on parents
        return this.parentItem ? this.parentItem.isMajorActionAvailable : true;
    }

    /**
     * Check if the item action can be spent
     * @return {boolean}
     */
    get isActionAvailable() {
        return !(this.system.attributes.activation === "action"
            && this.actor.system.general.action < this.system.attributes.actionCost);
    }

    /**
     * Check if the item reaction can be spent
     * @return {boolean}
     */
    get isReactionAvailable() {
        return !(this.system.attributes.activation === "reaction"
            && this.actor.system.general.reaction < this.system.attributes.reactionCost);
    }

    /**
     * Check if the item quick action can be spent
     * @return {boolean}
     */
    get isQuickActionAvailable() {
        return !(this.system.attributes.activation === "quickAction"
            && this.actor.system.general.quickAction < this.system.attributes.quickActionCost);
    }

    /**
     * Check if the item should be displayed
     * @return {boolean}
     */
    get isDisplayed() {
        // If this is a key, it is not display if container found
        if (this.behavior === "key" && this.sameItems.some(item => item.behavior === "container")) return false;

        // If this item is a container, it is not display if no key found
        if (this.behavior === "container" && !this.sameItems.some(item => item.behavior === "key")) return false;

        // Recursive check on parents
        return this.parentItem ? this.parentItem.isDisplayed : true;
    }

    /**
     * Check if the item is effective
     * @return {boolean}
     */
    get isEnabled() {
        // If this is a key, it is never enabled
        if (this.behavior === "key") return false;

        // If this is a container, then search for a key
        if (this.behavior === "container" && !this.sameItems.some(item => item.behavior === "key")) return false;

        // Recursive check on parents
        return this.parentItem ? this.parentItem.isEnabled : true;
    }

    /**
     * Get warning about the item
     * @return {*[]}
     */
    get warnings() {
        const warnings = [];

        if (!this.isUsableAtLevel) warnings.push("PL1E.NotUsableAtYourLevel");
        if (!this.isActionAvailable) warnings.push("PL1E.NoMoreAction");
        if (!this.isReactionAvailable) warnings.push("PL1E.NoMoreReaction");
        if (!this.isQuickActionAvailable) warnings.push("PL1E.NoMoreQuickAction");

        return warnings;
    }

    /**
     * The custom name of the item if none the name
     * @return {string}
     */
    get realName() {
        return (this.system.customName && this.system.customName !== "") ? this.system.customName : this.name;
    }

    /**
     * The custom img of the item if none the img
     * @return {string}
     */
    get realImg() {
        return this.system.customImg ? this.system.customImg : this.img;
    }

    /**
     * Recursively get all child items.
     * @return {Pl1eItem[]}
     */
    get recursiveChildItems() {
        const getChildItems = (item) => {
            // Start with direct child items
            let allChildren = [...item.childItems];

            // Get the children of each child recursively
            for (const childItem of item.childItems) {
                allChildren = allChildren.concat(getChildItems(childItem));
            }

            return allChildren;
        };

        // Initialize the recursive gathering with this item
        return getChildItems(this);
    }

    /**
     * All items in the actor sharing the same source id
     * @return {Pl1eItem[]}
     */
    get sameItems() {
        if (!this.actor)
            throw new Error("PL1E | sameItems should not be used on an item with no associated actor");

        return this.actor.items.filter(otherItem => otherItem.sourceId === this.sourceId) || [];
    }

    /**
     * The children items of this item within its actor
     * @return {Pl1eItem[]}
     * */
    get childItems() {
        if (!this.actor)
            throw new Error("PL1E | childItems should not be used on an item with no associated actor");

        return this.actor.items.filter(otherItem => otherItem.childId === this.parentId) || [];
    }

    /**
     * The parent item of this item within its actor
     * @return {Pl1eItem|null}
     * */
    get parentItem() {
        if (!this.actor)
            throw new Error("PL1E | parentItem should not be used on an item with no associated actor");

        return this.actor.items.find(otherItem => otherItem.parentId === this.childId) || null;
    }

    /**
     * The root parent item (the highest ancestor) of this item within its actor.
     * @return {Pl1eItem|null}
     */
    get rootParentItem() {
        let parent = this.parentItem;
        while (parent && parent.parentItem) {
            parent = parent.parentItem;
        }
        return parent;
    }

    get linkableParentItem() {
        const parentItem = this.parentItem;
        // Return null if no parent
        if (!parentItem) return null;
        // Return null if parent not enabled
        if (!parentItem.isEnabled) return null;
        // Return null if parent is a key and only unlock this item
        if (parentItem.behavior === "key") return null;
        // Jump to next parent if container behavior
        if (parentItem.behavior === "container") return parentItem.linkableParentItem;
        // Return parent in the last case
        return parentItem;
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
            tokenId: token?._id,
            scene: token?.parent,
            sceneId: token?.parent.id,
            item: this,
            itemId: this._id,
            userId : game.userId,
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
            docData.img = `systems/pl1e/assets/svg/${docData.type}.svg`;
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

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
    }

    /** @inheritDoc */
    async _onDelete(options, userId) {
        // If the item is not embedded and is the last then update refs
        const documents = await Pl1eHelpers.getDocuments("Item", this.type, this._id);
        if (!this.isEmbedded && documents.length === 0) {
            // Remove item from items
            for (const item of await Pl1eHelpers.getDocuments("Item")) {
                // Check for ref item with the same id
                for (const [instanceId, refItem] of Object.entries(item.system.refItems)) {
                    if (refItem.itemId !== this._id) continue;
                    // Remove using instance id
                    await item.removeRefItem(instanceId);
                }
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
            const currentAttributes = this.system.attributes;
            const changedAttributes = changed.system?.attributes || {};

            // Generic handlers for default values
            const defaultsHandlers = {
                activation: {
                    passive: {
                        actionCost: 0,
                        reactionCost: 0,
                        quickActionCost: 0,
                        isMajorAction: false,
                        isDangerous: false,
                        areaShape: "none",
                        launchParentActiveAspects: false,
                        weaponMode: "none",
                        roll: [],
                        healthCost: 0,
                        staminaCost: 0,
                        manaCost: 0,
                        usageCost: 0,
                        meleeActivationMacro: "",
                        rangeActivationMacro: "",
                        magicActivationMacro: "",
                        meleePreLaunchMacro: "",
                        rangePreLaunchMacro: "",
                        magicPreLaunchMacro: "",
                        meleePostLaunchMacro: "",
                        rangePostLaunchMacro: "",
                        magicPostLaunchMacro: "",
                        activeAspects: null,
                        passiveAspects: null,
                    },
                    action: {
                        actionCost: 1,
                        reactionCost: 0,
                        quickActionCost: 0,
                    },
                    reaction: {
                        actionCost: 0,
                        reactionCost: 1,
                        quickActionCost: 0,
                        isMajorAction: false,
                        isDangerous: false,
                    },
                    quickAction: {
                        actionCost: 0,
                        reactionCost: 0,
                        quickActionCost: 1,
                        isMajorAction: false,
                        isDangerous: false,
                    },
                    outOfCombat: {
                        actionCost: 0,
                        reactionCost: 0,
                        quickActionCost: 0,
                        isMajorAction: false,
                        isDangerous: false,
                    },
                },
                areaShape: {
                    none: {
                        range: 0,
                        areaNumber: 0,
                        circleRadius: 0,
                        coneLength: 0,
                        coneAngle: 0,
                        rayLength: 0,
                    },
                    target: {
                        circleRadius: 0,
                        coneLength: 0,
                        coneAngle: 0,
                        rayLength: 0,
                    },
                    circle: {
                        coneLength: 0,
                        coneAngle: 0,
                        rayLength: 0,
                    },
                    cone: {
                        circleRadius: 0,
                        rayLength: 0,
                    },
                    square: {
                        circleRadius: 0,
                        coneLength: 0,
                        coneAngle: 0,
                        rayLength: 0,
                    },
                    ray: {
                        circleRadius: 0,
                        coneLength: 0,
                        coneAngle: 0,
                    },
                },
                weaponMode: {
                    none: {
                        useParentRange: false,
                        useParentRoll: false,
                        useParentOppositeRoll: false,
                        useParentActivationMacro: false,
                        useParentPreLaunchMacro: false,
                        useParentPostLaunchMacro: false,
                    },
                },
                roll: {
                    empty: {
                        rollAdvantages: 0,
                        oppositeRoll: [],
                    },
                },
                oppositeRoll: {
                    empty: {
                        oppositeRollAdvantages: 0,
                    },
                },
            };

            // Apply handlers dynamically
            for (const [key, handler] of Object.entries(defaultsHandlers)) {
                const value = changedAttributes[key];

                if (Array.isArray(value) && value.length === 0 && handler.empty) {
                    Object.assign(changedAttributes, handler.empty);
                } else if (handler[value]) {
                    Object.assign(changedAttributes, handler[value]);
                }
            }
        }

        return super._preUpdate(changed, options, user);
    }

    /** @inheritDoc */
    async _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        // If the item is an original
        if (!this.isEmbedded && game.user.isGM) {
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
     * Get the items based on their refs with all data
     * @return {Promise<RefItem[]>}
     */
    async getRefItems() {
        const refItems = [];
        for (let [instanceId, refItem] of Object.entries(this.system.refItems)) {
            refItems.push({
                itemId: refItem.itemId,
                behavior: refItem.behavior,
                synchronized: refItem.synchronized,
                instanceId: instanceId,
                item: await Pl1eHelpers.getDocument("Item", refItem.itemId)
            });
        }
        return refItems;
    }

    /**
     * Get all passive aspects including modules related
     * @return {Promise<Object[]>}
     */
    async getCombinedPassiveAspects() {
        const refItems = await this.getRefItems();

        let passiveAspectsFromModules = {};
        for (const refItem of refItems) {
            if (refItem.item && refItem.item.type === "module") {
                for (const [key, aspect] of Object.entries(refItem.item.system.passiveAspects)) {
                    // In case key is already their then merge
                    if (passiveAspectsFromModules[key]) {
                        passiveAspectsFromModules[key].value += aspect.value;
                    }
                    // Else then add a copy of the aspect
                    else {
                        passiveAspectsFromModules[key] = { ...aspect };
                    }
                }
            }
        }

        const allAspects = {...this.system.passiveAspects, ...passiveAspectsFromModules};
        return Pl1eAspect.mergeAspectsObjects(allAspects);
    }

    /**
     * Get all active aspects including modules related
     * @return {Promise<Object[]>}
     */
    async getCombinedActiveAspects() {
        const refItems = await this.getRefItems();

        let activeAspectsFromModules = {};
        refItems.forEach(refItem => {
            if (refItem.item && refItem.item.type === "module") {
                Object.assign(activeAspectsFromModules, refItem.item.system.activeAspects);
            }
        });

        const allAspects = {...this.system.activeAspects, ...activeAspectsFromModules};
        return Pl1eAspect.mergeAspectsObjects(allAspects);
    }

    /**
     * Check if the item is valid for a given actor
     * @param actor
     * @return {boolean}
     */
    isValidForActor(actor) {
        if (actor.type !== "merchant") {
            // Only one race
            if (this.type === "race" && actor.items.find(item => item.type === "race")) {
                ui.notifications.info(game.i18n.localize("PL1E.OnlyOneRace"));
                return false;
            }

            // Only one culture
            if (this.type === "culture" && actor.items.find(item => item.type === "culture")) {
                ui.notifications.info(game.i18n.localize("PL1E.OnlyOneCulture"));
                return false;
            }

            // Only one body class
            if (this.type === "class" && this.system.attributes.classType === "body" &&
                actor.items.find(item => item.type === "class" && item.system.attributes.classType === "body")) {
                ui.notifications.info(game.i18n.localize("PL1E.OnlyOneBodyClass"));
                return false;
            }

            // Only one mind class
            if (this.type === "class" && this.system.attributes.classType === "mind" &&
                actor.items.find(item => item.type === "class" && item.system.attributes.classType === "mind")) {
                ui.notifications.info(game.i18n.localize("PL1E.OnlyOneMindClass"));
                return false;
            }

            // Check if the feature already exists
            if (this.type === "feature" && actor.items.find(item => item.sourceId === this.id)) {
                ui.notifications.info(game.i18n.localize("PL1E.YouAlreadyHaveThisFeature"));
                return false;
            }
        }

        return true;
    }

    /**
     * Add an item ref
     * @param item
     * @returns {Promise<void>}
     */
    async addRefItem(item) {
        // Return against recursive loop
        if (await Pl1eHelpers.createRecursiveLoop(this, item)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize("PL1E.WillCreateRecursiveLoop"));
            return;
        }

        // Return if item with same id exist
        const stackable = Pl1eHelpers.getConfig("itemTypes", this.type, "stackable");
        if (!stackable.includes(item.type) && Object.values(this.system.refItems).some(id => id === item._id)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize("PL1E.ChildWithSameIdExist"));
            return;
        }

        // Add item ref item
        this.system.refItems = {};
        this.system.refItems[foundry.utils.randomID()] = {
            itemId: item.id,
            behavior: "regular",
            synchronized: !this.isEmbedded
        };
        await this.update({
            "system.refItems": this.system.refItems,
        });
    }

    /**
     * Remove an item ref
     * @param {string} instanceId
     * @returns {Promise<void>}
     */
    async removeRefItem(instanceId) {
        if (instanceId in this.system.refItems) {
            await this.update({
                [`system.refItems.-=${instanceId}`]: null
            });
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
        const inCombat = token && token.inCombat;
        const isCurrentTurn = game.combat && game.combat.current.tokenId === token.id;

        if (inCombat) {
            if (!isCurrentTurn) {
                ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
                return false;
            }
            if (this.actor.system.general.action < this.system.attributes.actionCost) {
                ui.notifications.info(game.i18n.localize("PL1E.NoMoreAction"));
                return false;
            }
        }

        return true;
    }

    /**
     * Reload an item uses
     * @param options
     * @return {Promise<void>}
     */
    async reload(options = {}) {
        const token = this.actor.bestToken;
        const inCombat = token && token.inCombat;

        if (inCombat) {
            // Remove the action
            await this.actor.update({
                ["system.general.action"]: this.actor.system.general.action - 1
            });

            await Pl1eChatMessage.actionMessage(this.actor, "PL1E.Reload", 1, { item: this });
        }
        else {
            await Pl1eChatMessage.actionMessage(this.actor, "PL1E.Reload", 0, { item: this });
        }

        // Reload the item
        await this.update({
            ["system.removedUses"]: 0
        });
    }

    /**
     * Check if the toggle is valid
     * @return {boolean}
     */
    canToggle() {
        if (this.actor.statuses.has("paralysis")) {
            ui.notifications.info(game.i18n.localize("PL1E.YouAreParalysed"));
            return false;
        }
        return true;
    }

    /**
     * Toggle the item state
     * @param options
     * @returns {Promise<void>}
     */
    async toggle(options = {}) {
        if (this.isEnabled) {
            for (const [id, aspect] of Object.entries(await this.getCombinedPassiveAspects())) {
                if (!aspect.createEffect) continue;
                await Pl1eEffect.applyPassiveEffect(aspect, id, this.actor, this);
            }
        }
        else {
            for (const [id, aspect] of Object.entries(await this.getCombinedPassiveAspects())) {
                await Pl1eEffect.removePassiveEffect(aspect, id, this.actor);
            }
        }
    }

    /**
     * Favorite the item
     * @returns {Promise<void>}
     */
    async favorite() {
        await this.update({
            "system.isFavorite": !this.system.isFavorite
        });
    }

    /**
     * Activate the item
     */
    async activate() {
        // Preparation of characterData
        const characterData = await this._getCharacterData();

        // Activation validation
        if (!await this._canActivate(characterData)) return false;

        // Linking item
        await this._linkItem(characterData);

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
        // If we have a token, then we can process further and apply the effects
        if (characterData.token) {
            // If shape is target and range equal to 0, then self-effect doesn't need a template
            if (characterData.attributes.areaShape !== "none" || characterData.attributes.range !== 0) {
                // Minimize the actor sheet to facilitate template creation
                const isActorSheetRendered = characterData.actor.sheet?.rendered;
                if (isActorSheetRendered) characterData.actor.sheet?.minimize();

                // Save the currently selected tokens
                const selectedTokens = canvas.tokens.controlled;

                // Create templates
                for (let i = 0; i < characterData.attributes.areaNumber; i++) {
                    const placedTemplateDocument = await Pl1eMeasuredTemplateDocument.fromItem(
                        characterData.item,
                        characterData.token,
                        characterData.attributes,
                        characterData.activeAspects
                    );

                    // Save primary and secondary positions for macros
                    placedTemplateDocument.primaryPosition = Pl1eTemplate.getPrimaryPosition(placedTemplateDocument);
                    placedTemplateDocument.secondaryPosition = Pl1eTemplate.getSecondaryPosition(placedTemplateDocument);

                    // Add the placed template document to characterData
                    characterData.templates.push(placedTemplateDocument);
                    characterData.templatesIds.push(placedTemplateDocument.id);
                }

                // Restore the selection of the user
                selectedTokens.forEach(token => token.control({ releaseOthers: false }));

                // Maximize the actor sheet
                if (isActorSheetRendered) characterData.actor.sheet?.maximize();

                // Abort if no templates defined
                if (characterData.templates.length === 0) return;
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
            chatMessage = await Pl1eChatMessage.launcherRoll(characterData);

            // Apply the effect on the character
            await this._applyAttributes(characterData);

            // Add the data to the message
            await chatMessage.setFlag("pl1e", "characterData", Pl1eHelpers.stringifyWithCircular(characterData));

            // If the roll is a total failure, then resolve immediately
            if (characterData.result === 0) {
                await this.resolve(characterData, {
                    action: "launch"
                });
            }
        }
        // If we have no token and there is no area shape
        else if (characterData.attributes.areaShape === "none") {
            // Disable chat confirmation buttons
            characterData.noConfirmation = true;

            // Display message
            await Pl1eChatMessage.launcherRoll(characterData);

            // Apply the effect on the character
            await this._applyAttributes(characterData);

            // Resolve immediately
            await this.resolve(characterData, {
                action: "launch"
            });
        }
        // Else we need a token to proceed
        else {
            ui.notifications.info(game.i18n.localize("PL1E.NeedAToken"));
            return;
        }

        //TODO This is a hack to prevent item with no uses to have removed uses
        // If the linked item has no usage limit, then reset it's removedUses
        if (characterData.linkedItem && characterData.linkedItem.system.attributes.uses === 0) {
            await characterData.linkedItem.update({
                "system.removedUses": 0
            })
        }
    }

    /**
     * Check if the item activation is valid
     * @param {CharacterData} characterData
     * @returns {Promise<boolean>}
     * @protected
     */
    async _canActivate(characterData) {
        const { attributes: itemAttributes, token, actor } = characterData;
        const inCombat = token && token.inCombat;
        const isCurrentTurn = game.combat && game.combat.current.tokenId === characterData.tokenId;
        const { action, reaction, quickAction } = actor.system.general;

        // In combat checks
        if (inCombat) {
            switch (itemAttributes.activation) {
                case "action":
                    if (!isCurrentTurn) {
                        ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
                        return false;
                    }
                    if (action < itemAttributes.actionCost) {
                        ui.notifications.info(game.i18n.localize("PL1E.NoMoreAction"));
                        return false;
                    }
                    break;
                case "reaction":
                    if (reaction <= 0) {
                        ui.notifications.info(game.i18n.localize("PL1E.NoMoreReaction"));
                        return false;
                    }
                    break;
                case "quickAction":
                    if (!isCurrentTurn) {
                        ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
                        return false;
                    }
                    if (quickAction <= 0) {
                        ui.notifications.info(game.i18n.localize("PL1E.NoMoreQuickAction"));
                        return false;
                    }
                    break;
                case "outOfCombat":
                    ui.notifications.info(game.i18n.localize("PL1E.OutOfCombatOnly"));
                    return false;
            }
        }

        return true;
    }

    /**
     * Override method to link item
     * @param characterData
     * @protected
     */
    async _linkItem(characterData) {}

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
            const attributeConfig = Pl1eHelpers.getConfig("attributes", key);
            if (attributeConfig !== undefined) {
                if (attributeConfig.combatOnly && (!characterData.token || !characterData.token.inCombat)) continue;
                if (attributeConfig.type === "number") {
                    // Apply resolution type
                    if (characterData.attributes[`${key}ResolutionType`] !== undefined) {
                        const resolutionType = characterData.attributes[`${key}ResolutionType`];
                        calculatedAttribute = Pl1eHelpers.applyResolution(calculatedAttribute, characterData.result, resolutionType);
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
            const attributeConfig = Pl1eHelpers.getConfig("attributes", key);
            if (attributeConfig?.data === undefined || value === 0) continue;

            // Retrieve document for attribute modification
            let document = undefined;
            switch (attributeConfig.document) {
                case "actor":
                    document = characterData.actor;
                    break;
                case "item":
                    document = characterData.item;
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
            const attributeDataConfig = Pl1eHelpers.getConfig(attributeConfig.dataGroup, attributeConfig.data);
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
     * Resolve the item effect with an action (ability or consumable)
     * @param {CharacterData} characterData
     * @param options
     * @returns {Promise<void>}
     */
    async resolve(characterData, options) {
        // Handle launch action
        if (options.action === "launch") await this.launch(characterData);

        // Find activationMacro (pass for deactivation)
        const macroId = characterData.attributes.activationMacro;
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const activationMacro = await Pl1eHelpers.getDocument("Macro", macroId);

        // Execute activationMacro
        if (enableVFXAndSFX && activationMacro !== undefined && characterData.token) {
            activationMacro.execute({
                characterData: characterData,
                active: false
            });
        }

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
        // Roll data for every target
        /** @type {TargetData[]} */
        let targetsData = [];

        if (characterData.attributes.areaShape !== "none") {
            // Populate targetsData
            for (let template of characterData.templates) {
                const tokens = Pl1eHelpers.tokensWithinTemplate(template);
                for (let token of tokens) {
                    // Get the target data and push it to the targetsData array
                    const targetData = await this._getTargetData(characterData, token.actor, token, template);
                    targetsData.push(targetData);
                }
            }
        }

        // Self target
        const targetData = await this._getTargetData(characterData, characterData.actor, characterData.token);
        if (characterData.attributes.selfTarget === "add") {
            targetsData.push(targetData);
        } else if (characterData.attributes.selfTarget === "remove") {
            const index = targetsData.findIndex(target => target.actorId === targetData.actorId);
            if (index !== -1) {
                targetsData.splice(index, 1); // Remove the self-target if it exists in the array
            }
        }

        // Find pre-launch macro
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        const preLaunchMacroId = characterData.attributes.preLaunchMacro;
        const preLaunchMacro = await Pl1eHelpers.getDocument("Macro", preLaunchMacroId);

        // Execute pre-launch macro
        if (enableVFXAndSFX && preLaunchMacro !== undefined && characterData.token) {
            await preLaunchMacro.execute({
                characterData: characterData,
                targetsData: targetsData
            });
        }

        // Apply aspects, here we calculate each aspect for all targets
        for (let [id, aspect] of Object.entries(characterData.activeAspects)) {
            targetsData = await Pl1eAspect.applyActiveAspect(aspect, characterData, targetsData);
        }

        // Find post-launch macro
        const postLaunchMacroId = characterData.attributes.postLaunchMacro;
        const postLaunchMacro = await Pl1eHelpers.getDocument("Macro", postLaunchMacroId);

        // Execute post-launch macro
        if (enableVFXAndSFX && postLaunchMacro !== undefined && characterData.token) {
            await postLaunchMacro.execute({
                characterData: characterData,
                targetsData: targetsData
            });
        }

        // Display messages if targets found
        if (targetsData) {
            for (const targetData of targetsData) {
                await Pl1eChatMessage.targetRoll(characterData, targetData);
            }
        }
    }

    /**
     * Get the targetData from a token and its related actor
     * @param {CharacterData} characterData
     * @param {Pl1eActor} actor
     * @param {Token | null} token
     * @param {MeasuredTemplate} template
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
        targetData.actorId = actor.id;
        targetData.scene = characterData.scene;
        targetData.sceneId = characterData.scene?.id;
        targetData.token = token;
        targetData.tokenId = token?.id;
        targetData.tokenX = token?.x;
        targetData.tokenY = token?.y;
        targetData.template = template;
        return targetData;
    }

}