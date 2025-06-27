import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eHelpers as P1eHelpers, Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eItem} from "../documents/items/item.mjs";
import {PL1E} from "../pl1e.mjs";
import {PL1ESheetMixin} from "./sheet.mjs";
import {Pl1eTrade} from "../helpers/trade.mjs";
import {Pl1eFilter} from "../helpers/filter.mjs";

const FILTER_CATEGORIES = [
    "background", "features", "abilities", "effects",
    "weapons", "wearables", "consumables", "commons", "modules"
];

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Pl1eActorSheet extends PL1ESheetMixin(ActorSheet) {

    constructor(...args) {
        super(...args);
        this.openTooltips = new Set();
    }

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
                onclick: () => console.log("PL1E | content of actor sheet:", this)
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
        context.filters = await Pl1eFilter.getFilters(this.actor.id, FILTER_CATEGORIES);

        await this._prepareItems(context);

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
    async activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.actor));
        html.find(".effect-edit").on("click", ev => this._onEffectEdit(ev));
        html.find(".item-link").on("click", ev => this._onItemLink(ev));
        html.find(".item-origin").on("click", ev => this._onItemOrigin(ev));
        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));

        // Highlights indications
        html.find(".highlight-link").on("mouseenter", ev => Pl1eEvent.onCreateHighlights(ev));
        html.find(".highlight-link").on("mouseleave", ev => Pl1eEvent.onRemoveHighlights(ev));

        // Handle drag event items from owned actor
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('.item').each((i, div) => {
                div.setAttribute("draggable", true);
                div.addEventListener("dragstart", handler, false);
            });
        }
        // Handle drop event on a not owned actor
        else {
            html.find('.sheet-header, .sheet-tabs, .sheet-body').each((i, el) => {
                el.addEventListener('dragover', event => event.preventDefault());
                el.addEventListener('drop', this._onDrop.bind(this));
            });
        }

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Item filters
        const filters = await Pl1eFilter.getFilters(this.actor.id, FILTER_CATEGORIES);
        html.find(".item-filter-list").each((i, ul) => {
            this._initializeFilterItemList(ul, filters);
        });
        html.find(".item-filter").on("click", this._onToggleFilter.bind(this));

        // Item management
        html.find(".item-create").on("click", ev => Pl1eEvent.onItemCreate(ev, this.actor));
        html.find(".item-remove").on("click", ev => Pl1eEvent.onItemRemove(ev, this.actor));
        html.find(".item-favorite").on("click", ev => this._onItemFavorite(ev));
        html.find(".effect-remove").on("click", ev => this._onEffectRemove(ev));
        html.find(".convert-currency").on("click", ev => this._onConvertCurrency(ev));

        // Chat messages
        html.find(".skill-roll").on("click", ev => Pl1eEvent.onSkillRoll(ev, this.actor));

        // Custom controls
        html.find(".set-number").on("click", ev => Pl1eEvent.onSetNumber(ev, this.actor));
        html.find(".spin-number").on("click", ev => Pl1eEvent.onSpinNumber(ev, this.actor));
        html.find(".switch-boolean").on("click", ev => Pl1eEvent.onSwitchBoolean(ev, this.actor))
        html.find(".edit-number").on("click", ev => Pl1eEvent.onEditNumber(ev, this.actor));
        html.find(".edit-select").on("click", ev => Pl1eEvent.onEditSelect(ev, this.actor));
        html.find(".rank-control").on("click", ev => this._onRankChange(ev));
        html.find(".item-toggle").on("click", ev => this._onItemToggle(ev));
        html.find(".item-use").on("click", ev => this._onItemUse(ev));
        html.find(".item-reload").on("click", ev => this._onItemReload(ev));

        // Actor actions
        html.find('.open-journal').on('click', async ev => this._onOpenJournal(ev));
    }

    _onDragStart(event) {
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = this.actor.items.get(itemId);
        if (!item) return;

        const dragData = {
            type: "Item",
            uuid: item.uuid,
            sourceId: item.sourceId
        };

        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }


    _initializeFilterItemList(ul, filters) {
        const type = ul.dataset.filter;
        const set = filters[type] ?? new Set();
        ul.querySelectorAll(".item-filter").forEach(li => {
            if (set.has(li.dataset.filter)) li.classList.add("color-disabled");
        });
    }

    async _onToggleFilter(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const type = li.parentElement.dataset.filter;
        const value = li.dataset.filter;

        await Pl1eFilter.toggleFilter(this.actor.id, type, value);
        this.render();
    }

    /** @inheritDoc */
    async _onDrop(event) {
        // Check item type and subtype
        const rawData = event.dataTransfer?.getData("text/plain");
        if (!rawData) return;
        const data = JSON.parse(rawData);

        let document = await fromUuid(data.uuid)
        const fromMerchant = foundry.utils.getProperty(data, "flags.pl1e.fromMerchant");
        if (!fromMerchant && !document.isEmbedded && !document.isOwner) {
            ui.notifications.info(game.i18n.localize("PL1E.NotOwnedDocument"));
            return;
        }

        if (data.type === "Item") {
            if (data.flags?.pl1e?.fromMerchant && data.itemData) {
                const item = new CONFIG.Item.documentClass(data.itemData, { parent: null });

                item.flags = foundry.utils.mergeObject(item.flags ?? {}, {
                    pl1e: data.flags.pl1e
                });

                await this._addItem(item);
            }
            else {
                await this._onDropItem(event, data);
            }
        } else {
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

        if (item.isEmbedded) {
            // Gift between 2 actors
            if (!this.actor.isOwner || !item.isOwner) {
                if (!Pl1eHelpers.isGMConnected()) {
                    ui.notifications.info(game.i18n.localize("PL1E.NoGMConnected"));
                    return;
                }

                // One is not owned then via socket
                PL1E.socket.executeAsGM("giftItem", {
                    sourceActorUuid: item.parent.uuid,
                    targetActorUuid: this.actor.uuid,
                    itemId: item.id
                });
            } else {
                // GM or same player dont need socket
                await Pl1eTrade.giftItem(item.parent, this.actor, item);
            }
        } else {
            // Merchant buy
            if (foundry.utils.getProperty(item, "flags.pl1e.fromMerchant")) {
                const merchantEntryPage = await Pl1eHelpers.getDocument("JournalEntryPage", item.getFlag("pl1e", "merchantPageId"))
                await Pl1eTrade.buyItem(this.actor, merchantEntryPage, item);
            }
            // New item dropped
            else {
                const originalItem = item.compendium ? item : await Pl1eHelpers.getDocument("Item", item.id);
                await this.actor.addItem(originalItem);
            }
        }
    }

    /**
     * Organize and classify Items and Effects for Character sheets.
     * @param {Object} context The actor to prepare.
     * @return {undefined}
     */
    async _prepareItems(context) {
        // Initialize expected collections in the context
        Object.assign(context, {
            background: [],
            features: [],
            abilities: [],
            weapons: [],
            wearables: [],
            consumables: [],
            commons: [],
            modules: []
        });

        // Categorize all items into their respective collections
        context = await Pl1eHelpers.categorizeItems(context, context.items);

        // Once all items are categorized, select the representatives
        context = await Pl1eHelpers.selectRepresentativeItems(context);

        // Sort each type of item
        context = Pl1eHelpers.sortDocuments(context);

        // Update the context with money
        const moneyConfig = P1eHelpers.getConfig("money");
        context.money = Object.keys(moneyConfig).map(key => {
            const currency = moneyConfig[key];
            return {
                id: key,
                amount: foundry.utils.getProperty(context, currency.path),
                label: game.i18n.localize(currency.label),
                img: currency.img,
                path: currency.path,
                conversions: Object.entries(currency.conversions).map(([targetKey, value]) => ({
                    icon: moneyConfig[targetKey].icon,
                    tooltip: game.i18n.localize(moneyConfig[targetKey].label),
                    label: value
                })),
                controls: currency.controls
            };
        });

        // Update the context with favorites currencies
        context.favoritesMoney = context.money.filter(currency => this.actor.isFavorite("currencies", currency.id));

        // Update the context with favorites items
        context.favoritesAbilities = context.abilities.filter(item => this.actor.isFavorite("items", item.sourceId));
        context.favoritesWeapons = context.weapons.filter(item => this.actor.isFavorite("weapons", item.id));
        context.favoritesWearables = context.wearables.filter(item => this.actor.isFavorite("items", item.sourceId));
        context.favoritesConsumables = context.consumables.filter(item => this.actor.isFavorite("items", item.sourceId));
        context.favoritesCommons = context.commons.filter(item => this.actor.isFavorite("items", item.sourceId));
        context.favoritesModules = context.modules.filter(item => this.actor.isFavorite("items", item.sourceId));

        // Finish with filters
        context.background = Pl1eFilter.filterDocuments(context.background, context.filters.background);
        context.features = Pl1eFilter.filterDocuments(context.features, context.filters.features);
        context.abilities = Pl1eFilter.filterDocuments(context.abilities, context.filters.abilities);
        context.effects = Pl1eFilter.filterDocuments(context.effects, context.filters.effects);
        context.weapons = Pl1eFilter.filterDocuments(context.weapons, context.filters.weapons);
        context.wearables = Pl1eFilter.filterDocuments(context.wearables, context.filters.wearables);
        context.consumables = Pl1eFilter.filterDocuments(context.consumables, context.filters.consumables);
        context.commons = Pl1eFilter.filterDocuments(context.commons, context.filters.commons);
        context.modules = Pl1eFilter.filterDocuments(context.modules, context.filters.modules);
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

        const main = $(event.currentTarget).data("main");
        const options = (main !== undefined) ? { main } : {};

        if (item.canToggle()) {
            await item.toggle(options);
        }
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

    async _onItemFavorite(ev) {
        const type = $(ev.currentTarget).data("favorite-type");
        const id = $(ev.currentTarget).data("favorite-id");
        if (!type || !id) return;

        const isFav = this.actor.isFavorite(type, id);
        await this.actor.toggleFavorite(type, id, !isFav);
        await this.render();
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
}