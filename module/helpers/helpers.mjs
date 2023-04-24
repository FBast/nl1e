import {Pl1eItem} from "../documents/item.mjs";

/**
 * Extends the actor to process special things from PL1E.
 */
export class Pl1eHelpers {

    /**
     * Simple object check.
     * @param item
     * @returns {boolean}
     */
    static isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
     * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
     * @return {object}                   Data for rendering
     */
    static prepareActiveEffectCategories(effects) {

        // Define effect header categories
        const categories = {
            temporary: {
                type: "temporary",
                label: "Temporary Effects",
                effects: []
            },
            passive: {
                type: "passive",
                label: "Passive Effects",
                effects: []
            },
            inactive: {
                type: "inactive",
                label: "Inactive Effects",
                effects: []
            }
        };

        // Iterate over active effects, classifying them into categories
        for (let e of effects) {
            e._getSourceName(); // Trigger a lookup for the source name
            if (e.disabled) categories.inactive.effects.push(e);
            else if (e.isTemporary) categories.temporary.effects.push(e);
            else categories.passive.effects.push(e);
        }
        return categories;
    }

    /**
     * Deep merge two objects.
     * @param target
     * @param sources
     */
    static mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return this.mergeDeep(target, ...sources);
    }

    /**
     * Reset all clones using their sourceId
     * @param {Item} originalItem
     * @returns {Promise<void>}
     */
    static async resetClones(originalItem) {
        for (const actor of game.actors) {
            let updateDocument = false;
            const itemsData = [];
            for (let item of actor.items.values()) {
                if (!item.getFlag("core", "sourceUuid") || item.getFlag("core", "sourceUuid") !== originalItem.uuid) continue
                if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(item.type)) {
                    itemsData.push({
                        "_id": originalItem._id,
                        "name": originalItem.name,
                        "img": originalItem.img,
                        "system.description": originalItem.system.description,
                        "system.attributes": originalItem.system.attributes,
                        "system.refItems": originalItem.system.refItems,
                        "system.refItemsUuid": originalItem.system.refItemsUuid
                    });
                    updateDocument = true;
                }
                else {
                    console.warn("Unknown type : " + item.type);
                }
            }
            if (updateDocument) {
                await actor.updateEmbeddedDocuments("Item", itemsData);
            }
        }
    }

    /**
     * Convert a value to money with gold, silver and copper
     * @param value the units sum
     * @returns {{gold: number, copper: number, silver: number}}
     */
    static unitsToMoney(value) {
        let money = {
            "gold": 0,
            "silver": 0,
            "copper": 0
        };
        money['gold'] = Math.floor(value / 100);
        value -= money['gold'] * 100
        money['silver'] = Math.floor(value / 10);
        value -= money['silver'] * 10;
        money['copper'] = value;
        return money;
    }

    /**
     * Convert money to value
     * @param money gold, silver and copper
     * @returns number
     */
    static moneyToUnits(money) {
        return money.gold * 100 + money.silver * 10 + money.copper;
    }

    /**
     * Find a document of the specified name and type on an assigned or selected actor.
     * @param {string} name          Document name to locate.
     * @param {string} documentType  Type of embedded document (e.g. "Item" or "ActiveEffect").
     * @returns {Pl1eItem}           Document if found, otherwise nothing.
     */
    static getTarget(name, documentType) {
        let actor;
        const speaker = ChatMessage.getSpeaker();
        if ( speaker.token ) actor = game.actors.tokens[speaker.token];
        actor ??= game.actors.get(speaker.actor);
        if ( !actor ) return ui.notifications.warn(game.i18n.localize("PL1E.NoActorSelected"));

        const collection = (documentType === "Item") ? actor.items : actor.effects;
        const nameKeyPath = (documentType === "Item") ? "name" : "label";

        // Find item in collection
        const documents = collection.filter(i => foundry.utils.getProperty(i, nameKeyPath) === name);
        const type = game.i18n.localize(`DOCUMENT.${documentType}`);
        if ( documents.length === 0 ) {
            return ui.notifications.warn(game.i18n.format("PL1E.MissingTarget", { actor: actor.name, type, name }));
        }
        if ( documents.length > 1 ) {
            ui.notifications.warn(game.i18n.format("PL1E.MultipleTargets", { actor: actor.name, type, name }));
        }
        return documents[0];
    }

    static deepen(obj) {
        const result = {};

        // For each object path (property key) in the object
        for (const objectPath in obj) {
            // Split path into component parts
            const parts = objectPath.split('.');

            // Create sub-objects along path as needed
            let target = result;
            while (parts.length > 1) {
                const part = parts.shift();
                target = target[part] = target[part] || {};
            }

            // Set value at end of path
            target[parts[0]] = obj[objectPath]
        }

        return result;
    }

    static rankCost(rank) {
        return ((rank * (rank + 1) / 2) - 1);
    }

}
