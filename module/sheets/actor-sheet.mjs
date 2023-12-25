import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eResting} from "../apps/resting.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eActor} from "../documents/actors/actor.mjs";
import {Pl1eItem} from "../documents/items/item.mjs";
import {PL1E} from "../config/config.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Pl1eActorSheet extends ActorSheet {

    /**
     * Track the set of item filters which are applied
     * @type {Object<string, Set>}
     * @protected
     */
    _filters = {
        background: new Set(),
        features: new Set(),
        abilities: new Set(),
        effects: new Set(),
        weapons: new Set(),
        wearables: new Set(),
        consumables: new Set(),
        commons: new Set(),
        modules: new Set()
    };

    /** @inheritDoc */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pl1e", "sheet", "actor"],
            template: "systems/pl1e/templates/actor/actor-sheet.hbs",
            width: 700,
            height: 730,
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @inheritDoc */
    get template() {
        return `systems/pl1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /**
     * Custom header buttons
     * @returns {Application.HeaderButton[]}
     * @private
     */
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        if (game.user.isGM) {
            if (this.actor.type === "character") {
                buttons.unshift({
                    label: "PL1E.CreationMod",
                    class: "button-creation-mod",
                    icon: this.actor.system.general.creationMod ? "fas fa-toggle-on" : "fas fa-toggle-off",
                    onclick: async () => {
                        const appRestingForm = Object.values(ui.windows)
                            .find(w => w instanceof Pl1eResting);
                        await appRestingForm?.close();
                        await this.actor.update({
                            "system.general.creationMod": !this.actor.system.general.creationMod
                        });
                        this._getHeaderButtons();
                    }
                });
            }
            buttons.unshift({
                label: 'PL1E.Debug',
                class: 'button-debug',
                icon: 'fas fa-ban-bug',
                onclick: () => console.log("PL1E | Content of actor sheet:", this)
            });
        }
        return buttons;
    }

    /** @inheritDoc */
    async getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the subItems array, and the effects array.
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        // const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = this.actor.system;
        context.flags = this.actor.flags;
        context.items = this.actor.items;
        context.effects = this.actor.effects;
        context.inCombat = this.actor.bestToken !== null && this.actor.bestToken.inCombat;
        context.filters = this._filters;

        await this._prepareItems(context);

        if (this.actor.type === "merchant")
            await this._prepareRollTables(context);

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();
        // Add the config data
        context.config = CONFIG.PL1E;
        // Add game access
        context.game = game;

        return context;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.actor));
        html.find(".item-buy").on("click", ev => Pl1eEvent.onItemBuy(ev, this.actor));
        html.find(".effect-edit").on("click", ev => this.onEffectEdit(ev));
        html.find(".effect-remove").on("click", ev => this.onEffectRemove(ev));
        html.find(".item-link").on("click", ev => this.onItemLink(ev));
        html.find(".item-origin").on("click", ev => this.onItemOrigin(ev));
        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));

        // Highlights indications
        html.find(".highlight-link").on("mouseenter", ev => Pl1eEvent.onCreateHighlights(ev));
        html.find(".highlight-link").on("mouseleave", ev => Pl1eEvent.onRemoveHighlights(ev));

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Item filters
        const filterLists = html.find(".item-filter-list");
        filterLists.each(this._initializeFilterItemList.bind(this));
        filterLists.on("click", ".item-filter", this._onToggleFilter.bind(this));

        // Item management
        html.find(".item-create").on("click", ev => Pl1eEvent.onItemCreate(ev, this.actor));
        html.find(".item-remove").on("click", ev => Pl1eEvent.onItemRemove(ev, this.actor));

        // RollTable management
        html.find(".roll-table-edit").on("click", ev => this.onRollTableEdit(ev, this.actor));
        html.find(".roll-table-remove").on("click", ev => this.onRollTableRemove(ev, this.actor));

        // Chat messages
        html.find(".skill-roll").on("click", ev => Pl1eEvent.onSkillRoll(ev, this.actor));

        // Currency
        html.find(".currency-control").on("click", ev => Pl1eEvent.onCurrencyChange(ev, this.actor));
        html.find(".currency-convert").on("click", ev => Pl1eEvent.onMoneyConvert(ev, this.actor));

        // Custom controls
        html.find(".characteristic-control").on("click", ev => this.onCharacteristicChange(ev));
        html.find(".rank-control").on("click", ev => this.onRankChange(ev));
        html.find(".item-toggle").on("click", ev => Pl1eEvent.onItemToggle(ev, this.actor));
        html.find(".item-use").on("click", ev => this.onItemUse(ev));
        html.find(".item-reload").on("click", ev => this.onItemReload(ev));

        // Button actions
        html.find(".button-remove-items").on("click", ev => this.onRemoveItemsClick(ev));
        html.find(".button-generate-item").on("click", ev => this.onGenerateItemClick(ev));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("subItems-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }

        const titleElement = html.find(".window-title")[0];
        if (titleElement) {
            titleElement.textContent = "New Title";
        }
    }

    /**
     * Initialize Item list filters by activating the set of filters which are currently applied
     * @param {number} i  Index of the filter in the list.
     * @param {HTML} ul   HTML object for the list item surrounding the filter.
     * @private
     */
    _initializeFilterItemList(i, ul) {
        const set = this._filters[ul.dataset.filter];
        const filters = ul.querySelectorAll(".item-filter");
        for ( let li of filters ) {
            if ( set.has(li.dataset.filter) ) li.classList.add("active");
        }
    }

    /**
     * Handle toggling of filters to display a different set of owned items.
     * @param {Event} event     The click event which triggered the toggle.
     * @returns {Pl1eActorSheet}  This actor sheet with toggled filters.
     * @private
     */
    _onToggleFilter(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const set = this._filters[li.parentElement.dataset.filter];
        const filter = li.dataset.filter;
        if ( set.has(filter) ) set.delete(filter);
        else set.add(filter);
        return this.render();
    }

    /** @inheritDoc */
    async _onDrop(event) {
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Check item type and subtype
        const data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        let document = await fromUuid(data.uuid)

        // Check if the user own the dropped document
        if (!document.isOwner) {
            ui.notifications.info(game.i18n.localize("PL1E.NotOwnedDocument"));
            return;
        }

        // Roll table for merchant only
        if (this.actor.type === "merchant" && document.type === "RollTable") {
            await this.actor.addRefRollTable(document);
        }

        await super._onDrop(event);
    }

    async _onDropFolder(event, data) {
        const folder = await Folder.implementation.fromDropData(data);

        // Check if the folder actually contains items
        if (folder?.type === "Item") {
            // Loop through each item in the folder and call _onDropItem for each item
            for (const itemData of folder.contents) {
                const item = await Pl1eHelpers.getDocument("Item", itemData._id);
                await this._addItem(item);
            }
        }
        else {
            return super._onDropFolder(event, data);
        }
    }

    /** @inheritDoc */
    async _onDropItem(event, data) {
        const item = await Item.implementation.fromDropData(data);
        await this._addItem(item);
    }

    /**
     * Add a new item to the actor
     * @param item
     * @return {Promise<void>}
     * @private
     */
    async _addItem(item) {
        // Return if same actor
        if (item.parent === this.actor) return;

        // Filter item to actor droppable
        const droppable = Pl1eHelpers.getConfig("actorTypes", this.actor.type, "droppable");
        if (!droppable.includes(item.type)) return;

        // Only one race
        if (item.type === "race" && this.actor.items.find(item => item.type === "race")) {
            ui.notifications.info(game.i18n.localize("PL1E.OnlyOneRace"));
            return;
        }

        // Only one culture
        if (item.type === "culture" && this.actor.items.find(item => item.type === "culture")) {
            ui.notifications.info(game.i18n.localize("PL1E.OnlyOneCulture"));
            return;
        }

        // Only one body class
        if (item.type === "class" && item.system.attributes.classType === "body" &&
            this.actor.items.find(item => item.type === "class" && item.system.attributes.classType === "body")) {
            ui.notifications.info(game.i18n.localize("PL1E.OnlyOneBodyClass"));
            return;
        }

        // Only one mind class
        if (item.type === "class" && item.system.attributes.classType === "mind" &&
            this.actor.items.find(item => item.type === "class" && item.system.attributes.classType === "mind")) {
            ui.notifications.info(game.i18n.localize("PL1E.OnlyOneMindClass"));
            return;
        }

        // Player to other actor transfer
        if (!this.actor.isOwner) {
            if (!Pl1eHelpers.isGMConnected()) {
                ui.notifications.info(game.i18n.localize("PL1E.NoGMConnected"));
                return;
            }
            // Player transfer item to a not owned actor
            CONFIG.PL1E.socket.executeAsGM("sendItem", {
                sourceActorId: game.user.character._id,
                targetActorId: this.actor._id,
                itemId: item._id
            });
        }
        // Other cases
        else {
            const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);
            await this.actor.addItem(originalItem);

            // Delete the source item if it is embedded
            if (item.isEmbedded) await item.actor.removeItem(item);
        }
    }

    /**
     * Organize and classify Items and Effects for Character sheets.
     * @param {Object} context The actor to prepare.
     * @return {undefined}
     */
    async _prepareItems(context) {
        // Initialize containers.
        context.background = [];
        context.features = [];
        context.abilities = []
        context.weapons = [];
        context.wearables = [];
        context.consumables = [];
        context.commons = [];
        context.modules = [];

        // Process and categorize items
        const sourceIdFlags = [];
        for (const item of context.items) {
            if (item.parentItem) continue;
            await this._prepareItem(context, item, sourceIdFlags);
        }

        // Apply features and capacities filters
        context.background = this._filterDocuments(context.background, this._filters.background);
        context.features = this._filterDocuments(context.features, this._filters.features);
        context.abilities = this._filterDocuments(context.abilities, this._filters.abilities);
        context.effects = this._filterDocuments(context.effects, this._filters.effects);

        // Apply inventory filters
        context.weapons = this._filterDocuments(context.weapons, this._filters.weapons);
        context.wearables = this._filterDocuments(context.wearables, this._filters.wearables);
        context.consumables = this._filterDocuments(context.consumables, this._filters.consumables);
        context.commons = this._filterDocuments(context.commons, this._filters.commons);
        context.modules = this._filterDocuments(context.modules, this._filters.modules);

        // Background sorting
        const backgroundOrder = ["race", "culture", "class", "mastery"];
        context.background = context.background.sort((a, b) => {
            // Compare by type using the background order
            let typeComparison = backgroundOrder.indexOf(a.type) - backgroundOrder.indexOf(b.type);
            if (typeComparison !== 0) {
                return typeComparison;
            }

            // If types are the same, then compare by name
            return a.name.localeCompare(b.name);
        });

        // Abilities sorting
        const abilitiesOrder = Object.keys(CONFIG.PL1E.activations);
        context.abilities = context.abilities.sort((a, b) => {
            // Compare by level
            if (a.system.attributes.level < b.system.attributes.level) return -1;
            if (a.system.attributes.level > b.system.attributes.level) return 1;

            // Then Compare by activation using the abilities order
            let activationComparison = abilitiesOrder.indexOf(a.system.attributes.activation)
                - abilitiesOrder.indexOf(b.system.attributes.activation);
            if (activationComparison !== 0) {
                return activationComparison;
            }

            // Then compare by name
            return a.name.localeCompare(b.name);
        });

        // Others sorting
        context.features = context.features.sort((a, b) => b.system.points - a.system.points);
        context.weapons = context.weapons.sort((a, b) => a.name.localeCompare(b.name));
        context.wearables = context.wearables.sort((a, b) => a.name.localeCompare(b.name));
        context.consumables = context.consumables.sort((a, b) => a.name.localeCompare(b.name));
        context.commons = context.commons.sort((a, b) => a.name.localeCompare(b.name));
        context.modules = context.modules.sort((a, b) => a.name.localeCompare(b.name));
    }

    async _prepareItem(context, item, sourceIdFlags) {
        // Don't process if container
        if (item.behavior === "container") return;

        const sourceIdFlag = item.sourceId;

        // Merge aspects for each item
        item.system.combinedPassiveAspects = await item.getCombinedPassiveAspects();
        item.system.combinedActiveAspects = await item.getCombinedActiveAspects();

        // Enriched HTML description
        item.enriched = await TextEditor.enrichHTML(item.system.description, {
            secrets: item.isOwner,
            async: true,
            relativeTo: item
        });

        // Append to background.
        if (["race", "culture", "class", "mastery"].includes(item.type)) {
            context.background.push(item);
        }
        // Append to features.
        if (item.type === "feature") {
            context.features.push(item);
        }
        // Append to abilities.
        else if (item.type === "ability") {
            // Skip ability if actor level is lower than ability level
            if (item.system.attributes.level > this.actor.system.general.level) return;

            // Increase units
            if (sourceIdFlags.includes(sourceIdFlag)) {
                const sameItem = context.abilities.find(item => item.sourceId === sourceIdFlag);
                sameItem.system.units++;
            } else {
                context.abilities.push(item);
            }
        } else if (item.type === "weapon") {
            context.weapons.push(item);
        } else if (item.type === "wearable") {
            context.wearables.push(item);
        } else if (item.type === "consumable") {
            // Increase units
            if (sourceIdFlags.includes(sourceIdFlag)) {
                const sameItem = context.consumables.find(item => item.sourceId === sourceIdFlag);
                sameItem.system.units++;
            } else {
                context.consumables.push(item);
            }
        } else if (item.type === "common") {
            // Increase units
            if (sourceIdFlags.includes(sourceIdFlag)) {
                const sameItem = context.commons.find(item => item.sourceId === sourceIdFlag);
                sameItem.system.units++;
            } else {
                context.commons.push(item);
            }
        } else if (item.type === "module") {
            // Increase units
            if (sourceIdFlags.includes(sourceIdFlag)) {
                const sameItem = context.modules.find(item => item.sourceId === sourceIdFlag);
                sameItem.system.units++;
            } else {
                context.modules.push(item);
            }
        }

        // Handle sourceId flags for duplicates
        if (!sourceIdFlags.includes(sourceIdFlag)) {
            sourceIdFlags.push(sourceIdFlag);
        }

        // Iterate over children
        for (const itemChild of item.childItems) {
            await this._prepareItem(context, itemChild, sourceIdFlags);
        }
    }

    /**
     * Determine whether an Owned Document will be shown based on the current set of filters.
     * @param {object[]} documents   Copies of documents data to be filtered.
     * @param {Set<string>} filters  Filters applied to the item list.
     * @returns {object[]}           Subset of input documents limited by the provided filters.
     * @protected
     */
    _filterDocuments(documents, filters) {
        return documents.filter(item => {
            if (item.parentCollection === "items") {
                switch (item.type) {
                    case "race": {
                        if (filters.has("race")) return false;
                        break;
                    }
                    case "culture": {
                        if (filters.has("culture")) return false;
                        break;
                    }
                    case "class": {
                        if (filters.has("class")) return false;
                        break;
                    }
                    case "mastery": {
                        if (filters.has("mastery")) return false;
                        break;
                    }
                    case "feature": {
                        for (const featureType of Object.keys(CONFIG.PL1E.featureTypes)) {
                            if (filters.has(featureType) && (item.system.attributes.featureType === featureType)) return false;
                        }
                        break;
                    }
                    case "ability": {
                        for (const activation of Object.keys(CONFIG.PL1E.activations)) {
                            if (filters.has(activation) && (item.system.attributes.activation === activation)) return false;
                        }
                        break;
                    }
                    case "weapon": {
                        if (filters.has("equipped") && item.isEnabled) return false;
                        if (filters.has("melee") && item.system.attributes.meleeUse) return false;
                        if (filters.has("ranged") && item.system.attributes.rangedUse) return false;
                        if (filters.has("magic") && item.system.attributes.magicUse) return false;
                        break;
                    }
                    case "wearable": {
                        if (filters.has("equipped") && item.isEnabled) return false;
                        for (const slot of Object.keys(CONFIG.PL1E.slots)) {
                            if (filters.has(slot) && (item.system.attributes.slot === slot)) return false;
                        }
                        break;
                    }
                    case "consumable": {
                        for (const activation of Object.keys(CONFIG.PL1E.activations)) {
                            if (filters.has(activation) && (item.system.attributes.activation === activation)) return false;
                        }
                        break;
                    }
                    case "common": {
                        for (const commonType of Object.keys(CONFIG.PL1E.commonTypes)) {
                            if (filters.has(commonType) && (item.system.attributes.commonType === commonType)) return false;
                        }
                        break;
                    }
                    case "module": {
                        for (const moduleType of Object.keys(CONFIG.PL1E.moduleTypes)) {
                            if (filters.has(moduleType) && (item.system.attributes.moduleTypes.includes(moduleType))) return false;
                        }
                        break;
                    }
                }
            }
            else if (item.parentCollection === "effects") {
                if (filters.has("passive") && item.flags?.pl1e?.permanent) return false;
                if (filters.has("temporary") && item.duration.label) return false;
                if (filters.has("inactive") && item.disabled) return false;
            }
            return true;
        });
    }

    async _prepareRollTables(context) {
        // Initialize container.
        let rollTables = [];

        for (let i = 0; i < this.actor.system.refRollTables.length; i++) {
            const id = this.actor.system.refRollTables[i];
            let rollTable = await Pl1eHelpers.getDocument("RollTable", id);
            if (!rollTable) {
                // Create an unknown rollTable for display
                rollTable = {
                    type: "unknown",
                    id: id
                }
            }
            rollTables[i] = rollTable;
        }

        // Assign and return
        context.rollTables = rollTables;
    }

    /**
     * Use an ability
     * @param {Event} event The originating click event
     */
    async onItemUse(event) {
        event.preventDefault();

        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        /** @type {Pl1eItem} */
        const item = this.actor.items.get(itemId);

        try {
            await item.activate();
        }
        catch (e) {
            console.error(e);
        }
    }

    /**
     * Handle reload of an Owned Consumable within the Actor.
     * @param {Event} event The triggering click event.
     */
    async onItemReload(event) {
        event.preventDefault();

        const itemId = event.currentTarget.closest(".item").dataset.itemId;
            /** @type {Pl1eItem} */
        const item = this.actor.items.get(itemId);

        if (item.canReload()) await item.reload();
    }

    /**
     * Remove all the items from the merchant
     * @param event
     */
    async onRemoveItemsClick(event) {
        let removedItemsNumber = 0;
        for (const item of this.actor.items) {
            if (!["weapon", "wearable", "consumable", "common"].includes(item.type)) continue;
            await item.delete();
            removedItemsNumber++;
        }
        ui.notifications.info(`${game.i18n.localize("NumberOfRemovedItems")} : ${removedItemsNumber}`);
    }

    /**
     * Trigger the reset and generation of the items of the merchant based on roll tables
     * @param event
     * @return {Promise<void>}
     */
    async onGenerateItemClick(event) {
        let addedItemsNumber = 0;
        for (const refRollTable of this.actor.system.refRollTables) {
            const rollTable = await Pl1eHelpers.getDocument("RollTable", refRollTable);
            const defaultResults = await rollTable.roll();
            for (const tableResult of defaultResults.results) {
                const item = await Pl1eHelpers.getDocument("Item", tableResult.documentId);
                if (item) {
                    await this.actor.addItem(item);
                    addedItemsNumber++;
                }
            }
        }
        ui.notifications.info(`${game.i18n.localize("NumberOfAddedItems")} : ${addedItemsNumber}`);
    }

    /**
     * Render the linked parent item
     * @param {Event} event
     */
    async onItemLink(event) {
        event.preventDefault();
        event.stopPropagation();

        const itemLink = $(event.currentTarget).closest(".item").data("item-link-id");
        const itemId = $(event.currentTarget).closest(".item").data("item-id");

        if (itemLink) {
            const parentItem = this.actor.items.find(item => item.parentId === itemLink);
            parentItem.sheet.render(true);
        }
        else {
            const item = this.actor.items.get(itemId);

            // Render multiple parent in case of child stack
            let sheetPosition = Pl1eHelpers.screenCenter();
            for (const otherItem of this.actor.items) {
                const childId = otherItem.childId;
                if (childId && otherItem.sourceId === item.sourceId) {
                    const parentItem = this.actor.items.find(item => item.parentId === childId);
                    parentItem.sheet.render(true, {left: sheetPosition.x, top: sheetPosition.y});
                    sheetPosition.x += 30;
                    sheetPosition.y += 30;
                }
            }
        }
    }

    /**
     * Render the origin item of the effect
     * @param event
     * @return {Promise<void>}
     */
    async onItemOrigin(event) {
        event.preventDefault();
        event.stopPropagation();

        const itemOrigin = $(event.currentTarget).closest(".item").data("item-origin-id");
        const actorOrigin = $(event.currentTarget).closest(".item").data("actor-origin-id");
        const actor = await Pl1eHelpers.getDocument("Actor", actorOrigin);
        if (actor) {
            const item = actor.items.get(itemOrigin);
            item.sheet.render(true);
        }
    }

    /**
     * Open roll table sheet
     * @param event The originating click event
     * @param {Actor} actor the actor of the roll table
     */
    async onRollTableEdit(event, actor) {
        let rollTableId = $(event.currentTarget).closest(".item").data("roll-table-id");
        const rollTable = await Pl1eHelpers.getDocument("RollTable", rollTableId);

        if (rollTable.sheet.rendered) rollTable.sheet.bringToTop();
        else rollTable.sheet.render(true);
    }

    /**
     * Handle remove of roll table
     * @param {Event} event The originating click event
     * @param {Pl1eActor} actor the actor where the roll table is removed
     */
    async onRollTableRemove(event, actor) {
        const rollTableId = $(event.currentTarget).closest(".item").data("roll-table-id");

        if (rollTableId) {
            const rollTable = await Pl1eHelpers.getDocument("RollTable", rollTableId);
            if (rollTable) await actor.removeRefRollTable(rollTable);
        }

        actor.sheet.render(actor.sheet.rendered);
    }

    /**
     * Handle characteristics changes
     * @param {Event} event The originating click event
     */
    async onCharacteristicChange(event) {
        event.preventDefault();
        event.stopPropagation();

        const characteristic = $(event.currentTarget).closest(".characteristic").data("characteristic-id");
        let value = $(event.currentTarget).data("value");
        if (!value || !characteristic) return;

        let remaining = this.actor.system.general.remainingCharacteristics;
        if (remaining === 0 && value > 0) return;

        let oldValue = this.actor.system.characteristics[characteristic].base;
        let newValue = oldValue + value;

        if (newValue < 2 || newValue > 5) return;

        await this.actor.update({
            ["system.characteristics." + characteristic + ".base"]: newValue,
            ["system.general.remainingCharacteristics"]: remaining - value
        });

        this.render(false);
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async onRankChange(event) {
        event.preventDefault();
        event.stopPropagation();
        const skill = $(event.currentTarget).data("skill");
        if (!skill) return;
        let oldValue = this.actor.system.skills[skill].rank;
        let maxRank = this.actor.system.general.maxRank;
        let newValue = oldValue + 1;
        if (newValue > maxRank || this.actor.system.general.ranks - newValue < 0) {
            if (this.actor.system.general.creationMod) newValue = 1;
            else return;
        }
        await this.actor.update({
            ["system.skills." + skill + ".rank"]: newValue
        });
        this.render(false);
    }

    /**
     * Open effect sheet
     * @param {Event} event
     */
    onEffectEdit(event) {
        event.preventDefault();

        const effectId = $(event.currentTarget).closest(".item").data("effect-id");
        const effect = this.actor.effects.get(effectId);

        return effect.sheet.render(true, {
            editable: game.user.isGM
        });
    }

    /**
     * Remove effect
     * @param {Event} event
     */
    async onEffectRemove(event) {
        event.preventDefault();

        const effectId = $(event.currentTarget).closest(".item").data("effect-id");
        const effect = this.actor.effects.get(effectId);

        await effect.delete();
    }

}