import {Pl1eHelpers} from "../helpers/helpers.mjs";

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
        // Delete an original item
        if (!this.isEmbedded) {
            // Remove item from parents items
            for (const uuid of this.system.refItemsParents) {
                const item = await fromUuid(uuid);
                if (item) await item.removeRefItem(this);
            }

            // Remove embedded from actors
            for (const actor of game.actors) {
                for (const item of actor.items) {
                    if (item.sourceUuid !== this.uuid) continue;
                    actor.removeItem(item);
                }
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

        // The next part is not for embedded items
        if (this.isEmbedded) return;

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceUuid !== this.uuid) continue;
                await actor.addItem(item, actorItem.parentId);
            }
        }
    }

    /**
     * Remove a new ref Item
     * @param item
     * @returns {Promise<void>}
     */
    async removeRefItem(item) {
        // Remove item as child uuid from this
        this.system.refItemsChildren.splice(this.system.refItemsChildren.indexOf(item.uuid), 1);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });

        // Remove this as parent uuid from item
        item.system.refItemsParents.splice(item.system.refItemsParents.indexOf(this.uuid), 1);
        await item.update({
            "system.refItemsParents": item.system.refItemsParents
        });

        // The next part is not for embedded items
        if (this.isEmbedded) return;

        // Update actors with this item to remove the related embedded items
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceUuid !== this.uuid) continue;
                const itemToRemove = actor.items.find(otherItem => otherItem.sourceUuid === item.uuid &&
                    otherItem.childId === actorItem.parentId)
                await actor.removeItem(itemToRemove);
            }
        }
    }

    /**
     * This method should not be used because dead link are automatically removed
     * @param uuid
     * @returns {Promise<void>}
     */
    async removeEmptyRefItem(uuid) {
        this.system.refItemsChildren.splice(this.system.refItemsChildren.indexOf(uuid), 1);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });
    }

    /**
     * Reset all clones using their sourceUuid, should be used when the item is modified
     * @returns {Promise<void>}
     */
    async resetClones() {
        // Update actors embedded items copied of original item
        for (const actor of game.actors) {
            const itemsRemove = [];
            const itemsData = [];
            for (let item of actor.items) {
                if (!item.isEmbedded) continue;
                if (!item.sourceUuid || item.sourceUuid !== this.uuid) continue
                itemsRemove.push({
                    "_id": item._id,
                    "system.passiveAspects": null,
                    "system.activeAspects": null
                })
                itemsData.push({
                    "_id": item._id,
                    "name": this.name,
                    "img": this.img,
                    "system.price": this.system.price,
                    "system.description": this.system.description,
                    "system.attributes": this.system.attributes,
                    "system.passiveAspects": this.system.passiveAspects,
                    "system.activeAspects": this.system.activeAspects,
                    "system.refItemsChildren": this.system.refItemsChildren,
                    "system.refItemsParents": this.system.refItemsParents,
                });
                await item.update({
                    "system.passiveAspects": null,
                    "system.activeAspects": null,
                })
                await item.update({
                    "name": this.name,
                    "img": this.img,
                    "system.price": this.system.price,
                    "system.description": this.system.description,
                    "system.attributes": this.system.attributes,
                    "system.passiveAspects": this.system.passiveAspects,
                    "system.activeAspects": this.system.activeAspects,
                    "system.refItemsChildren": this.system.refItemsChildren,
                    "system.refItemsParents": this.system.refItemsParents,
                })
            }
            // It seems that updateEmbeddedDocuments don't update aspects correctly
            // so i need to empty them before update
            await actor.updateEmbeddedDocuments("Item", itemsRemove);
            // Update the actors item
            await actor.updateEmbeddedDocuments("Item", itemsData);
        }

        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));
    }

}
