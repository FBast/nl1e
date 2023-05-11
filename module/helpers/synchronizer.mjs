export class Pl1eSynchronizer {

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
                await item.updateItem(sourceItem);

                // Change flag to reflect
                await item.setFlag("pl1e", "needReset", false);

                // Log and update count
                console.log(`PL1E | ${item.name} is reset`);
                updateNumber++;
            }
        }

        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));

        ui.notifications.warn(game.i18n.localize(`Number of clones updated : ${updateNumber}`));
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
                await actorItem.update({
                    "system.refItemsChildren": item.system.refItemsChildren,
                    "system.refItemsParents": item.system.refItemsParents
                });
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
            })
            await this.resetActorsItems(sourceItem);
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