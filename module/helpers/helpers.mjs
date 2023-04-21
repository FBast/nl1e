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
     * @param {Item} item
     * @returns {Promise<void>}
     */
    static async resets(item) {
        // Reset items subItems
        for (const subItem of game.items) {
            if (subItem.system.subItems === undefined) continue;
            await this._resetSubItems(subItem, item._id);
        }
        // Reset actors subItems
        for (const actor of game.actors) {
            await this._resetCloneActorItems(actor, item._id);
        }
    }

    /**
     * Reset this actor subItems (if sourceId is corresponding source)
     * @param actor
     * @param sourceId
     * @returns {Promise<void>}
     * @private
     */
    static async _resetCloneActorItems(actor, sourceId) {
        let updateDocument = false;
        const itemsData = [];
        for (let item of actor.items.values()) {
            if (item.getFlag('core', 'sourceId') === undefined) continue;
            if (item.getFlag('core', 'sourceId').split('.')[1] !== sourceId) continue;
            let original = await fromUuid(item.getFlag('core', 'sourceId'));
            if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(item.type)) {
                // await this._resetCloneSubItems(item, sourceId);
                itemsData.push({
                    // "_id": item._id,
                    "name": original.name,
                    "img": original.img,
                    "system.description": original.system.description,
                    "system.attributes": original.system.attributes,
                    "system.aspects": original.system.aspects
                });
                item.sheet.render(item.sheet.rendered);
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

    /**
     * Reset this item subItem (if sourceId is corresponding source)
     * @param item
     * @param sourceId
     * @returns {Promise<void>}
     * @private
     */
    static async _resetCloneSubItems(item, sourceId) {
        let updateDocument = false;
        for (let [key, subItem] of item.system.subItems) {
            if (subItem.getFlag('core', 'sourceId') === undefined) continue;
            if (subItem.getFlag('core', 'sourceId').split('.')[1] !== sourceId) continue;
            let original = await fromUuid(subItem.getFlag('core', 'sourceId'));
            subItem.name = original.name;
            subItem.img = original.img;
            subItem.system.description = original.system.description;
            if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(subItem.type)) {
                subItem.system.attributes = original.system.attributes;
            }
            else if (subItem.type === "aspect") {
                subItem.system.function = original.system.function;
                subItem.system.dataGroup = original.system.dataGroup;
                subItem.system.data = original.system.data;
                subItem.system.damageType = original.system.damageType;
            }
            else {
                console.warn("Unknown type : " + subItem.type);
            }
            updateDocument = true;
        }
        if (updateDocument) await item.saveSubItems();
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

}
