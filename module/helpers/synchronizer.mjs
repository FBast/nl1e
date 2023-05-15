import {Pl1eAspect} from "./aspect.mjs";
import {Pl1eHelpers} from "./helpers.mjs";

export class Pl1eSynchronizer {

    /**
     * Reset all actor items using their sourceId, should be used when the sourceItem is modified
     * @returns {Promise<void>}
     */
    static async resetActorsItems(sourceItem, notifyInfo = false) {
        let updateNumber = 0;
        for (const id of sourceItem.system.refActors) {
            const actor = await Pl1eHelpers.getDocument(id, "Actor");
            for (let item of actor.items) {
                if (item.sourceId !== sourceItem._id) continue

                // Update the item
                await this._resetItem(item, sourceItem);

                // Log and update count
                console.log(`PL1E | ${item.name} of ${actor.name} is reset`);
                updateNumber++;
            }
        }

        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));

        const enableDebugUINotifications = game.settings.get("pl1e", "enableDebugUINotifications");
        if (enableDebugUINotifications && notifyInfo)
            ui.notifications.info(game.i18n.localize(`Number of clones updated : ${updateNumber}`));
    }

    /**
     * Reset this item based on the original item
     * @param {Pl1eItem} item the item to reset
     * @param {Pl1eItem} originalItem the source of the reset
     * @returns {Promise<void>}
     * @private
     */
    static async _resetItem(item, originalItem) {
        if (!item.isEmbedded)
            throw new Error(`PL1E | Item ${item.name} should not be reset because not embedded`)

        const itemData = {
            "name": originalItem.name,
            "img": originalItem.img,
            "system.price": originalItem.system.price,
            "system.description": originalItem.system.description,
            "system.attributes": originalItem.system.attributes,
            "system.refItemsChildren": originalItem.system.refItemsChildren,
            "system.refItemsParents": originalItem.system.refItemsParents,
            "system.refActors": originalItem.system.refActors
        }

        // Remove obsolete passive aspects
        for (const [id, aspect] of Object.entries(item.system.passiveAspects)) {
            if (!Object.keys(originalItem.system.passiveAspects).some(aspectId => aspectId === id)) {
                itemData[`system.passiveAspects.-=${id}`] = null;
            }

            // Remove the associated effect (updated aspect are removed too)
            const effect = item.actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === id);
            if (effect !== undefined && item.isEnabled) {
                await Pl1eAspect.removePassiveEffect(item.actor, item, effect);
            }
        }

        // Add new passive aspects
        for (const [id, aspect] of Object.entries(originalItem.system.passiveAspects)) {
            itemData[`system.passiveAspects.${id}`] = aspect;

            // Add the associated effect
            if (aspect.createEffect && item.isEnabled) {
                await Pl1eAspect.createPassiveEffect(item.actor, item, id, aspect);
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
    }

}