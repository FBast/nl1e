import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eSynchronizer} from "../helpers/synchronizer.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class Pl1eItem extends Item {

    get sourceId() {
        const sourceId = this.getFlag("core", "sourceId")
        if (sourceId !== undefined) return sourceId.split(".")[1];
        return undefined;
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
        await super._preCreate(data, options, userId);
    }

    /** @inheritDoc */
    async _preDelete(options, user) {
        // If the item is not embedded and is the last then update refs
        const documents = await Pl1eHelpers.getDocuments(this._id, "Item");
        if (!this.isEmbedded && documents.length === 1) {
            // Remove item from parents items
            for (const id of this.system.refItemsParents) {
                const items = await Pl1eHelpers.getDocuments(id, "Item");
                for (const item of items) {
                    await item.removeRefItem(this);
                }
            }

            // Remove item from children items
            for (const id of this.system.refItemsChildren) {
                const items = await Pl1eHelpers.getDocuments(id, "Item");
                for (const item of items) {
                    await item.removeRefItem(this);
                }
            }

            // Remove embedded from actors
            for (const id of this.system.refActors) {
                const actors = await Pl1eHelpers.getDocuments(id, "Actor");
                for (const actor of actors) {
                    for (const item of actor.items) {
                        if (item.sourceId !== this._id) continue;
                        await actor.removeItem(item);
                    }
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

        // Return if item with same id exist
        if (this.system.refItemsChildren.some(id => id === item._id)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize(`A child with the same id exist`));
            return;
        }

        // Return against recursive loop
        if (await Pl1eHelpers.createRecursiveLoop(this, item.id)) {
            const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
            if (enableDebugUINotifications)
                ui.notifications.warn(game.i18n.localize(`This will create a recursive loop and is aborted`));
            return;
        }

        // Add item as child id to this
        this.system.refItemsChildren.push(item._id);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });

        // Add this as parent id to item
        item.system.refItemsParents.push(this._id);
        await item.update({
            "system.refItemsParents": item.system.refItemsParents
        })

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceId !== this._id) continue;
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

        // Remove item as child id from this
        this.system.refItemsChildren.splice(this.system.refItemsChildren.indexOf(item._id), 1);
        await this.update({
            "system.refItemsChildren": this.system.refItemsChildren
        });

        // Remove this as parent id from item
        item.system.refItemsParents.splice(item.system.refItemsParents.indexOf(this._id), 1);
        await item.update({
            "system.refItemsParents": item.system.refItemsParents
        });

        // Update actors with this item to remove the related embedded items
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceId !== this._id) continue;
                const itemToRemove = actor.items.find(otherItem => otherItem.sourceId === item._id &&
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
     * Apply the item effect with an action
     * @param options
     * @returns {Promise<void>}
     */
    async apply(options) {}

    /**
     * Activate the item
     * @returns {Promise<void>}
     */
    async activate() {}

    /**
     * Check if the item activation is valid
     * @param actor
     * @protected
     */
    _canActivate(actor) {
        // If no token found
        if (!actor.bestToken) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoToken"));
            return false;
        }
        // If is not in battle
        if (!actor.bestToken.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotInBattle"));
            return false;
        }
        return true;
    }

}
