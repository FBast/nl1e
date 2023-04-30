export class Pl1eItem extends Item {

    get linkId() {
        return this.getFlag("core", "linkId");
    }

    get childId() {
        return this.getFlag("core", "childId");
    }

    get parentId() {
        return this.getFlag("core", "parentId");
    }

    get isOriginal() {
        return !this.isEmbedded;
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

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

        // Add the link id which will be used to synchronize all clones
        if (this.linkId === undefined) this.setFlag("core", "linkId", randomID());
    }

    /** @override */
    async _preDelete(options, user) {
        if (this.isOriginal) {
            // Remove embedded from actors
            for (const actor of game.actors) {
                for (const item of actor.items) {
                    if (item.linkId !== this.linkId) continue;
                    item.parent.removeItem(item);
                }
            }

            // Remove ref items from other items
            for (const item of game.items) {
                if (item.system.refItemsLinkIds.includes(this.linkId))
                    await item.removeRefItem(this.linkId);
            }
            return super._preDelete(options, user);
        }
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
        // Return if item with same link id exist
        if (this.system.refItemsLinkIds.find(linkId => linkId === item.linkId)) return;

        this.system.refItemsLinkIds.push(item.linkId);
        await this.update({
            "system.refItemsLinkIds": this.system.refItemsLinkIds,
        });
        this.sheet.render(this.sheet.rendered);

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.linkId !== this.linkId) continue;
                await actor.addItem(item, existingItem.parentId);
            }
        }
    }

    async removeRefItem(linkId) {
        let index = this.system.refItemsLinkIds.indexOf(linkId);
        if (index > -1) {
            this.system.refItemsLinkIds.splice(index, 1);
            await this.update({
                "system.refItemsLinkIds": this.system.refItemsLinkIds,
            });
        }

        // Update actors with this item to remove the new item
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.linkId !== this.linkId) continue;
                const itemToRemove = actor.items.find(item => item.linkId === linkId &&
                    item.childId === existingItem.parentId);
                await actor.removeItem(itemToRemove);
            }
        }
    }

    /**
     * Reset all clones using their linkId
     * @returns {Promise<void>}
     */
    async resetClones() {
        // Reset embedded items
        for (const actor of game.actors) {
            const itemsData = [];
            for (let item of actor.items) {
                if (item.linkId !== this.linkId) continue;
                itemsData.push({
                    "_id": item._id,
                    "name": this.name,
                    "img": this.img,
                    "system.price": this.system.price,
                    "system.description": this.system.description,
                    "system.attributes": this.system.attributes,
                    "system.passiveAspects": this.system.passiveAspects,
                    "system.activeAspects": this.system.activeAspects,
                    "system.refItemsLinkIds": this.system.refItemsLinkIds
                });
            }
            await actor.updateEmbeddedDocuments("Item", itemsData);
        }
        // Reset items
        for (const item of game.items) {
            if (item.linkId !== this.linkId) continue;
            await item.update({
                "name": this.name,
                "img": this.img,
                "system.price": this.system.price,
                "system.description": this.system.description,
                "system.attributes": this.system.attributes,
                "system.passiveAspects": this.system.passiveAspects,
                "system.activeAspects": this.system.activeAspects,
                "system.refItemsLinkIds": this.system.refItemsLinkIds
            });
        }
        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));
    }

}
