import {Pl1eAspect} from "./aspect.mjs";

export class Pl1eSynchronizer {

    /**
     * Synchronize the actor between creation and transfer
     * @param actor
     * @returns {Promise<void>}
     */
    static async synchronizeActor(actor) {
        if (actor.compendium === undefined) {
            // New actor from compendium should add the ref to actor items original
            for (const actorItem of actor.items) {
                const sourceItem = await fromUuid(actorItem.sourceUuid);
                if (!sourceItem.system.refActors.includes(actor.uuid)) {
                    sourceItem.system.refActors.push(actor.uuid);
                    await sourceItem.update({
                        "system.refActors": sourceItem.system.refActors
                    })
                }
            }
        }
        else {
            const existingActor = actor.compendium.find(actor => actor.name === actor.name
                && actor.type === actor.type && actor.uuid !== actor.uuid);
            if (existingActor !== undefined) {
                ui.notifications.warn(game.i18n.localize("PL1E.ActorWithSameName"));
                await actor.delete();
            }
            else {
                // Creating an element into a compendium must update the ref items uuid
                await this._updateActorReferences(actor, actor.originalUuid);
                await this._deleteOriginalActor(actor);
            }
        }
    }

    /**
     * Synchronize the item between creation and transfer
     * @param item
     * @returns {Promise<void>}
     */
    static async synchronizeItem(item) {
        if (item.compendium === undefined) {
            // Creating a world element must empty the parent link (in case of copy)
            await item.update({
                "system.refItemsParents": []
            });
        }
        else {
            const existingItem = item.compendium.find(item => item.name === item.name
                && item.type === item.type && item.uuid !== item.uuid);
            if (existingItem !== undefined) {
                ui.notifications.warn(game.i18n.localize("PL1E.ItemWithSameName"));
                await item.delete();
            }
            else {
                // Creating an element into a compendium must update the ref items uuid
                await this._updateItemReferences(item, item.originalUuid);
                await this._deleteOriginalItem(item);
            }
        }
    }

    /**
     * Reset all clones using their sourceUuid, should be used when the sourceItem is modified
     * @returns {Promise<void>}
     */
    static async resetActorsItems(sourceItem) {
        let updateNumber = 0;
        for (const uuid of sourceItem.system.refActors) {
            const actor = await fromUuid(uuid);
            for (let item of actor.items) {
                if (!item.sourceUuid || item.sourceUuid !== sourceItem.uuid) continue

                // Update the item
                await this._resetClone(item, sourceItem);

                // Log and update count
                console.log(`PL1E | ${item.name} of ${actor.name} is reset`);
                updateNumber++;
            }
        }

        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));

        const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
        if (enableDebugUINotifications)
            ui.notifications.info(game.i18n.localize(`Number of clones updated : ${updateNumber}`));
    }

    /**
     * Reset this clone based on the original item
     * @param {Pl1eItem} item the item to reset
     * @param {Pl1eItem} originalItem the source of the reset
     * @returns {Promise<void>}
     * @private
     */
    static async _resetClone(item, originalItem) {
        if (!item.isEmbedded)
            throw new Error(`PL1E | Item ${item.name} should not be reset because not embedded`)

        let itemData = {
            "_id": item._id,
            "name": originalItem.name,
            "img": originalItem.img,
            "system.price": originalItem.system.price,
            "system.description": originalItem.system.description,
            "system.attributes": originalItem.system.attributes,
            "system.refItemsChildren": originalItem.system.refItemsChildren,
            "system.refItemsParents": originalItem.system.refItemsParents,
            "system.refActors": originalItem.system.refActors
        };

        // Update the item
        await item.actor.updateEmbeddedDocuments("Item", [itemData]);

        // Remove obsolete passive effects
        for (const [id, aspect] of Object.entries(item.system.passiveAspects)) {
            const effect = item.actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === id);
            if (originalItem.type !== "feature" && item.isEnabled && effect !== undefined) {
                await Pl1eAspect.removePassiveEffect(item.actor, item, effect);
            }
        }

        itemData = {
            "_id": item._id,
            "system.passiveAspects": originalItem.system.passiveAspects,
            "system.activeAspects": originalItem.system.activeAspects
        };

        // Update the item with diff false
        await item.actor.updateEmbeddedDocuments("Item", [itemData], {
            diff: false
        });

        // Add new passive effects
        for (const [id, aspect] of Object.entries(originalItem.system.passiveAspects)) {
            if (originalItem.type !== "feature" && item.isEnabled) {
                await Pl1eAspect.createPassiveEffect(item.actor, item, id, aspect);
            }
        }
    }

    /**
     *
     * @param item
     * @param uuidReference
     * @returns {Promise<void>}
     * @private
     */
    static async _updateItemReferences(item, uuidReference) {
        // Updating children references
        for (const uuid of item.system.refItemsChildren) {
            const childItem = await fromUuid(uuid);
            const parentIndex = childItem.system.refItemsParents.indexOf(uuidReference);
            childItem.system.refItemsParents[parentIndex] = item.uuid;
            await childItem.update({
                "system.refItemsParents": childItem.system.refItemsParents
            });
        }

        // Updating parents references
        for (const uuid of item.system.refItemsParents) {
            const parentItem = await fromUuid(uuid);
            const childIndex = parentItem.system.refItemsChildren.indexOf(item.originalUuid);
            parentItem.system.refItemsChildren[childIndex] = item.uuid;
            await parentItem.update({
                "system.refItemsChildren": parentItem.system.refItemsChildren
            });
        }

        // Updating actors item references
        for (const uuid of item.system.refActors) {
            const actor = await fromUuid(uuid);
            for (const actorItem of actor.items) {
                if (actorItem.sourceUuid !== uuidReference) continue;
                await actorItem.setFlag("pl1e", "sourceUuid", item.uuid);
                await actorItem.update({
                    "system.refItemsChildren": item.system.refItemsChildren,
                    "system.refItemsParents": item.system.refItemsParents
                });
            }
        }
    }

    /**
     *
     * @param item
     * @returns {Promise<void>}
     * @private
     */
    static async _deleteOriginalItem(item) {
        const gameItem = await fromUuid(item.originalUuid);
        await gameItem.update({
            "system.refItemsParents": [],
            "system.refItemsChildren": []
        });
        await gameItem.delete();
        await item.unsetFlag("pl1e", "originalUuid");
    }

    /**
     *
     * @param actor
     * @param uuidReference
     * @returns {Promise<void>}
     * @private
     */
    static async _updateActorReferences(actor, uuidReference) {
        for (const item of actor.items) {
            const sourceItem = await fromUuid(item.sourceUuid);
            const index = sourceItem.system.refActors.indexOf(uuidReference);
            sourceItem.system.refActors[index] = actor.uuid;
            await sourceItem.update({
                "system.refActors": sourceItem.system.refActors
            })
            await this.resetActorsItems(sourceItem);
        }
    }

    /**
     *
     * @param actor
     * @returns {Promise<void>}
     * @private
     */
    static async _deleteOriginalActor(actor) {
        const gameActor = await fromUuid(actor.originalUuid);
        await gameActor.update({
            "system.refActors": [],
        });
        await gameActor.delete();
        await actor.unsetFlag("pl1e", "originalUuid");
    }

}