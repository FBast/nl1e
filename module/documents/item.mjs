export class Pl1eItem extends Item {

    get sourceUuid() {
        return this.getFlag("core", "sourceUuid");
    }

    get parentId() {
        return this.getFlag("core", "parentId");
    }

    get childId() {
        return this.getFlag("core", "childId");
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
        if (this.isOriginal) {
            // Remove embedded from actors
            for (const actor of game.actors) {
                for (const item of actor.items) {
                    if (item.sourceUuid !== this.uuid) continue;
                    item.parent.removeItem(item);
                }
            }

            // Remove item from parents items
            for (const uuid of this.system.refItemsParents) {
                const item = fromUuid(uuid);
                item.removeRefItem(this);
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
        if (this.system.refItemsChildren.find(uuid => uuid === item.uuid)) return;

        // Add item as child uuid to this
        this.system.refItemsChildren.push(item.uuid);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });
        this.sheet.render(this.sheet.rendered);

        // Add this as parent uuid to item
        item.system.refItemsParents.push(this.uuid)
        await item.update({
            "system.refItemsParents": item.system.refItemsParents
        })

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.sourceUuid !== this.uuid) continue;
                const parentId = existingItem.parentId;
                await actor.addItem(item, parentId);
            }
        }
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

        // Update actors with this item to remove the related embedded items
        for (const actor of game.actors) {
            for (const existingItem of actor.items) {
                if (existingItem.sourceUuid !== this.uuid) continue;
                const itemToRemove = actor.items.find(item => item.sourceUuid === itemUuid &&
                    item.childId === existingItem.parentId)
                await actor.removeItem(itemToRemove);
            }
        }
    }

}
