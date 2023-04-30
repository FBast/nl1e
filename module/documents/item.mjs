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
    async _preDelete(options, user) {
        // Remove embedded from actors
        for (const actor of game.actors) {
            for (const item of actor.items) {
                if (item.getFlag("core", "sourceUuid") !== this.uuid) continue;
                item.parent.removeItem(item);
            }
        }

        // Remove ref items from other items
        for (const item of game.items) {
            if (item.system.refItemsUuids.includes(this.uuid))
                await item.removeRefItem(this.uuid);
        }
        return super._preDelete(options, user);
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    async prepareData() {
        // As with the actor class, subItems are documents that can have their data
        super.prepareData();

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

        // Update actors with this item to remove the related embedded items
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.getFlag("core", "sourceUuid") !== this.uuid) continue;
                const itemToRemove = actor.items.find(item => item.getFlag("core", "sourceUuid") === itemUuid &&
                    item.getFlag("core", "childId") === existingItem.getFlag("core", "parentId"))
                await actor.removeItem(itemToRemove);
            }
        }
    }

    /**
     * Reset all clones using their linkId
     * @returns {Promise<void>}
     */
     async resetClones() {
        for (const actor of game.actors) {
            let updateDocument = false;
            const itemsData = [];
            for (let item of actor.items) {
                if (!item.getFlag("core", "linkId") || item.getFlag("core", "linkId") !== this.uuid) continue
                if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(item.type)) {
                    itemsData.push({
                        "_id": item._id,
                        "name": this.name,
                        "img": this.img,
                        "system.price": this.system.price,
                        "system.description": this.system.description,
                        "system.attributes": this.system.attributes,
                        "system.passiveAspects": this.system.passiveAspects,
                        "system.activeAspects": this.system.activeAspects,
                        "system.refItems": this.system.refItems
                    });
                    updateDocument = true;
                }
                else {
                    console.warn("Unknown type : " + item.type);
                }
            }
            if (updateDocument) {
                await actor.updateEmbeddedDocuments("Item", itemsData);
            }
        }
        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));
    }

}
