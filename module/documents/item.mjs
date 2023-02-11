import {HelpersPl1e} from "../helpers/helpers.js";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Pl1eItem extends Item {

    /** @override */
    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);
        const updateData = {};
        if (data.img === undefined) {
            const img = CONFIG.PL1E.defaultIcons[data.type];
            if (img) updateData['img'] = img;
        }
        if (data.name.includes("New Item")) {
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (name) updateData['name'] = name;
        }
        await this.updateSource(updateData);
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
        // As with the actor class, items are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).
        super.prepareData();

        // Prepare Embed items
        if (!(this.system.subItemsMap instanceof Map)) {
            const itemsData = Array.isArray(this.system.subItemsMap) ? this.system.subItemsMap : [];
            this.system.subItemsMap = new Map();

            itemsData.forEach((item) => {
                this.addEmbedItem(item, { save: false, newId: false });
            });
        }
    }

    /** @override */
    prepareBaseData() {
        const system = this.system;
        // Merge config data
        system.attributes = HelpersPl1e.mergeDeep(system.attributes, CONFIG.PL1E.attributes);
        system.price = HelpersPl1e.mergeDeep(system.price, CONFIG.PL1E.currency);
    }

    /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        if (!this.actor) return null;
        const rollData = this.actor.getRollData();
        // Grab the item's system data as well.
        rollData.item = foundry.utils.deepClone(this.system);
        return rollData;
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    async roll() {
        const item = this;

        // Initialize chat data.
        const speaker = ChatMessage.getSpeaker({actor: this.actor});
        const rollMode = game.settings.get('core', 'rollMode');
        const label = `[${item.type}] ${item.name}`;

        // If there's no roll data, send a chat message.
        if (!this.system.formula) {
            ChatMessage.create({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
                content: item.system.description ?? ''
            });
        }
        // Otherwise, create a roll and send a chat message from it.
        else {
            // Retrieve roll data.
            const rollData = this.getRollData();

            // Invoke the roll and submit it to chat.
            const roll = new Roll(rollData.item.formula, rollData);
            // If you need to store the value first, uncomment the next line.
            // let result = await roll.roll({async: true});
            roll.toMessage({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
            });
            return roll;
        }
    }

    // ***** Embedded items management *****

    /**
     * A reference to the Collection of embedded Item instances in the document, indexed by _id.
     * @returns {Collection<BaseItem>}
     */
    get subItemsMap() {
        return this.system.subItemsMap || new Map();
    }

    /**
     * Shortcut for this.items.get
     * @param id
     * @return {Pl1eItem|null}
     */
    getEmbedItem(id) {
        return this.subItemsMap?.get(id) || null;
    }

    /**
     * Add a Embed Item
     * @param {Pl1eItem} item Object to add
     * @param {string} childId link id between parent and children
     * @param {boolean} save   if we save in db or not (used internally)
     * @param {boolean} newId  if we change the id
     * @return {Promise<string>}
     */
    async addEmbedItem(item, { childId = undefined, save = true, newId = true } = {}) {
        if (!item) return;

        if (!(item instanceof Item) && item?.name && item?.type) {
            // Data -> Item
            item = new Pl1eItem(item);
        }

        // New id
        if (newId || !item._id) {
            // Bypass the readonly for "_id"
            const tmpData = item.toJSON();
            tmpData._id = foundry.utils.randomID();
            item = new Pl1eItem(tmpData);
        }

        // Copy the parent permission to the sub item
        // In v10 actor's items inherit the ownership from the actor, but theirs ownership do not reflect that.
        // So we must take actor's ownership for sub-item
        item.ownership = this.actor?.ownership ?? this.ownership;

        // Add child id if defined
        if (childId !== undefined) item.system.childId = childId;

        // If this item has sub items
        if (item.system.subItemsMap !== undefined && item.system.subItemsMap.size > 0 && childId === undefined) {
            let linkId = randomID();
            item.system.parentId = linkId;
            for (let [key, subItem] of item.system.subItemsMap) {
                await this.addEmbedItem(subItem, { childId : linkId });
            }
        }

        // Object
        this.system.subItemsMap.set(item._id, item);

        if (save) {
            await this.saveEmbedItems();
        }
        return item._id;
    }

    /**
     * Save all the Embed Items
     * @return {Promise<void>}
     */
    async saveEmbedItems() {
        await this.update({
            "system.subItemsMap": Array.from(this.system.subItemsMap).map(([id, item]) => item.toObject(false)),
        });
        this.sheet.render(false);
    }

    /**
     * Delete the Embed Item and clear the actor bonus if any
     * @param id Item id
     * @param {boolean} save   if we save in db or not (used internally)
     * @return {Promise<void>}
     */
    async deleteEmbedItem(id, { save = true} = {}) {
        if (!this.system.subItemsMap.has(id)) {
            return;
        }

        // Remove the embed item
        this.system.subItemsMap.delete(id);

        if (save) {
            await this.saveEmbedItems();
        }
    }

    /**
     * Trigger an item usage, optionally creating a chat message with followup actions.
     * @param {ItemUseConfiguration} [config]      Initial configuration data for the usage.
     * @param {ItemUseOptions} [options]           Options used for configuring item usage.
     * @returns {Promise<ChatMessage|object|void>} Chat message if options.createMessage is true, message data if it is
     *                                             false, and nothing if the roll wasn't performed.
     */
    async use(config={}, options={}) {
        let item = this;
        const is = item.system;
        const as = item.actor.system;

        console.log("Macro Item is not implemented yet !");

        // // Ensure the options object is ready
        // options = foundry.utils.mergeObject({
        //     configureDialog: true,
        //     createMessage: true,
        //     flags: {}
        // }, options);
        //
        // // Reference aspects of the item data necessary for usage
        // const resource = is.consume || {};        // Resource consumption
        // const isSpell = item.type === "spell";    // Does the item require a spell slot?
        // const requireSpellSlot = isSpell && (is.level > 0) && CONFIG.DND5E.spellUpcastModes.includes(is.preparation.mode);
        //
        // // Define follow-up actions resulting from the item usage
        // config = foundry.utils.mergeObject({
        //     createMeasuredTemplate: item.hasAreaTarget,
        //     consumeQuantity: is.uses?.autoDestroy ?? false,
        //     consumeRecharge: !!is.recharge?.value,
        //     consumeResource: !!resource.target && (!item.hasAttack || (resource.type !== "ammo")),
        //     consumeSpellLevel: requireSpellSlot ? is.preparation.mode === "pact" ? "pact" : is.level : null,
        //     consumeSpellSlot: requireSpellSlot,
        //     consumeUsage: !!is.uses?.per
        // }, config);
        //
        // // Display a configuration dialog to customize the usage
        // if ( config.needsConfiguration === undefined ) config.needsConfiguration = config.createMeasuredTemplate
        //     || config.consumeRecharge || config.consumeResource || config.consumeSpellSlot || config.consumeUsage;
        //
        // /**
        //  * A hook event that fires before an item usage is configured.
        //  * @function dnd5e.preUseItem
        //  * @memberof hookEvents
        //  * @param {Item5e} item                  Item being used.
        //  * @param {ItemUseConfiguration} config  Configuration data for the item usage being prepared.
        //  * @param {ItemUseOptions} options       Additional options used for configuring item usage.
        //  * @returns {boolean}                    Explicitly return `false` to prevent item from being used.
        //  */
        // if ( Hooks.call("dnd5e.preUseItem", item, config, options) === false ) return;
        //
        // // Display configuration dialog
        // if ( (options.configureDialog !== false) && config.needsConfiguration ) {
        //     const configuration = await AbilityUseDialog.create(item);
        //     if ( !configuration ) return;
        //     foundry.utils.mergeObject(config, configuration);
        // }
        //
        // // Handle spell upcasting
        // if ( isSpell && (config.consumeSpellSlot || config.consumeSpellLevel) ) {
        //     const upcastLevel = config.consumeSpellLevel === "pact" ? as.spells.pact.level
        //         : parseInt(config.consumeSpellLevel);
        //     if ( upcastLevel && (upcastLevel !== is.level) ) {
        //         item = item.clone({"system.level": upcastLevel}, {keepId: true});
        //         item.prepareData();
        //         item.prepareFinalAttributes();
        //     }
        // }
        //
        // /**
        //  * A hook event that fires before an item's resource consumption has been calculated.
        //  * @function dnd5e.preItemUsageConsumption
        //  * @memberof hookEvents
        //  * @param {Item5e} item                  Item being used.
        //  * @param {ItemUseConfiguration} config  Configuration data for the item usage being prepared.
        //  * @param {ItemUseOptions} options       Additional options used for configuring item usage.
        //  * @returns {boolean}                    Explicitly return `false` to prevent item from being used.
        //  */
        // if ( Hooks.call("dnd5e.preItemUsageConsumption", item, config, options) === false ) return;
        //
        // // Determine whether the item can be used by testing for resource consumption
        // const usage = item._getUsageUpdates(config);
        // if ( !usage ) return;
        //
        // /**
        //  * A hook event that fires after an item's resource consumption has been calculated but before any
        //  * changes have been made.
        //  * @function dnd5e.itemUsageConsumption
        //  * @memberof hookEvents
        //  * @param {Item5e} item                     Item being used.
        //  * @param {ItemUseConfiguration} config     Configuration data for the item usage being prepared.
        //  * @param {ItemUseOptions} options          Additional options used for configuring item usage.
        //  * @param {object} usage
        //  * @param {object} usage.actorUpdates       Updates that will be applied to the actor.
        //  * @param {object} usage.itemUpdates        Updates that will be applied to the item being used.
        //  * @param {object[]} usage.resourceUpdates  Updates that will be applied to other items on the actor.
        //  * @returns {boolean}                       Explicitly return `false` to prevent item from being used.
        //  */
        // if ( Hooks.call("dnd5e.itemUsageConsumption", item, config, options, usage) === false ) return;
        //
        // // Commit pending data updates
        // const { actorUpdates, itemUpdates, resourceUpdates } = usage;
        // if ( !foundry.utils.isEmpty(itemUpdates) ) await item.update(itemUpdates);
        // if ( config.consumeQuantity && (item.system.quantity === 0) ) await item.delete();
        // if ( !foundry.utils.isEmpty(actorUpdates) ) await this.actor.update(actorUpdates);
        // if ( resourceUpdates.length ) await this.actor.updateEmbeddedDocuments("Item", resourceUpdates);
        //
        // // Prepare card data & display it if options.createMessage is true
        // const cardData = await item.displayCard(options);
        //
        // // Initiate measured template creation
        // let templates;
        // if ( config.createMeasuredTemplate ) {
        //     try {
        //         templates = await (dnd5e.canvas.AbilityTemplate.fromItem(item))?.drawPreview();
        //     } catch(err) {}
        // }
        //
        // /**
        //  * A hook event that fires when an item is used, after the measured template has been created if one is needed.
        //  * @function dnd5e.useItem
        //  * @memberof hookEvents
        //  * @param {Item5e} item                                Item being used.
        //  * @param {ItemUseConfiguration} config                Configuration data for the roll.
        //  * @param {ItemUseOptions} options                     Additional options for configuring item usage.
        //  * @param {MeasuredTemplateDocument[]|null} templates  The measured templates if they were created.
        //  */
        // Hooks.callAll("dnd5e.useItem", item, config, options, templates ?? null);
        //
        // return cardData;
    }

}
