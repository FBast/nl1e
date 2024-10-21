import {Pl1eEvent} from "../helpers/events.mjs";
import {RestForm} from "../apps/restForm.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eActor} from "../documents/actors/actor.mjs";
import {Pl1eItem} from "../documents/items/item.mjs";
import {PL1E} from "../pl1e.mjs";
import {Pl1eTrade} from "../helpers/trade.mjs";

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
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e", "sheet", "actor"],
            template: "systems/pl1e/templates/actor/actor-sheet.hbs",
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @inheritDoc */
    get template() {
        if (this.actor.type === "merchant") {
            return `systems/pl1e/templates/actor/actor-merchant-sheet.hbs`;
        }
        return `systems/pl1e/templates/actor/actor-character-sheet.hbs`;
    }

    /** @inheritDoc */
    get title() {
        const actorType = Pl1eHelpers.getConfig("actorTypes", this.actor.type);
        let label = "Unknown";
        if (actorType) label = game.i18n.localize(actorType.label);
        if (this.actor.hasPlayerOwner) {
            const player = game.users.players.find(player => player.character && player.character.id === this.actor.id);
            if (player) label += ` (${player.name})`;
        }
        return label;
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
                            .find(w => w instanceof RestForm);
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
        context.items = this.actor.displayedItems;
        context.effects = this.actor.effects;
        context.inCombat = this.actor.bestToken && this.actor.bestToken.inCombat;
        context.filters = this._filters;

        await this._prepareItems(context);

        if (this.actor.type === "merchant")
            await this._prepareRollTables(context);

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();
        // Add the config data
        context.config = PL1E;
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
        html.find(".effect-edit").on("click", ev => this._onEffectEdit(ev));
        html.find(".effect-remove").on("click", ev => this._onEffectRemove(ev));
        html.find(".item-link").on("click", ev => this._onItemLink(ev));
        html.find(".item-origin").on("click", ev => this._onItemOrigin(ev));
        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find(".convert-currency").on("click", ev => this._onConvertCurrency(ev));

        // Highlights indications
        html.find(".highlight-link").on("mouseenter", ev => Pl1eEvent.onCreateHighlights(ev));
        html.find(".highlight-link").on("mouseleave", ev => Pl1eEvent.onRemoveHighlights(ev));

        // Handle drop event on a not owned actor
        if (!this.actor.isOwner) {
            html.find('.sheet-header, .sheet-tabs, .sheet-body').each((i, el) => {
                el.addEventListener('dragover', event => event.preventDefault());
                el.addEventListener('drop', this._onDrop.bind(this));
            });
        }

        // Handle drag event items from owned actor or merchant
        if (this.actor.isOwner || this.actor.type === "merchant") {
            let handler = ev => this._onDragStart(ev);
            html.find('.item').each((i, div) => {
                div.setAttribute("draggable", true);
                div.addEventListener("dragstart", handler, false);
            });
        }

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
        html.find(".roll-table-edit").on("click", ev => this._onRollTableEdit(ev, this.actor));
        html.find(".roll-table-remove").on("click", ev => this._onRollTableRemove(ev, this.actor));

        // Chat messages
        html.find(".skill-roll").on("click", ev => Pl1eEvent.onSkillRoll(ev, this.actor));

        // Custom controls
        html.find(".set-number").on("click", ev => Pl1eEvent.onSetNumber(ev, this.actor));
        html.find(".spin-number").on("click", ev => Pl1eEvent.onSpinNumber(ev, this.actor));
        html.find(".edit-number").on("click", ev => Pl1eEvent.onEditNumber(ev, this.actor));
        html.find(".edit-select").on("click", ev => Pl1eEvent.onEditSelect(ev, this.actor));
        html.find(".rank-control").on("click", ev => this._onRankChange(ev));
        html.find(".item-favorite").on("click", ev => this._onItemFavorite(ev))
        html.find(".currency-favorite").on("click", ev => this._onCurrencyFavorite(ev))
        html.find(".item-toggle").on("click", ev => this._onItemToggle(ev));
        html.find(".item-use").on("click", ev => this._onItemUse(ev));
        html.find(".item-reload").on("click", ev => this._onItemReload(ev));

        // Actor actions
        html.find('.open-journal').on('click', async ev => this._onOpenJournal(ev));
        html.find('.open-rest').on('click', async ev => this._onOpenRest(ev));

        // Merchant actions
        html.find(".button-remove-items").on("click", ev => this._onRemoveItemsClick(ev));
        html.find(".button-randomize-item").on("click", ev => this._onRandomizeItemClick(ev));
        html.find(".button-generate-item").on("click", ev => this._onGenerateItemClick(ev));
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
        for (let li of filters) {
            if (set.has(li.dataset.filter)) li.classList.add("color-disabled");
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
        // Check item type and subtype
        const data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        let document = await fromUuid(data.uuid)

        // If the document is not embedded and the user does not own it return
        if (!document.isEmbedded && !document.isOwner) {
            ui.notifications.info(game.i18n.localize("PL1E.NotOwnedDocument"));
            return;
        }

        // Roll table for merchant only
        if (data.type === "RollTable" && this.actor.type === "merchant") {
            await this.actor.addRefRollTable(document);
        }
        else if (data.type === "Item") {
            await this._onDropItem(event, data);
        }
        else {
            await super._onDrop(event);
        }
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
        // Return if item is childed and cannot be transfer
        if (item.childId) return;

        // Return if same actor
        if (item.parent === this.actor) return;

        // Filter item to an actor droppable
        const droppable = Pl1eHelpers.getConfig("actorTypes", this.actor.type, "droppable");
        if (!droppable.includes(item.type)) return;

        // Check item validation
        if (!item.isValidForActor(this.actor)) return;

        if (item.isEmbedded) {
            // Not owned target or not owned item
            // (should be a player transfer between two actors)
            if (!this.actor.isOwner || !item.isOwner) {
                if (!Pl1eHelpers.isGMConnected()) {
                    ui.notifications.info(game.i18n.localize("PL1E.NoGMConnected"));
                    return;
                }
                // Player transfer item to a not owned actor
                PL1E.socket.executeAsGM("sendItem", {
                    sourceActorUuid: item.parent.uuid,
                    targetActorUuid: this.actor.uuid,
                    itemId: item.id
                });
            }
            // The target actor and the item are owned
            // (should be a GM transfer between two actors)
            else {
                await Pl1eTrade.sendItem(item.parent.uuid, this.actor.uuid, item.id);
            }
        }
        // The item is not embedded
        // (should be someone who own the item)
        else {
            const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);
            await this.actor.addItem(originalItem);

            // If the item is embedded, then delete the source item
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

        const typeToCollectionMap = {
            'race': 'background',
            'culture': 'background',
            'class': 'background',
            'mastery': 'background',
            'feature': 'features',
            'ability': 'abilities',
            'weapon': 'weapons',
            'wearable': 'wearables',
            'consumable': 'consumables',
            'common': 'commons',
            'module': 'modules'
        };


        // Categorize all items into their respective collections
        await this._categorizeItems(context, typeToCollectionMap);

        // Once all items are categorized, proceed to filter them
        await this._filterItems(context, typeToCollectionMap, this.actor);

        // Apply feature and capacities filters
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

        // Group all items into a documents object
        let documents = {
            abilities: context.abilities,
            features: context.features,
            weapons: context.weapons,
            wearables: context.wearables,
            consumables: context.consumables,
            commons: context.commons,
            modules: context.modules
        };

        // Sort each type of item
        documents = Pl1eHelpers.sortDocuments(documents);

        // Update the context with the sorted items
        context.abilities = documents.abilities;
        context.features = documents.features;
        context.weapons = documents.weapons;
        context.wearables = documents.wearables;
        context.consumables = documents.consumables;
        context.commons = documents.commons;
        context.modules = documents.modules;
    }

    async _categorizeItems(context, typeToCollectionMap) {
        for (const item of context.items) {
            const itemCopy = item.toObject();
            itemCopy.sourceId = item.sourceId;
            itemCopy.realName = item.realName;
            itemCopy.realImg = item.realImg;
            itemCopy.warnings = item.warnings;
            itemCopy.isEnabled = item.isEnabled;

            // Add combined aspects
            itemCopy.combinedPassiveAspects = await item.getCombinedPassiveAspects();
            itemCopy.combinedActiveAspects = await item.getCombinedActiveAspects();

            // Add enriched HTML
            itemCopy.enriched = await TextEditor.enrichHTML(item.system.description, {
                secrets: item.isOwner,
                async: true,
                relativeTo: item
            });

            // Append item copy based on its type to the respective category
            const collectionKey = typeToCollectionMap[itemCopy.type];
            if (collectionKey) {
                context[collectionKey].push(itemCopy);
            } else {
                console.warn(`Unrecognized item type: ${itemCopy.type}`);
            }
        }
    }

    //TODO this method has some problems and call use merchant check to remove
    async _filterItems(context, typeToCollectionMap, actor) {
        const getItemPriority = (item) => {
            if (item.isEnabled) return 1;
            if (item.isEquipped) return 2;
            if (item.isReloaded) return 3;
            if (item.isActionUsed) return 4;
            if (item.isReactionUsed) return 5;
            if (item.isQuickActionUsed) return 6;
            if (item.isMajorActionAvailable) return 7;
            if (item.isUsableAtLevel) return 8;
            return 9; // Lower is higher priority
        };

        // Comprehensive check for whether to accumulate units
        const shouldAccumulate = (existingItem, newItem) => {
            // Define types for which duplicates should not accumulate units if not a merchant
            const noAccumulateTypes = actor.type !== "merchant" ? ['weapon', 'wearable'] : [];

            // Prevent accumulation for specific types based on an actor type
            if (noAccumulateTypes.includes(newItem.type)) return false;

            // Extendable checks for other conditions
            if (existingItem.system.removedUses !== newItem.system.removedUses) return false;
            if (newItem.system.attributes.customizable) return false;

            return true; // Accumulate by default if none of the conditions apply
        };

        // Iterate over each type of item collection
        for (const [type, collectionKey] of Object.entries(typeToCollectionMap)) {
            const collection = context[collectionKey];
            if (!collection) continue;

            let processedItems = [];

            // Process each item
            for (const item of collection) {
                item.units = 1; // Reset units for each item processed
                let foundPlace = false;

                for (let i = 0; i < processedItems.length; i++) {
                    const existingItem = processedItems[i];

                    if (existingItem.sourceId === item.sourceId) {
                        if (shouldAccumulate(existingItem, item)) {
                            if (getItemPriority(item) < getItemPriority(existingItem)) {
                                // Higher priority item found, replace existing item and accumulate units
                                item.units += existingItem.units;
                                processedItems[i] = item; // Replace with the new item
                            } else {
                                // Accumulate units to the existing item
                                existingItem.units += item.units;
                            }
                            foundPlace = true;
                            break;
                        }
                    }
                }

                if (!foundPlace) {
                    // No existing item found to accumulate or replace, add new
                    processedItems.push(item);
                }
            }

            // Update the collection with processed items
            collection.splice(0, collection.length, ...processedItems);
        }
    }

    /**
     * Determine whether an Owned Document will be shown based on the current set of filters.
     * @param {object[]} documents   Copies of objects data to be filtered.
     * @param {Set<string>} filters  Filters applied to the object list.
     * @returns {object[]}           Subset of input objects limited by the provided filters.
     * @protected
     */
    _filterDocuments(documents, filters) {
        return documents.filter(item => {
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
                    for (const featureType of Object.keys(PL1E.featureTypes)) {
                        if (filters.has(featureType) && (item.system.attributes.featureType === featureType)) return false;
                    }
                    break;
                }
                case "ability": {
                    for (const activation of Object.keys(PL1E.activations)) {
                        if (filters.has(activation) && (item.system.attributes.activation === activation)) return false;
                    }
                    break;
                }
                case "weapon": {
                    if (filters.has("melee") && item.system.attributes.meleeUse) return false;
                    if (filters.has("ranged") && item.system.attributes.rangedUse) return false;
                    if (filters.has("magic") && item.system.attributes.magicUse) return false;
                    if (filters.has("equipped") && item.isEquipped) return false;
                    break;
                }
                case "wearable": {
                    for (const slot of Object.keys(PL1E.slots)) {
                        if (filters.has(slot) && (item.system.attributes.slot === slot)) return false;
                    }
                    if (filters.has("equipped") && item.isEquipped) return false;
                    break;
                }
                case "consumable": {
                    for (const activation of Object.keys(PL1E.consumableActivations)) {
                        if (filters.has(activation) && (item.system.attributes.activation === activation)) return false;
                    }
                    break;
                }
                case "common": {
                    for (const commonType of Object.keys(PL1E.commonTypes)) {
                        if (filters.has(commonType) && (item.system.attributes.commonType === commonType)) return false;
                    }
                    break;
                }
                case "module": {
                    for (const moduleType of Object.keys(PL1E.moduleTypes)) {
                        if (filters.has(moduleType) && (item.system.attributes.moduleTypes.includes(moduleType))) return false;
                    }
                    break;
                }
                default: {
                    if (filters.has("passive") && item.flags?.pl1e?.permanent) return false;
                    if (filters.has("temporary") && !item.flags?.pl1e?.permanent) return false;
                    if (filters.has("inactive") && item.disabled) return false;
                }
            }
            return true;
        })
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
    async _onItemUse(event) {
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
    async _onItemReload(event) {
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
    async _onRemoveItemsClick(event) {
        ui.notifications.info(`${game.i18n.localize("PL1E.RemovingItems")}...`);

        let removedItemsNumber = 0;
        for (const item of this.actor.items) {
            await item.delete();
            removedItemsNumber++;
        }
        ui.notifications.info(`${game.i18n.localize("PL1E.NumberOfRemovedItems")} : ${removedItemsNumber}`);
    }

    /**
     * Trigger the randomization of items in the merchant based on roll tables
     * @param event
     * @return {Promise<void>}
     */
    async _onRandomizeItemClick(event) {
        let addedItemsNumber = 0;
        for (let i = 0; i < this.actor.system.general.itemPerRoll; i++) {
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
        }
        ui.notifications.info(`${game.i18n.localize("PL1E.NumberOfAddedItems")} : ${addedItemsNumber}`);
    }

    /**
     * Add all items from roll tables to the actor, including items from nested roll tables.
     * @param event
     * @return {Promise<void>}
     */
    async _onGenerateItemClick(event) {
        ui.notifications.info(`${game.i18n.localize("PL1E.GeneratingItems")}...`);

        let addedItemsNumber = 0;
        // Define a recursive function to handle roll table items and nested roll tables
        const addItemsFromRollTable = async (id) => {
            const item = await Pl1eHelpers.getDocument("Item", id);
            if (item) {
                await this.actor.addItem(item);
                addedItemsNumber++;
            }
            else {
                const rollTable = await Pl1eHelpers.getDocument("RollTable", id);
                if (rollTable) {
                    for (const tableResult of rollTable.results) {
                        // Recursive call for nested roll tables
                        await addItemsFromRollTable(tableResult.documentId);
                    }
                }
            }
        };

        // Iterate through all referenced roll tables and add their items
        for (const refRollTable of this.actor.system.refRollTables) {
            await addItemsFromRollTable(refRollTable);
        }

        ui.notifications.info(`${game.i18n.localize("PL1E.NumberOfAddedItems")} : ${addedItemsNumber}`);
    }

    /**
     * Render the linked parent item
     * @param {Event} event
     */
    async _onItemLink(event) {
        event.preventDefault();
        event.stopPropagation();

        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = this.actor.items.get(itemId);

        // Render multiple parent in case of child stack
        let sheetPosition = Pl1eHelpers.screenCenter();
        for (/** @type {Pl1eItem} */ const otherItem of this.actor.items) {
            if (otherItem.sourceId === item.sourceId) {
                const parentItem = otherItem.rootParentItem;
                parentItem.sheet.render(true, {left: sheetPosition.x, top: sheetPosition.y});
                sheetPosition.x += 30;
                sheetPosition.y += 30;
            }
        }
    }

    /**
     * Render the origin item of the effect
     * @param event
     * @return {Promise<void>}
     */
    async _onItemOrigin(event) {
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
     * Convert currencies with upgrade or downgrade
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onConvertCurrency(event) {
        const currencyId = $(event.currentTarget).closest(".item").data("currency-id");
        const type = $(event.currentTarget).data("type");

        let currentGold = foundry.utils.getProperty(this.actor, "system.money.gold");
        let currentSilver = foundry.utils.getProperty(this.actor, "system.money.silver");
        let currentCopper = foundry.utils.getProperty(this.actor, "system.money.copper");

        const actorData = {};
        switch (currencyId) {
            case "gold":
                if (type === "down") {
                    currentGold -= 1;
                    currentSilver += 10;
                }
                break;
            case "silver":
                if (type === "down") {
                    currentSilver -= 1;
                    currentCopper += 10;
                }
                else if (type === "up") {
                    currentGold += 1;
                    currentSilver -= 10;
                }
                break;
            case "copper":
                if (type === "up") {
                    currentSilver += 1;
                    currentCopper -= 10;
                }
                break;
        }

        if (currentGold < 0 || currentSilver < 0 || currentCopper < 0) return;

        await this.actor.update({
            "system.money.gold": currentGold,
            "system.money.silver": currentSilver,
            "system.money.copper": currentCopper
        });
    }

    /**
     * Open roll table sheet
     * @param event The originating click event
     * @param {Actor} actor the actor of the roll table
     */
    async _onRollTableEdit(event, actor) {
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
    async _onRollTableRemove(event, actor) {
        const rollTableId = $(event.currentTarget).closest(".item").data("roll-table-id");

        if (rollTableId) {
            const rollTable = await Pl1eHelpers.getDocument("RollTable", rollTableId);
            if (rollTable) await actor.removeRefRollTable(rollTable);
        }

        actor.sheet.render(actor.sheet.rendered);
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async _onRankChange(event) {
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
     * Toggle the item
     * @param {Event} event The originating click event
     */
    async _onItemToggle(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = $(event.currentTarget).closest(".item").data("item-id");

        /** @type {Pl1eItem} */
        const item = this.actor.items.get(itemId);
        let options = {};
        const main = $(event.currentTarget).data("main");
        if (main) options["main"] = main;

        if (item.canToggle()) await item.toggle(options);
    }

    /**
     * Favorite the item
     * @param event
     * @returns {Promise<void>}
     */
    async _onItemFavorite(event) {
        event.preventDefault();
        event.stopPropagation();

        const itemId = $(event.currentTarget).closest(".item").data("item-id");

        /** @type {Pl1eItem} */
        const item = this.actor.items.get(itemId);
        await item.favorite();
    }

    /**
     * Favorite the currency
     * @param event
     * @returns {Promise<void>}
     */
    async _onCurrencyFavorite(event) {
        event.preventDefault();
        event.stopPropagation();

        let currencyId = $(event.currentTarget).closest(".item").data("currency-id");
        currencyId = currencyId.charAt(0).toUpperCase() + currencyId.slice(1);

        const currencyPath = `system.misc.is${currencyId}Favorite`;
        const isFavorite = foundry.utils.getProperty(this.actor, currencyPath);
        await this.actor.update({
            [currencyPath]: !isFavorite,
        });
    }

    /**
     * Open effect sheet
     * @param {Event} event
     */
    _onEffectEdit(event) {
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
    async _onEffectRemove(event) {
        event.preventDefault();

        const effectId = $(event.currentTarget).closest(".item").data("effect-id");
        const effect = this.actor.effects.get(effectId);

        await effect.delete();
    }

    /**
     * Open the character journal or create if not existing
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onOpenJournal(event) {
        event.preventDefault();

        // Get the user ID of the player who owns the actor
        const ownerId = game.users.find(u => u.character && u.character.id === this.actor.id)?.id;

        if (!ownerId) {
            console.error("Owner not found for this actor.");
            return;
        }

        // Check if the actor already has a journal entry associated with them
        const journalId = this.actor.getFlag("pl1e", "journalEntryId");

        // If the journal exists, open it
        if (journalId) {
            const journal = game.journal.get(journalId);
            if (journal) {
                journal.sheet.render(true);
                return;
            }
        }

        // If no journal exists, create a new one
        const newJournal = await JournalEntry.create({
            name: `${this.actor.name}`,
            folder: null,
            permission: { [ownerId]: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER },
            flags: { pl1e: { writerId: ownerId } }
        });

        // Save the new journal's ID to the actor's flags
        await this.actor.setFlag("pl1e", "journalEntryId", newJournal.id);

        // Open the newly created journal
        newJournal.sheet.render(true);
    }

    /**
     * Open the rest window
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onOpenRest(event) {
        const app = new RestForm(this.actor, {
            title: `${game.i18n.localize("PL1E.Rest")} : ${this.actor.name}`
        });
        app.render(true);
    }
}