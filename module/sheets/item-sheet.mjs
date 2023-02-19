import {PL1E} from "../helpers/config.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";

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
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @override */
    get template() {
        if (['consumable', 'common'].includes(this.item.type))
            return `systems/pl1e/templates/item/item-sheet.hbs`;
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
            if (this.item.getFlag('core','sourceId') === undefined) {
                buttons.unshift({
                    label: 'PL1E.ResetClones',
                    class: 'reset-clones',
                    icon: 'fas fa-clone',
                    onclick: () => Pl1eHelpers.resetClones(this.item._id)
                });
            }
        }
        return buttons;
    }

    /** @override */
    getData() {
        // Retrieve base data structure.
        const context = super.getData();

        // Use a safe clone of the item data for further operations.
        const itemData = context.item;

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Prepare character data and items.
        if (['feature', 'weapon', 'wearable'].includes(itemData.type)) {
            this._prepareSubItems(context);
        }

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        // Add the config data
        context.config = PL1E;

        // Add game access
        context.game = game;

        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Roll handlers, click handlers, etc. would go here.
        html.find(`.item-edit`).on("click", ev => Pl1eEvent.onItemEdit(ev, this.item));
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

        // Check item type and subtype
        let item = await Pl1eHelpers.getDragNDropTargetObject(event);
        if (!item || item.documentName !== "Item" || !["feature", "ability"].includes(item.type)) return;

        // Check if same item
        if (this.object._id === item._id) return;

        const data = item.toObject(false);

        this.document.addEmbedItem(data);
    }

    _prepareSubItems(context) {
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

        // Iterate through items, allocating to containers
        for (let [key, value] of context.item.system.subItemsMap) {
            value.img = value.img || DEFAULT_TOKEN;
            // Append to features.
            if (value.type === 'feature') {
                features.push(value);
            }
            // Append to abilities.
            else if (value.type === 'ability') {
                abilities[value.system.attributes.level.value].push(value);
            }
        }

        // Assign and return
        context.features = features;
        context.abilities = abilities;
    }

}