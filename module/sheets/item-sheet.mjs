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
        // Retrieve base data structure.
        const context = super.getData();

        // Use a safe clone of the item data for further operations.
        const itemData = context.item;

        // If the sheet is not an original then disable edition
        this.options.editable = this.item.isOriginal;

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Prepare character data and refItems.
        if (['feature', 'weapon', 'wearable'].includes(itemData.type)) {
            this._prepareRefItems(context);
        }

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
        html.find(`.item-edit`).on("click", ev => Pl1eEvent.onItemEdit(ev));
        html.find(`.item-delete`).on("click", ev => Pl1eEvent.onItemDelete(ev, this.item));
        html.find('.currency-control').on("click", ev => Pl1eEvent.onCurrencyChange(ev, this.item));
        html.find('.attribute-add').on("click", ev => Pl1eEvent.onAttributeAdd(ev, this.item))
        html.find('.attribute-remove').on("click", ev => Pl1eEvent.onAttributeRemove(ev, this.item))
    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @private
     */
    async _onDrop(event) {
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Get the item associated to the drop
        const data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        /** @type {Pl1eItem} */
        const item = await fromUuid(data.uuid);

        // Return if item cannot embed
        if (!this.item.system.embeddable.includes(item.type)) return;

        // Return if same item
        if (this.item._id === item._id) return;

        await item.addRefItem(this.item);
    }

    _prepareRefItems(context) {
        // Initialize containers.
        const features = [];
        const abilities = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        // Iterate through refItems, allocating to containers
        for (let refItem of context.item.system.refItems) {
            // Append to features.
            if (refItem.type === 'feature') {
                features.push(refItem);
            }
            // Append to abilities.
            else if (refItem.type === 'ability') {
                abilities[refItem.system.attributes.level.value].push(refItem);
            }
        }

        // Assign and return
        context.features = features;
        context.abilities = abilities;
    }

}