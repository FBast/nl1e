import {Pl1eAspect} from "./aspect.mjs";
import {Pl1eHelpers} from "./helpers.mjs";

export class Pl1eSynchronizer {

    /**
     * Reset all actor items using their sourceId, should be used when the sourceItem is modified
     * @returns {Promise<void>}
     */
    static async resetActorsItems(sourceItem, notifyInfo = false) {
        let updateNumber = 0;
        const actors = await Pl1eHelpers.getDocuments("Actor");
        for (const actor of actors) {
            let renderActor = false;
            for (let item of actor.items) {
                if (item.sourceId !== sourceItem._id) continue

                // Update the item
                await this._resetItem(actor, item, sourceItem);

                // Render item if rendered
                item.sheet.render(item.sheet.rendered);
                renderActor = true;

                // Log and update count
                console.log(`PL1E | ${item.name} of ${actor.name} is reset`);
                updateNumber++;
            }

            if (renderActor) actor.sheet.render(actor.sheet.rendered);
        }

        const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
        if (enableDebugUINotifications && notifyInfo)
            ui.notifications.info(`${game.i18n.localize("PL1E.NumberOfUpdatedClones")} : ${updateNumber}`);
    }

    /**
     * Reset this item based on the original item
     * @param {Pl1eActor} actor the actor of the item
     * @param {Pl1eItem} item the item to reset
     * @param {Pl1eItem} originalItem the source of the reset
     * @returns {Promise<void>}
     * @private
     */
    static async _resetItem(actor, item, originalItem) {
        if (!item.isEmbedded)
            throw new Error(`PL1E | Item ${item.name} should not be reset because not embedded`)

        const itemData = {
            "name": originalItem.name,
            "img": originalItem.img,
            "system.price": originalItem.system.price,
            "system.description": originalItem.system.description,
            "system.attributes": originalItem.system.attributes,
            "system.refItems": originalItem.system.refItems
        }

        // Remove obsolete passive aspects
        for (const [id, aspect] of Object.entries(item.system.passiveAspects)) {
            if (!Object.keys(originalItem.system.passiveAspects).some(aspectId => aspectId === id)) {
                itemData[`system.passiveAspects.-=${id}`] = null;
            }

            // Remove the associated effect (updated aspect are removed too)
            const effect = actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === id);
            if (effect !== undefined && item.isEnabled) {
                await Pl1eAspect.removePassiveEffect(aspect, id, actor);
            }
        }

        // Add new passive aspects
        for (const [id, aspect] of Object.entries(originalItem.system.passiveAspects)) {
            itemData[`system.passiveAspects.${id}`] = aspect;

            // Add the associated effect
            if (aspect.createEffect && item.isEnabled) {
                await Pl1eAspect.applyPassiveEffect(aspect, id, actor, item);
            }
        }

        // Remove obsolete active aspects
        for (const [id, aspect] of Object.entries(item.system.activeAspects)) {
            if (!Object.keys(originalItem.system.activeAspects).some(aspectId => aspectId === id)) {
                itemData[`system.activeAspects.-=${id}`] = null;
            }
        }

        // Update the active aspects
        for (const [id, aspect] of Object.entries(originalItem.system.activeAspects)) {
            itemData[`system.activeAspects.${id}`] = aspect;
        }

        // Update the item data
        await item.update(itemData);

        // Update the sub items
        const subItems = await item.getSubItems();
        // Add the refItems in item which are not present in the actor
        for (const subItem of subItems) {
            // If we find an item with the same source id then continue
            if (actor.items.find(item => item.sourceId === subItem.id)) continue;
            await actor.addItem(subItem, item.parentId);
        }
        // Remove the item of the actor which use the same parentId and are not present in the item
        for (const otherItem of actor.items) {
            // If the otherItem as a different childId than the item parentId then continue
            if (otherItem.childId !== item.parentId) continue;
            // If the otherItem id is inside the subItems then continue
            if (subItems.find(item => item.id === otherItem.sourceId)) continue;
            await actor.removeItem(otherItem);
        }
    }

}