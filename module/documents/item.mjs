export class Pl1eItem extends Item {

    get isOriginal() {
        const sourceUuid = this.getFlag('core', 'sourceUuid');
        return !sourceUuid || sourceUuid === this.uuid;
    }

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
    _preDelete(options, user) {
        for (const actor of game.actors) {
            for (const item of actor.items) {
                if (item.getFlag("core", "sourceUuid") !== this.uuid) continue;
                item.parent.removeItem(item);
            }
        }
        return super._preDelete(options, user);
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    async prepareData() {
        // As with the actor class, subItems are documents that can have their data
        super.prepareData();

        // Prepare refItems
        if (this.system.refItemsUuids) {
            this.system.refItemsUuids = Object.values(this.system.refItemsUuids);
            for (let i = 0; i < this.system.refItemsUuids.length; i++) {
                const uuid = this.system.refItemsUuids[i];
                let originalItem = game.items.find(item => item.uuid === uuid);
                // Item does not exist then remove from the arrays
                if (!originalItem) {
                    this.system.refItemsUuids.splice(i, 1);
                    await this.update({
                        "system.refItemsUuids": this.system.refItemsUuids
                    });
                    i--;
                }
            }
        }
    }

    /**
     * Add a new ref Item
     * @param item
     * @returns {Promise<void>}
     */
    async addRefItem(item) {
        // Return if same item
        if (this.uuid === item.uuid) return;
        // Return if item with same uuid exist
        if (this.system.refItemsUuids.find(uuid => uuid === item.uuid)) return;

        // Save the item
        this.system.refItemsUuids.push(item.uuid);
        await this.update({
            "system.refItemsUuids": this.system.refItemsUuids,
        });
        this.sheet.render(this.sheet.rendered);

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.getFlag("core", "sourceUuid") !== this.uuid) continue;
                const parentId = existingItem.getFlag("core", "parentId");
                await actor.addItem(item, parentId);
            }
        }
    }

    async removeRefItem(itemUuid) {
        let index = this.system.refItemsUuids.indexOf(itemUuid);
        if (index > -1) {
            this.system.refItemsUuids.splice(index, 1);
            await this.update({
                "system.refItemsUuids": this.system.refItemsUuids,
            });
        }

        // Update actors with this item to remove the old item
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.getFlag("core", "sourceUuid") !== this.uuid) continue;
                const itemToRemove = actor.items.find(item => item.getFlag("core", "sourceUuid") === itemUuid &&
                    item.getFlag("core", "childId") === existingItem.getFlag("core", "parentId"))
                await actor.removeItem(itemToRemove);
            }
        }
    }

}
