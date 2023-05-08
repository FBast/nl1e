import {Pl1eAspect} from "../helpers/aspect.mjs";

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

    get needReset() {
        return this.getFlag("pl1e", "needReset");
    }

    get isEnabled() {
        switch (this.type) {
            case "weapon":
                return this.system.isEquippedMain || this.system.isEquippedSecondary;
            case "wearable":
                return this.system.isEquipped;
            case "ability":
                return this.system.isMemorized;
            default:
                return false;
        }
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
        if (this.system.refItemsChildren.some(id => id === item.uuid)) return;

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
     * Toggle the item state
     * @param options
     * @returns {Promise<void>}
     */
    async toggle(options) {
        if (this.isEnabled) {
            for (const [id, aspect] of Object.entries(this.system.passiveAspects)) {
                await Pl1eAspect.createPassiveEffect(this.actor, this, id, aspect);
            }
        }
        else {
            for (const [id, aspect] of Object.entries(this.system.passiveAspects)) {
                const effect = this.actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === id);
                await Pl1eAspect.removePassiveEffect(this.actor, this, effect);
            }
        }
    }

    /**
     * Activate the item
     * @returns {Promise<void>}
     */
    async activate() {}

    /**
     * Reset this clone based on the original item
     * @param originalItem
     * @returns {Promise<void>}
     */
    async resetClone(originalItem) {
        if (!this.isEmbedded)
            throw new Error(`PL1E | Item ${this.name} should not be reset because not embedded`)

        const itemData = {
            "_id": this._id,
            "name": originalItem.name,
            "img": originalItem.img,
            "system.price": originalItem.system.price,
            "system.description": originalItem.system.description,
            "system.attributes": originalItem.system.attributes,
            "system.passiveAspects": originalItem.system.passiveAspects,
            "system.activeAspects": originalItem.system.activeAspects,
            "system.refItemsChildren": originalItem.system.refItemsChildren,
            "system.refItemsParents": originalItem.system.refItemsParents,
        };
        // Remove obsolete aspects
        for (const [id, aspect] of Object.entries(this.system.passiveAspects)) {
            if (Object.keys(originalItem.system.passiveAspects).some(aspectId => aspectId === id)) continue;
            itemData[`system.passiveAspects.-=${id}`] = null;
            // Remove the old effect
            const effect = this.actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === id);
            if (originalItem.type !== "feature" && this.isEnabled && effect !== undefined) {
                await Pl1eAspect.removePassiveEffect(this.actor, this, effect);
            }
        }
        // Add new aspects
        for (const [id, aspect] of Object.entries(originalItem.system.passiveAspects)) {
            if (Object.keys(this.system.passiveAspects).some(aspectId => aspectId === id)) continue;
            itemData[`system.passiveAspects.${id}`] = aspect;
            // Add the new effect
            if (originalItem.type !== "feature" && this.isEnabled) {
                await Pl1eAspect.createPassiveEffect(this.actor, this, id, aspect);
            }
        }
        // Update the item
        await this.actor.updateEmbeddedDocuments("Item", [itemData]);

        // Change flag to reflect
        await this.setFlag("pl1e", "needReset", false);

        console.log(`PL1E | ${this.name} is reset`);
    }

}
