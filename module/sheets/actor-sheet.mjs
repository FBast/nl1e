import {Pl1eEvent} from "../helpers/events.mjs";
import {AppResting} from "../apps/resting.mjs";
import {Pl1eEffect} from "../helpers/effects.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Pl1eActorSheet extends ActorSheet {

    /** @override */
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

    /** @override */
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
            if (this.actor.type === 'character') {
                buttons.unshift({
                    label: 'PL1E.CreationMod',
                    class: 'reset-clones',
                    icon: this.actor.system.general.creationMod ? 'fas fa-toggle-on' : 'fas fa-toggle-off',
                    onclick: async () => {
                        const appRestingForm = Object.values(ui.windows)
                            .find(w => w instanceof AppResting);
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
                class: 'debug',
                icon: 'fas fa-ban-bug',
                onclick: () => console.log(this)
            });
        }
        return buttons;
    }

    /** @override */
    getData() {
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

        this._prepareItems(context);

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();
        // Prepare active effects
        context.effects = Pl1eEffect.prepareActiveEffectCategories(this.actor.effects);
        // Add the config data
        context.config = CONFIG.PL1E;
        // Add game access
        context.game = game;

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').on("click", ev => Pl1eEvent.onItemEdit(ev, this.actor));
        html.find('.item-buy').on("click", ev => Pl1eEvent.onItemBuy(ev, this.actor));

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Item management
        html.find('.item-create').on("click", ev => Pl1eEvent.onItemCreate(ev, this.actor));
        html.find('.item-remove').on("click", ev => Pl1eEvent.onItemRemove(ev, this.actor));
        html.find('.item-tooltip-activate').on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find('.item-link').on("click", ev => this.onItemLink(ev));

        // Active Effect management
        html.find(".effect-control").on("click", ev => Pl1eEvent.onManageActiveEffect(ev, this.actor));

        // Chat messages
        html.find('.skill-roll').on("click", ev => Pl1eEvent.onSkillRoll(ev, this.actor));

        // Currency
        html.find('.currency-control').on("click", ev => Pl1eEvent.onCurrencyChange(ev, this.actor));
        html.find('.currency-convert').on("click", ev => Pl1eEvent.onMoneyConvert(ev, this.actor));

        // Highlights indications
        html.find('.highlight-link').on("mouseenter", ev => Pl1eEvent.onCreateHighlights(ev));
        html.find('.highlight-link').on("mouseleave", ev => Pl1eEvent.onRemoveHighlights(ev));

        // Custom controls
        html.find('.characteristic-control').on("click", ev => this.onCharacteristicChange(ev));
        html.find('.rank-control').on("click", ev => this.onRankChange(ev));
        html.find(".item-toggle").on("click", ev => Pl1eEvent.onItemToggle(ev, this.actor));
        html.find(".item-use").on("click", ev => this.onItemUse(ev));
        html.find(".consumable-reload").on("click", ev => this.onReloadConsumable(ev));

        // Button actions
        html.find(".button-camping").on("click", ev => this.onCampingClick(ev));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("subItems-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    /**
     * Handle drop of items and refItems
     * @param event
     * @param data
     * @returns {Promise<unknown>}
     * @private
     */
    async _onDropItem(event, data) {
        const item = await Item.implementation.fromDropData(data);

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
            CONFIG.PL1E.socket.executeAsGM('sendItem', {
                sourceActorId: game.user.character._id,
                targetActorId: this.actor._id,
                itemId: item._id
            });
        }
        // Other cases
        else {
            await this.actor.addItem(item);
            // Delete the source item if it is embedded
            if (item.isOwned) await item.parent.deleteItem(item);
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} context The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareItems(context) {
        // Initialize containers.
        const weapons = [];
        const wearables = [];
        const consumables = [];
        const commons = [];
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
        const sourceUuidFlags = [];
        for (let item of context.items) {
            const sourceUuidFlag = item.flags.core ? item.flags.core.sourceUuid : null;
            // Append to item categories
            if (item.type === 'weapon') {
                weapons.push(item);
            }
            else if (item.type === 'wearable') {
                wearables.push(item);
            }
            else if (item.type === 'consumable') {
                // Increase units
                if (sourceUuidFlags.includes(sourceUuidFlag)) {
                    const sameItem = consumables.find(item => item.flags.core.sourceUuid === sourceUuidFlag);
                    sameItem.system.units++;
                }
                else {
                    consumables.push(item);
                }
            }
            else if (item.type === 'common') {
                // Increase units
                if (sourceUuidFlags.includes(sourceUuidFlag)) {
                    const sameItem = commons.find(item => item.flags.core.sourceUuid === sourceUuidFlag);
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
                // Increase units
                if (sourceUuidFlags.includes(sourceUuidFlag)) {
                    const sameItem = abilities[item.system.attributes.level.value].find(item => item.flags.core.sourceUuid === sourceUuidFlag);
                    sameItem.system.units++;
                }
                else {
                    abilities[item.system.attributes.level.value].push(item);
                }
            }
            // Push sourceUuid flag to handle duplicates
            if (sourceUuidFlag && !sourceUuidFlags.includes(sourceUuidFlag)) sourceUuidFlags.push(sourceUuidFlag);
        }

        // Assign and return
        context.weapons = weapons;
        context.wearables = wearables;
        context.consumables = consumables;
        context.commons = commons;
        context.features = features;
        context.abilities = abilities;
    }

    /**
     * Use an ability
     * @param {Event} event The originating click event
     */
    async onItemUse(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
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
    async onReloadConsumable(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);

        try {
            await item.reload();
        }
        catch (e) {
            console.error(e);
        }
    }

    async onCampingClick(event) {
        const formApp = Object.values(ui.windows)
            .find(w => w instanceof AppResting);
        if (formApp) return;

        if (this.actor.system.general.creationMod) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoCampingInCreationMod"));
            return;
        }

        const app = new AppResting(this.actor, {
            title: `${game.i18n.localize("PL1E.Camping")} : ${this.actor.name}`,
        });
        app.render(true);
    }

    /**
     * Render the linked parent item
     * @param {Event} event
     */
    async onItemLink(event) {
        event.preventDefault();
        event.stopPropagation();

        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = this.actor.items.get(itemId);
        const sourceUuid = item.sourceUuid;

        // Render multiple parent in case of child stack
        let sheetPosition = Pl1eHelpers.screenCenter();
        for (const otherItem of this.actor.items) {
            const childId = otherItem.childId;
            const otherSourceUuid = otherItem.sourceUuid;
            if (childId && otherSourceUuid === sourceUuid) {
                const parentItem = this.actor.items.find(item => item.parentId === childId);
                parentItem.sheet.render(true, {left: sheetPosition.x, top: sheetPosition.y});
                sheetPosition.x += 30;
                sheetPosition.y += 30;
            }
        }
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

}
