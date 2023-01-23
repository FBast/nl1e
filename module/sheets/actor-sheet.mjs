import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

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
            width: 800,
            height: 850,
            scrollY: [
                ".stats",
                ".features",
                ".items",
                ".effects"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @override */
    get template() {
        return `systems/pl1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;
        context.items = actorData.items;

        // Prepare character data and items.
        if (actorData.type === 'character') {
            this.#_prepareItems(context);
        }

        // Prepare NPC data and items.
        if (actorData.type === 'npc') {
            this.#_prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.actor.effects);

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const parentItem = this.actor.items.get(li.data("itemId"));
            for (let item of this.actor.items) {
                if (parentItem === item || item.system.childId === undefined) continue;
                if (parentItem.system.parentId !== item.system.childId) continue;
                item.delete();
            }
            parentItem.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Active Effect management
        html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

        // Rollable characteristic.
        html.find('.rollable').click(this.#_onRoll.bind(this));

        // Items management
        html.find(".item-toggle").click(this._onToggleItem.bind(this));

        // Highlights indications
        html.find('.resource-label,.characteristic-label,.skill-label').mouseenter(this.#_onCreateHighlights.bind(this));
        html.find('.resource-label,.characteristic-label,.skill-label').mouseleave(this.#_onRemoveHighlights.bind(this));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    /**
     * Handle sub items to be added as other items
     * @param event
     * @param data
     * @returns {Promise<unknown>}
     * @private
     */
    async _onDropItem(event, data) {
        if ( !this.actor.isOwner ) return false;
        const item = await Item.implementation.fromDropData(data);
        const itemData = item.toObject();
        const newItem = await this._onDropItemCreate(item);
        if (itemData.system.subItemsMap !== undefined && itemData.system.subItemsMap.length > 0) {
            let linkedId = randomID();
            await newItem[0].update({'system.parentId': linkedId});
            for (let subItem of itemData.system.subItemsMap) {
                const newSubItem = await this._onDropItemCreate(subItem);
                await newSubItem[0].update({'system.childId': linkedId});
            }
        }
        // Create the owned item
        return newItem;
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.

        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system["type"];

        // Finally, create the item!
        return await Item.create(itemData, {parent: this.actor});
    }

    /**
     * Handle toggling the state of an Owned Item within the Actor.
     * @param {Event} event        The triggering click event.
     * @returns {Promise<Item5e>}  Item with the updates applied.
     * @private
     */
    _onToggleItem(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        // const attr = item.type === "spell" ? "system.preparation.prepared" : "system.equipped";
        return item.update({["system.isEquipped"]: !foundry.utils.getProperty(item, "system.isEquipped")});
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    #_onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle item rolls.
        if (dataset.rollType) {
            if (dataset.rollType == 'item') {
                const itemId = element.closest('.item').dataset.itemId;
                const item = this.actor.items.get(itemId);
                if (item) return item.roll();
            }
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[ability] ${dataset.label}` : '';
            let roll = new Roll(dataset.roll, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor: this.actor}),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
            });
            return roll;
        }
    }

    /**
     * Create highlights
     * @param event
     * @private
     */
    #_onCreateHighlights(event) {
        event.preventDefault();
        event.stopPropagation();
        let resources = $(event.currentTarget).data("resources");
        let characteristics = $(event.currentTarget).data("characteristics");
        let skills = $(event.currentTarget).data("skills");
        // resources
        if (resources !== undefined) {
            for (let resource of document.getElementsByClassName('resource-label')) {
                let id = $(resource).data("id");
                if (!resources.includes(id)) continue;
                resource.classList.add('highlight');
            }
        }
        // characteristics
        if (characteristics !== undefined) {
            for (let characteristic of document.getElementsByClassName('characteristic-label')) {
                let id = $(characteristic).data("id");
                if (!characteristics.includes(id)) continue;
                characteristic.classList.add('highlight');
            }
        }
        // skills
        if (skills !== undefined) {
            for (let skill of document.getElementsByClassName('skill-label')) {
                let id = $(skill).data("id");
                if (!skills.includes(id)) continue;
                skill.classList.add('highlight');
            }
        }
    }

    /**
     * Remove highlights
     * @param event
     * @private
     */
    #_onRemoveHighlights(event) {
        event.preventDefault();
        event.stopPropagation();
        for (let characteristic of document.getElementsByClassName('characteristic-label')) {
            characteristic.classList.remove('highlight')
        }
        for (let resource of document.getElementsByClassName('resource-label')) {
            resource.classList.remove('highlight')
        }
        for (let skill of document.getElementsByClassName('skill-label')) {
            skill.classList.remove('highlight')
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} context The actor to prepare.
     *
     * @return {undefined}
     */
    #_prepareItems(context) {
        // Initialize containers.
        const gear = [];
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
        for (let item of context.items) {
            item.img = item.img || DEFAULT_TOKEN;
            // Append to gear.
            if (['weapon','wearable','consumable','item'].includes(item.type)) {
                gear.push(item);
            }
            // Append to features.
            else if (item.type === 'feature') {
                features.push(item);
            }
            // Append to abilities.
            else if (item.type === 'ability') {
                if (item.system.level !== undefined) {
                    abilities[item.system.level].push(item);
                }
            }
        }

        // Assign and return
        context.gear = gear;
        context.features = features;
        context.abilities = abilities;
    }

}
