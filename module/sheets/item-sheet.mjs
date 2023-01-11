import {PL1E} from "../helpers/config.mjs";

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

    /** @inheritdoc */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);

        // Handle different data types
        switch (data.type) {
            case "Item":
                return this._onDropItem(event, data);
            case "Folder":
                return this._onDropFolder(event, data);
        }
    }

    /**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event            The concluding DragEvent which contains drop data
     * @param {object} data                The data transfer extracted from the event
     * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
     * @protected
     */
    async _onDropItem(event, data) {
        const item = await Item.implementation.fromDropData(data);

        const existingItems = foundry.utils.getProperty(this.data.configuration, this.options.dropKeyPath);

        // Abort if this uuid is the parent item
        if (item.uuid === this.item.uuid) {
            return ui.notifications.error(game.i18n.localize("DND5E.AdvancementItemGrantRecursiveWarning"));
        }

        // Abort if this uuid exists already
        if (existingItems.includes(item.uuid)) {
            return ui.notifications.warn(game.i18n.localize("DND5E.AdvancementItemGrantDuplicateWarning"));
        }

        await this.item.update({[`configuration.${this.options.dropKeyPath}`]: [...existingItems, item.uuid]});
        this.render();
    }

    /**
     * Handle dropping of a Folder on an Actor Sheet.
     * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {object} data         The data transfer extracted from the event
     * @returns {Promise<Item[]>}
     * @protected
     */
    async _onDropFolder(event, data) {
        if (!this.actor.isOwner) return [];
        if (data.documentName !== "Item") return [];
        const folder = await Folder.implementation.fromDropData(data);
        if (!folder) return [];
        return this._onDropItemCreate(folder.contents.map(item => {
            return game.items.fromCompendium(item);
        }));
    }

    /**
     * Handle deleting an existing Item entry from the Advancement.
     * @param {Event} event        The originating click event.
     * @returns {Promise<Item5e>}  The updated parent Item after the application re-renders.
     * @protected
     */
    async _onItemDelete(event) {
        event.preventDefault();
        const uuidToDelete = event.currentTarget.closest("[data-item-uuid]")?.dataset.itemUuid;
        if (!uuidToDelete) return;
        const items = foundry.utils.getProperty(this.advancement.data.configuration, this.options.dropKeyPath);
        const updates = {
            configuration: await this.prepareConfigurationUpdate({
                [this.options.dropKeyPath]: items.filter(uuid => uuid !== uuidToDelete)
            })
        };
        await this.advancement.update(updates);
        this.render();
    }

}