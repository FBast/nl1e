import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eFormValidation} from "../helpers/formValidation.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Pl1eItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pl1e", "sheet", "item"],
            width: 520,
            height: 480,
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    get template() {
        return `systems/pl1e/templates/item/item-${this.item.type}-sheet.hbs`;
    }

    /**
     * Custom header buttons
     * @returns {Application.HeaderButton[]}
     * @private
     */
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        if (game.user.isGM) {
            if (!this.item.isOriginal) {
                buttons.unshift({
                    label: 'PL1E.OpenOriginal',
                    class: 'open-original',
                    icon: 'fas fa-copy',
                    onclick: async () => {
                        const sourceUuid = this.item.getFlag('core', 'sourceUuid');
                        const item = await fromUuid(sourceUuid);
                        await this.close();
                        item.sheet.render(true);
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

    async _updateObject(event, formData) {
        await super._updateObject(event, formData);

        // Reset Clones
        await Pl1eHelpers.resetClones(this.item);
    }

    /** @override */
    getData() {
        // Retrieve base data structure.
        const context = super.getData();

        // Use a safe clone of the item data for further operations.
        const itemData = context.item;

        // If the user is not a GM the sheet is not editable
        // this.options.editable = game.user.isGM;

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Prepare refItems
        this._prepareItems(context);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        // Add the config data
        context.config = CONFIG.PL1E;

        // Add game access
        context.game = game;

        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Form validation
        Pl1eFormValidation.positiveDecimal();

        // Roll handlers, click handlers, etc. would go here.
        html.find(`.item-edit`).on("click", ev => Pl1eEvent.onItemEdit(ev, this.item));
        html.find(`.item-delete`).on("click", ev => Pl1eEvent.onItemDelete(ev, this.item));
        html.find('.item-tooltip-activate').on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find('.currency-control').on("click", ev => Pl1eEvent.onCurrencyChange(ev, this.item));
        html.find('.attribute-add').on("click", ev => Pl1eEvent.onAttributeAdd(ev, this.item))
        html.find('.attribute-remove').on("click", ev => Pl1eEvent.onAttributeRemove(ev, this.item))
        html.find('.aspect-add').on("click", ev => this.onAspectAdd(ev))
        html.find('.aspect-remove').on("click", ev => this.onAspectRemove(ev))
    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @private
     */
    async _onDrop(event) {
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Check item type and subtype
        let data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        let item = await fromUuid(data.uuid);
        if (!item) {
            console.log(`PL1E | No item found with UUID ${data}`);
            return;
        }

        if (CONFIG.PL1E.items[this.item.type].droppable.includes(item.type)) {
            await this.item.addRefItem(item);
        }
    }

    _prepareItems(context) {
        // Get ref items using uuid
        const items = [];
        for (let i = 0; i < this.item.system.refItemsUuids.length; i++) {
            const uuid = this.item.system.refItemsUuids[i];
            const item = game.items.find(item => item.uuid === uuid);
            if (item) items[i] = item;
            // else throw new Error(`PL1E | Cannot find item with uuid : ${uuid}`)
        }

        // Initialize containers.
        const features = [];
        let abilities = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        // Iterate through refItems, allocating to containers
        for (const item of items) {
            // Append to features
            if (item.type === 'feature') {
                features.push(item);
            }
            // Append to abilities
            else if (item.type === 'ability') {
                abilities[item.system.attributes.level.value].push(item);
            }
        }

        // Assign and return
        context.features = features;
        context.abilities = abilities;
        context.passiveAspects = this.item.system.passiveAspects;
        context.activeAspects = this.item.system.activeAspects;
        context.passiveAspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
        context.activeAspectsObjects = CONFIG.PL1E.activeAspectsObjects;
    }

    async onAspectAdd(event) {
        event.preventDefault();
        event.stopPropagation();

        const aspectId = $(event.currentTarget).data("aspect-id");
        const aspectType = $(event.currentTarget).data("aspect-type");

        let target;
        let aspectsObjects;
        switch (aspectType) {
            case "passive":
                target = "passiveAspects";
                aspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
                break;
            case "active":
                target = "activeAspects";
                aspectsObjects = CONFIG.PL1E.activeAspectsObjects;
                break;
        }

        await this.item.update({
            [`system.${target}.${randomID()}`]: aspectsObjects[aspectId]
        })
    }

    async onAspectRemove(event) {
        event.preventDefault();
        event.stopPropagation();

        const aspectId = $(event.currentTarget).closest(".item").data("aspect-id");
        const aspectType = $(event.currentTarget).closest(".item").data("aspect-type");

        let target;
        let aspectsObjects;
        switch (aspectType) {
            case "passive":
                target = "passiveAspects";
                aspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
                break;
            case "active":
                target = "activeAspects";
                aspectsObjects = CONFIG.PL1E.activeAspectsObjects;
                break;
        }

        await this.item.update({
            [`system.${target}.-=${aspectId}`]: null
        });
    }

}