import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eResting} from "../apps/resting.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eActor} from "../documents/actors/actor.mjs";
import {Pl1eItem} from "../documents/items/item.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Pl1eActorSheet extends ActorSheet {

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
                onclick: () => console.log(this)
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
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;
        context.items = actorData.items;
        context.inCombat = this.actor.bestToken !== null && this.actor.bestToken.inCombat;

        this._prepareItems(context);
        this._prepareEffects(context);

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
        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));

        // Highlights indications
        html.find(".highlight-link").on("mouseenter", ev => Pl1eEvent.onCreateHighlights(ev));
        html.find(".highlight-link").on("mouseleave", ev => Pl1eEvent.onRemoveHighlights(ev));

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

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

    /** @inheritDoc */
    async _onDrop(event) {
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Check item type and subtype
        const data = JSON.parse(event.dataTransfer?.getData("text/plain"));

        // Roll table for merchant only
        if (this.actor.type === "merchant" && data.type === "RollTable") {
            const uuidArray = data.uuid.split(".");
            const id = uuidArray[uuidArray.length - 1];
            const rollTable = await Pl1eHelpers.getDocument("RollTable", id);
            if (!rollTable) throw new Error(`PL1E | No roll table found with UUID ${data.uuid}`);

            await this.actor.addRefRollTable(rollTable);
            this.render();
        }

        super._onDrop(event);
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

        // filter item to actor droppable
        if (!CONFIG.PL1E.actors[this.actor.type].droppable.includes(item.type)) return;

        // Player to other actor transfer
        if (!this.actor.isOwner) {
            if (!Pl1eHelpers.isGMConnected()) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoGMConnected"));
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
            if (item.isOwned) await item.actor.removeItem(item);
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     * @param {Object} context The actor to prepare.
     * @return {undefined}
     */
    _prepareItems(context) {
        // Initialize containers.
        let weapons = [];
        let wearables = [];
        const consumables = [];
        let commons = [];
        const features = [];
        const abilities = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        // Iterate through subItems, allocating to containers
        const sourceIdFlags = [];
        for (let item of context.items) {
            // Hide junk for merchant
            if (item.system.attributes.junk && this.actor.system.general.hideJunk) continue;

            // Append to item categories
            const sourceIdFlag = item.flags.core ? item.flags.core.sourceId : null;
            if (item.type === 'weapon') {
                weapons.push(item);
            }
            else if (item.type === 'wearable') {
                wearables.push(item);
            }
            else if (item.type === 'consumable') {
                // Increase units
                if (sourceIdFlags.includes(sourceIdFlag)) {
                    const sameItem = consumables.find(item => item.flags.core.sourceId === sourceIdFlag);
                    sameItem.system.units++;
                }
                else {
                    consumables.push(item);
                }
            }
            else if (item.type === 'common') {
                // Increase units
                if (sourceIdFlags.includes(sourceIdFlag)) {
                    const sameItem = commons.find(item => item.flags.core.sourceId === sourceIdFlag);
                    sameItem.system.units++;
                }
                else {
                    commons.push(item);
                }
            }
            // Append to features.
            else if (item.type === 'feature') {
                features.push(item);
            }
            // Append to abilities.
            else if (item.type === 'ability') {
                // Filter item with faith parent
                let parentItem = null;
                for (const otherItem of this.actor.items) {
                    if (otherItem.parentId === item.childId) {
                        parentItem = otherItem;
                        break;
                    }
                }
                if (parentItem && parentItem.system.attributes.featureType === "faith" && !this.actor.system.misc.faithPower) continue;

                // Increase units
                if (sourceIdFlags.includes(sourceIdFlag)) {
                    const sameItem = abilities[item.system.attributes.level].find(item => item.flags.core.sourceId === sourceIdFlag);
                    sameItem.system.units++;
                }
                else {
                    abilities[item.system.attributes.level].push(item);
                }
            }
            // Push sourceId flag to handle duplicates
            if (sourceIdFlag && !sourceIdFlags.includes(sourceIdFlag)) sourceIdFlags.push(sourceIdFlag);
        }

        // Sorting arrays by name
        weapons = weapons.sort((a, b) => a.name.localeCompare(b.name));
        wearables = wearables.sort((a, b) => a.name.localeCompare(b.name));
        wearables = wearables.sort((a, b) => a.name.localeCompare(b.name));
        commons = commons.sort((a, b) => a.name.localeCompare(b.name));

        // Assign and return
        context.weapons = weapons;
        context.wearables = wearables;
        context.consumables = consumables;
        context.commons = commons;
        context.features = features;
        context.abilities = abilities;
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
     * Organize and classify Effects for Character sheets.
     * @param {Object} context The actor to prepare.
     * @return {undefined}
     */
    async _prepareEffects(context) {
        const passiveEffects = [];
        const temporaryEffects = [];
        const inactiveEffects = [];

        // Iterate over active effects, classifying them into categories
        for (let effect of this.actor.effects) {
            if (effect.disabled) inactiveEffects.push(effect);
            else if (effect.createEffect) temporaryEffects.push(effect);
            else passiveEffects.push(effect);
        }

        context.passiveEffects = passiveEffects;
        context.temporaryEffects = temporaryEffects;
        context.inactiveEffects = inactiveEffects;
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
    onRemoveItemsClick(event) {
        let removedItemsNumber = 0;
        for (const item of this.actor.items) {
            if (!["weapon", "wearable", "consumable", "common"].includes(item.type)) continue;
            item.delete();
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
    onEffectRemove(event) {
        event.preventDefault();

        const effectId = $(event.currentTarget).closest(".item").data("effect-id");
        const effect = this.actor.effects.get(effectId);

        effect.delete();
    }

}