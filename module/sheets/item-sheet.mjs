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
        if (itemData.type == 'feature') {
            this._prepareItems(context);
        }

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        // Add the config data
        context.sizes = PL1E.sizes;

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Roll handlers, click handlers, etc. would go here.
        html.find(`.item-edit`).on("click", this._editSubItem.bind(this));
        html.find(`.item-delete`).on("click", this._deleteSubItem.bind(this));
    }

    _prepareItems(context) {
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

        // Prepare OwnedItems
        context.items = this._prepareEmbedItems(context.item.system.itemsMap);

        // Iterate through items, allocating to containers
        for (let i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;
            // Append to features.
            if (i.type === 'feature') {
                features.push(i);
            }
            // Append to abilities.
            else if (i.type === 'ability') {
                if (i.system.level != undefined) {
                    abilities[i.system.level].push(i);
                }
            }
        }

        // Assign and return
        context.features = features;
        context.abilities = abilities;
    }

    /**
     * Prepare Embed items
     * @param {[]|Map} itemsMap
     * @return {[]}
     * @private
     */
    _prepareEmbedItems(itemsMap) {
        let itemsList = itemsMap;
        if (itemsMap instanceof Map) {
            itemsList = Array.from(itemsMap).map(([id, item]) => item);
        }

        // Sort by rank desc
        //itemsList.sort((a, b) => (b.system.rank || 0) - (a.system.rank || 0));

        return itemsList;
    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @private
     */
    async _onDrop(event) {
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) {
            return;
        }

        // Check item type and subtype
        let item = await HelpersPl1e.getDragnDropTargetObject(event);
        if (!item || item.documentName !== "Item" || !["feature", "ability"].includes(item.type)) {
            return;
        }

        const data = item.toObject(false);

        this.document.addEmbedItem(data);
    }

    /**
     * Add a embed item
     * @param {Event} event
     * @private
     */
    _editSubItem(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = $(event.currentTarget).data("item-id");
        const item = this.document.items.get(itemId);
        if (item) {
            item.sheet.render(true);
        }
    }

    /**
     * Delete a embed item
     * @param {Event} event
     * @private
     */
    _deleteSubItem(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = $(event.currentTarget).data("item-id");
        const item = this.document.getEmbedItem(itemId);
        if (!item) {
            return;
        }
        this.document.deleteEmbedItem(itemId);
    }

}