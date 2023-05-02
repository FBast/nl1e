export class Pl1eItem extends Item {

    get sourceUuid() {
        return this.getFlag("pl1e", "sourceUuid");
    }

    get parentId() {
        return this.getFlag("pl1e", "parentId");
    }

    get childId() {
        return this.getFlag("pl1e", "childId");
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

    /** @override */
    async _preDelete(options, user) {
        // if (this.isOriginal) {
        //     // Remove embedded from actors
        //     for (const actor of game.actors) {
        //         for (const item of actor.items) {
        //             if (item.sourceUuid !== this._id) continue;
        //             item.parent.removeItem(item);
        //         }
        //     }
        //
        //     // Remove item from parents items
        //     for (const id of this.system.refItemsParents) {
        //         const item = game.items.get(id);
        //         if (item) await item.removeRefItem(this);
        //     }
        // }

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
        if (this.system.refItemsChildren.find(id => id === item.uuid)) return;

        // Add item as child uuid to this
        this.system.refItemsChildren.push(item.uuid);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });

        // Add this as parent uuid to item
        item.system.refItemsParents.push(this.uuid);
        await item.update({
            "system.refItemsParents": item.system.refItemsParents
        })

        //TODO should use a macro to update all the actors once instead

        // // Update actors with this item to add the new item
        // for (const actor of game.actors) {
        //     for (const existingItem of actor.items) {
        //         if (existingItem.sourceUuid !== this._id) continue;
        //         const parentId = existingItem.parentId;
        //         await actor.addItem(item, parentId);
        //     }
        // }
    }

    async removeRefItem(item) {
        // Remove item as child uuid from this
        this.system.refItemsChildren.splice(this.system.refItemsChildren.indexOf(item.uuid), 1);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });

        item.system.refItemsParents.splice(item.system.refItemsParents.indexOf(this.uuid), 1);
        // Remove this as parent uuid from item
        await item.update({
            "system.refItemsParents": item.system.refItemsParents
        })

        //TODO should use a macro to update all the actors once instead

        // // Update actors with this item to remove the related embedded items
        // for (const actor of game.actors) {
        //     for (const existingItem of actor.items) {
        //         if (existingItem.sourceUuid !== this._id) continue;
        //         const itemToRemove = actor.items.find(item => item.sourceUuid === item._id &&
        //             item.childId === existingItem.parentId)
        //         await actor.removeItem(itemToRemove);
        //     }
        // }
    }

    async removeEmptyRefItem(uuid) {
        this.system.refItemsChildren.splice(this.system.refItemsChildren.indexOf(uuid), 1);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });
    }

}
