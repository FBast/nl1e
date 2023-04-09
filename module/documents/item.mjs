

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Pl1eItem extends Item {

    get isOriginal() {
        const sourceId = this.getFlag('core', 'sourceId');
        return !sourceId || sourceId === this.uuid;
    }

    //region Data management

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
        // As with the actor class, subItems are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).
        super.prepareData();

        // Prepare Embed subItems
        if (!(this.system.subItems instanceof Map)) {
            const itemsData = Array.isArray(this.system.subItems) ? this.system.subItems : [];
            this.system.subItems = new Map();

            itemsData.forEach((item) => {
                this.addEmbedItem(item, { save: false, newId: false });
            });
        }
    }

    /** @override */
    prepareBaseData() {
        const system = this.system;
        // Activate conditionnal attributes
        for (let [key, attribute] of Object.entries(system.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (['header', 'fixed'].includes(attributeConfig.category) && attributeConfig.conditions === undefined)
                attribute.show = true;
            if (attributeConfig.conditions !== undefined) {
                for (const andCondition of attributeConfig.conditions.split('||')) {
                    let isValid = true;
                    for (const condition of andCondition.split('&&')) {
                        if (condition.includes('!==')) {
                            const attributeCondition = condition.split('!==')[0];
                            let attributeValue = condition.split('!==')[1];
                            if (attributeValue === 'true') attributeValue = true;
                            if (attributeValue === 'false') attributeValue = false;
                            if (/^\d+$/.test(attributeValue)) attributeValue = +attributeValue;
                            if (system.attributes[attributeCondition].value === attributeValue) isValid = false;
                        }
                        else if(condition.includes('===')) {
                            const attributeCondition = condition.split('===')[0];
                            let attributeValue = condition.split('===')[1];
                            if (attributeValue === 'true') attributeValue = true;
                            if (attributeValue === 'false') attributeValue = false;
                            if (system.attributes[attributeCondition].value !== attributeValue) isValid = false;
                        }
                    }
                    attribute.show = isValid;
                    if (isValid) break;
                }
                if (!attribute.show && attributeConfig.fallback !== undefined)
                    attribute.value = attributeConfig.fallback;
            }
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

    //endregion

    //region Embedded subItems

    /**
     * A reference to the Collection of embedded Item instances in the document, indexed by _id.
     * @returns {Collection<BaseItem>}
     */
    get subItems() {
        return this.system.subItems || new Map();
    }

    /**
     * Shortcut for this.subItems.get
     * @param id
     * @return {Pl1eItem|null}
     */
    getEmbedItem(id) {
        return this.subItems?.get(id) || null;
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
        // In v10 actor's subItems inherit the ownership from the actor, but theirs ownership do not reflect that.
        // So we must take actor's ownership for sub-item
        item.ownership = this.actor?.ownership ?? this.ownership;

        // Add child id if defined
        if (childId !== undefined) item.system.childId = childId;

        // If this item has sub subItems
        if (item.system.subItems !== undefined && item.system.subItems.size > 0 && childId === undefined) {
            let linkId = randomID();
            item.system.parentId = linkId;
            for (let [key, subItem] of item.system.subItems) {
                await this.addEmbedItem(subItem, { childId : linkId });
            }
        }

        // Object
        this.system.subItems.set(item._id, item);

        if (save) await this.saveEmbedItems();

        return item._id;
    }

    /**
     * Save all the Embed Items
     * @return {Promise<void>}
     */
    async saveEmbedItems() {
        await this.update({
            "system.subItems": Array.from(this.system.subItems).map(([id, item]) => item.toObject(false)),
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
        if (!this.system.subItems.has(id)) {
            return;
        }

        // Remove the embed item
        this.system.subItems.delete(id);

        if (save) {
            await this.saveEmbedItems();
        }
    }

    //endregion

    //region Item interactions

    /**
     * Roll the item
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

    /**
     * Toggle the state of the item (could be necessary to be used)
     * @param options
     * @returns {Promise<void>}
     */
    async toggle(options) {
        throw new Error("toggle method is not implemented");
    }

    /**
     * Use the item
     * @param options
     * @returns {Promise<void>}
     */
    async use(options) {
        throw new Error("use method is not implemented");
    }

    /**
     * Apply the item effect after usage
     * @param options
     * @returns {Promise<void>}
     */
    async apply(options) {
        throw new Error("apply method is not implemented");
    }

    /**+
     * Reload the item
     * @returns {Promise<void>}
     */
    async reload(options) {
        throw new Error("reload method is not implemented");
    }

    //endregion

    /**
     * Calculate the stats of an attribute based on the roll result
     * @param {object} attribute
     * @param {number} rollResult
     * @param {Pl1eActor} actor
     * @returns {any}
     * @protected
     */
    _calculateAttribute(attribute, rollResult, actor) {
        // Copy attribute
        let calculatedAttribute = JSON.parse(JSON.stringify(attribute));

        // Calculate only if name is defined
        if (calculatedAttribute.name !== undefined) {
            let data = CONFIG.PL1E[calculatedAttribute.dataGroup][calculatedAttribute.data];

            // Number type
            if (data.type === 'number') {
                if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
                    calculatedAttribute.value *= rollResult > 0 ? rollResult : 0;
                }
                if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
                    calculatedAttribute.value = rollResult > 0 ? calculatedAttribute.value : 0;
                }
                if (calculatedAttribute.value < 0 && calculatedAttribute.reduction !== undefined && calculatedAttribute.reduction !== 'raw') {
                    let reduction = foundry.utils.getProperty(actor, CONFIG.PL1E.reductions[calculatedAttribute.reduction].path);
                    calculatedAttribute.value = Math.min(calculatedAttribute.value + reduction, 0);
                }
                // If resulting value equal to zero then ignore the attribute
                if (calculatedAttribute.value === 0) return;
                // Apply sign
                calculatedAttribute.value *= calculatedAttribute.name === "decrease" ? -1 : 1;
            }
        }

        return calculatedAttribute;
    }

}
