import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eSynchronizer} from "../helpers/synchronizer.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

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

        // This flag maintain retroactive link transfer
        if (this.compendium === undefined)
            await this.setFlag("pl1e", "originalUuid", this.uuid);

        const enableCompendiumLinkTransfer = game.settings.get("pl1e", "enableCompendiumLinkTransfer");
        if (!this.isEmbedded && enableCompendiumLinkTransfer) await Pl1eSynchronizer.synchronizeItem(this);
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

    async _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        if (!this.isEmbedded) {
            // Auto reset actors items on update
            const enableAutoResetActorsItems = game.settings.get("pl1e", "enableAutoResetActorsItems");
            if (enableAutoResetActorsItems) await Pl1eSynchronizer.resetActorsItems(this);
        }
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
            throw new Error("PL1E | Cannot add ref item on embedded " + this.name);

        // Return if item with same uuid exist
        if (this.system.refItemsChildren.some(id => id === item.uuid)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize(`A child with the same uuid exist`));
            return;
        }

        // Return against recursive loop
        if (await Pl1eHelpers.createRecursiveLoop(this, item.uuid)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize(`This will create a recursive loop and is aborted`));
            return;
        }

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
            throw new Error("PL1E | Cannot remove ref item on embedded " + this.name);

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
