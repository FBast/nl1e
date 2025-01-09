import {Pl1eAspect} from "./aspect.mjs";
import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eEffect} from "../documents/effect.mjs";

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
                if (actor.pack) {
                    console.log(`PL1E | ${item.name} of ${actor.name} from pack ${actor.pack} is reset`);
                }
                else {
                    console.log(`PL1E | ${item.name} of ${actor.name} is reset`);
                }
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
            throw new Error(`PL1E | item ${item.name} should not be reset because not embedded`);

        const updateProperty = (propertyType, item, originalItem, actor = null) => {
            const itemData = {};
            const originalProperties = originalItem.system[propertyType] || {};
            const currentProperties = item.system[propertyType] || {};

            // Remove obsolete properties
            for (const id of Object.keys(currentProperties)) {
                if (!(id in originalProperties)) {
                    itemData[`system.${propertyType}.-=${id}`] = null;
                    if (propertyType === 'passiveAspects' && item.isEnabled) {
                        const effect = actor.effects.find(e => e.getFlag("pl1e", "aspectId") === id);
                        if (effect) Pl1eEffect.removePassiveEffect(currentProperties[id], id, actor);
                    }
                }
            }

            // Add new or updated properties
            for (const [id, property] of Object.entries(originalProperties)) {
                itemData[`system.${propertyType}.${id}`] = property;
                if (propertyType === 'passiveAspects' && property.createEffect && item.isEnabled) {
                    Pl1eEffect.applyPassiveEffect(property, id, actor, item);
                }
            }

            return itemData;
        };

        const handleRefItems = async (actor, item, refItems) => {
            // Add the ref items in item which are not present in the actor
            for (const refItem of refItems) {
                if (actor.items.find(i => i.sourceId === refItem.itemId && i.childId === item.parentId)) continue;
                const itemChildren = Pl1eHelpers.getConfig("actorTypes", actor.type, "itemChildren");
                if (!itemChildren.includes(refItem.item.type)) continue;

                await actor.addItem(refItem.item, item.parentId);
            }
            // Remove the item of the actor which uses the same parentId and is not present in the item
            for (const otherItem of actor.items) {
                if (otherItem.childId !== item.parentId) continue;
                if (refItems.find(refItem => refItem.itemId === otherItem.sourceId)) continue;

                await actor.removeItem(otherItem);
            }
        };

        const itemData = {
            "name": originalItem.name,
            "img": originalItem.img,
            "system.description": originalItem.system.description,
            ...updateProperty("attributes", item, originalItem, actor),
            ...updateProperty("refItems", item, originalItem, actor),
            ...updateProperty("passiveAspects", item, originalItem, actor),
            ...updateProperty("activeAspects", item, originalItem, actor)
        };

        // Update the item data
        await item.update(itemData);

        // Additional logic for refItems in the actor
        await handleRefItems(actor, item, await item.getRefItems());
    }

}