import {PL1E} from "../helpers/config.mjs";
import {HelpersPl1e} from "../helpers/helpers.js";

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
        const path = "systems/pl1e/templates/item";
        // Return a single sheet for all item types.
        // return `${path}/item-sheet.hbs`;

        // Alternatively, you could use the following return statement to do a
        // unique item sheet by type, like `weapon-sheet.hbs`.
        return `${path}/item-${this.item.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */

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
        if (itemData.type === 'feature' || itemData.type === 'item') {
            this.#_prepareSubItems(context);
        }

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        // Add the config data
        context.config = PL1E;

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Roll handlers, click handlers, etc. would go here.
        html.find(`.item-edit`).on("click", this.#_editSubItem.bind(this));
        html.find(`.item-delete`).on("click", this.#_deleteSubItem.bind(this));
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
        let item = await HelpersPl1e.getDragNDropTargetObject(event);
        if (!item || item.documentName !== "Item" || !["feature", "ability"].includes(item.type)) return;

        // Check if same item
        if (this.object._id === item._id) return;

        const data = item.toObject(false);

        this.document.addEmbedItem(data);
    }

    #_prepareSubItems(context) {
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
                if (value.system.level != undefined) {
                    abilities[value.system.level].push(value);
                }
            }
        }

        // Assign and return
        context.features = features;
        context.abilities = abilities;
    }

    /**
     * Add a embed item
     * @param {Event} event
     * @private
     */
    #_editSubItem(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = $(event.currentTarget).data("item-id");
        const item = this.document.getEmbedItem(itemId);
        if (item) {
            item.sheet.render(true);
        }
    }

    /**
     * Delete a embed item
     * @param {Event} event
     * @private
     */
    #_deleteSubItem(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = $(event.currentTarget).data("item-id");
        const item = this.document.getEmbedItem(itemId);
        if (!item) {
            return;
        }
        for (let [key, value] of this.item.system.subItemsMap) {
            if (value === item || value.system.childId !== item.system.parentId) continue;
            this.document.deleteEmbedItem(value._id);
        }
        this.document.deleteEmbedItem(itemId);
    }

}