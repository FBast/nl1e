import {PL1E} from "../config/config.mjs";


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

    /** @override */
    async prepareBaseData() {
        super.prepareBaseData();

        // Prepare Sub items
        await this.importSubItems();
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    async prepareData() {
        // As with the actor class, subItems are documents that can have their data
        super.prepareData();

        // Prepare Dynamic Attributes
        const dynamicAttributes = {};
        for (let [id, dynamicAttribute] of Object.entries(this.system.dynamicAttributes)) {
            dynamicAttributes[id] = CONFIG.PL1E.attributeClasses[dynamicAttribute.function]
                ? new CONFIG.PL1E.attributeClasses[dynamicAttribute.function](dynamicAttribute)
                : (() => {
                    throw new Error("PL1E | Unknown attribute type: " + dynamicAttribute.function)
                })();
        }
        this.system.dynamicAttributes = dynamicAttributes;
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

    //region Sub items

    /**
     * Add a Sub Item
     * @param {Pl1eItem} item Object to add
     * @param {boolean} save Save uuid
     * @return {Promise<string>}
     */
    async addSubItem(item, save = true) {
        if (!item) {
            throw new Error("PL1E | added item is not defined")
        }

        if (!(item instanceof Pl1eItem)) {
            throw new Error("PL1E | added item " + item.toString() + " is not an instance of Pl1eItem")
        }

        // Store the temporary item (will be loose on refresh)
        this.system.subItems.push(item);

        // Store the item uuid
        this.system.subItemsUuid.push(item.uuid);

        // If this item has sub subItems
        if (item.system.subItems.size > 0) {
            for (let [key, subItem] of item.system.subItems) {
                await this.addSubItem(subItem, false);
            }
        }

        if (save) {
            await this.update({
                ["system.subItemsUuid"] : this.system.subItemsUuid,
                ["system.subItems"] : this.system.subItems
            });
        }
    }

    /**
     * Imports all subItems using their uuid stored in subItemsUuid
     * @returns {Promise<void>}
     */
    async importSubItems() {
        this.system.subItems = [];
        for (let subItemUuid of this.system.subItemsUuid) {
            this.system.subItems.push(await fromUuid(subItemUuid));
        }
    }

    /**
     * Delete the Sub Item and clear the actor bonus if any
     * @param uuid Item uuid
     * @param {boolean} save
     * @return {Promise<void>}
     */
    async deleteSubItem(uuid, save = true) {
        const subItemsUuid = this.system.subItemsUuid;
        const index = subItemsUuid.indexOf(uuid);

        if (index === -1)
            throw new Error("PL1E | item to delete with " + uuid + " cannot be found")

        // Remove the item uuid
        subItemsUuid.splice(index, 1);

        // Remove the item using the same index
        this.system.subItems.splice(index, 1);

        // If this item has sub subItems
        if (item.system.subItems.size > 0) {
            for (let [key, subItem] of item.system.subItems) {
                await this.deleteSubItem(subItem, false);
            }
        }

        if (save) {
            await this.item.update({
                ["system.subItemsUuid"] : this.system.subItemsUuid,
                ["system.subItems"] : this.system.subItems
            });
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
        throw new Error("PL1E | toggle method is not implemented");
    }

    /**
     * Use the item
     * @param options
     * @returns {Promise<void>}
     */
    async use(options) {
        throw new Error("PL1E | use method is not implemented");
    }

    /**
     * Apply the item effect after usage
     * @param options
     * @returns {Promise<void>}
     */
    async apply(options) {
        throw new Error("PL1E | apply method is not implemented");
    }

    /**+
     * Reload the item
     * @returns {Promise<void>}
     */
    async reload(options) {
        throw new Error("PL1E | reload method is not implemented");
    }

    //endregion

}
