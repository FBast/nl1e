/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Pl1eItem extends Item {

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
    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);
        if (data.img === undefined) {
            const img = CONFIG.PL1E.defaultIcons[data.type];
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (img) await this.data.update({ img });
            if (name) await this.data.update({ name });
        }
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
     * @param {boolean} removeBonusFromActor if we update the actor bonus for advancements
     * @return {Promise<void>}
     */
    async deleteEmbedItem(id, { save = true, removeBonusFromActor = true } = {}) {
        if (!this.system.subItemsMap.has(id)) {
            return;
        }

        // Remove the embed item
        this.system.subItemsMap.delete(id);

        if (save) {
            await this.saveEmbedItems();
        }
    }

}
