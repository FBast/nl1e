import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eSynchronizer} from "../helpers/synchronizer.mjs";

export class Pl1eItem extends Item {

    get originalUuid() {
        return this.getFlag("pl1e", "originalUuid");
    }

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

    /** @inheritDoc */
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

    async _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

        const enableCompendiumLinkTransfer = game.settings.get("pl1e", "enableCompendiumLinkTransfer");
        if (!this.isEmbedded && enableCompendiumLinkTransfer) {
            if (this.compendium === undefined) {
                // Creating a world element must save the uuid as flag and empty the parent link (in case of copy)
                await this.update({
                    "system.refItemsParents": []
                });
                await this.setFlag("pl1e", "originalUuid", this.uuid);
            }
            else {
                const existingItem = this.compendium.find(item => item.name === this.name
                    && item.type === this.type && item.uuid !== this.uuid);
                if (existingItem !== undefined) {
                    ui.notifications.warn(game.i18n.localize("PL1E.ItemWithSameName"));
                    await this.delete();
                }
                else {
                    // Creating an element into a compendium must update the ref items uuid
                    await Pl1eSynchronizer.updateItemReferences(this, this.originalUuid);
                    await Pl1eSynchronizer.deleteOriginalItem(this);
                }
            }
        }
    }

    /** @inheritDoc */
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
        if (this.isEmbedded)
            throw new Error("PL1E | Cannot add ref item on the embedded " + this.name);

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
        if (this.isEmbedded)
            throw new Error("PL1E | Cannot remove ref item on the embedded " + this.name);

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

}
