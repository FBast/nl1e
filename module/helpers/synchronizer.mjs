import {Pl1eAspect} from "./aspect.mjs";

export class Pl1eSynchronizer {

    /**
     * Reset all clones using their sourceUuid, should be used when the sourceItem is modified
     * @returns {Promise<void>}
     */
    static async resetClones(sourceItem) {
        let updateNumber = 0;
        for (const uuid of sourceItem.system.refActors) {
            const actor = await fromUuid(uuid);
            for (let item of actor.items) {
                if (!item.sourceUuid || item.sourceUuid !== sourceItem.uuid) continue
                await this.resetClone(item, sourceItem);
                updateNumber++;
            }
        }

        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));

        ui.notifications.warn(game.i18n.localize(`Number of clones updated : ${updateNumber}`));
    }

    /**
     * Reset this clone based on the original item
     * @param {Pl1eItem} item the item to reset
     * @param {Pl1eItem} originalItem the source of the reset
     * @returns {Promise<void>}
     */
    static async resetClone(item, originalItem) {
        if (!item.isEmbedded)
            throw new Error(`PL1E | Item ${item.name} should not be reset because not embedded`)

        const itemData = {
            "_id": item._id,
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
        for (const [id, aspect] of Object.entries(item.system.passiveAspects)) {
            if (Object.keys(originalItem.system.passiveAspects).some(aspectId => aspectId === id)) continue;
            itemData[`system.passiveAspects.-=${id}`] = null;
            // Remove the old effect
            const effect = item.actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === id);
            if (originalItem.type !== "feature" && item.isEnabled && effect !== undefined) {
                //TODO should be done outside of this class
                await Pl1eAspect.removePassiveEffect(item.actor, item, effect);
            }
        }
        // Add new aspects
        for (const [id, aspect] of Object.entries(originalItem.system.passiveAspects)) {
            if (Object.keys(item.system.passiveAspects).some(aspectId => aspectId === id)) continue;
            itemData[`system.passiveAspects.${id}`] = aspect;
            // Add the new effect
            if (originalItem.type !== "feature" && item.isEnabled) {
                //TODO should be done outside of this class
                await Pl1eAspect.createPassiveEffect(item.actor, item, id, aspect);
            }
        }
        // Update the item
        await item.actor.updateEmbeddedDocuments("Item", [itemData]);

        // Change flag to reflect
        await item.setFlag("pl1e", "needReset", false);

        console.log(`PL1E | ${item.name} is reset`);
    }

    static async updateItemReferences(item, uuidReference) {
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
            }
        }
    }

    static async deleteOriginalItem(item) {
        const gameItem = await fromUuid(item.originalUuid);
        await gameItem.update({
            "system.refItemsParents": [],
            "system.refItemsChildren": []
        });
        await gameItem.delete();
        await item.unsetFlag("pl1e", "originalUuid");
    }

    static async updateActorReferences(actor, uuidReference) {
        for (const item of actor.items) {
            const sourceItem = await fromUuid(item.sourceUuid);
            const index = sourceItem.system.refActors.indexOf(uuidReference);
            sourceItem.system.refActors[index] = actor.uuid;
            await sourceItem.update({
                "system.refActors": sourceItem.system.refActors
            });
        }
    }

    static async deleteOriginalActor(actor) {
        const gameActor = await fromUuid(actor.originalUuid);
        await gameActor.update({
            "system.refActors": [],
        });
        await gameActor.delete();
        await actor.unsetFlag("pl1e", "originalUuid");
    }

}