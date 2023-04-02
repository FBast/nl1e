import {Pl1eItem} from "../documents/item.mjs";

/**
 * Extends the actor to process special things from PL1E.
 */
export class Pl1eHelpers {

    /**
     * Return the target object on a drag n drop event, or null if not found
     * @param {DragEvent} event
     * @return {Promise<null>}
     */
    static async getDragNDropTargetObject(event) {
        let data;
        try {
            data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        } catch (err) {
            return null;
        }
        return await Pl1eHelpers.getObjectGameOrPack(data);
    }

    /**
     * Return the object from Game or Pack by his ID, or null if not found
     * @param {string}      uuid     "Item.5qI6SU85VSFqji8W"
     * @param {string}      id       "5qI6SU85VSFqji8W"
     * @param {string}      type     Type ("Item", "JournalEntry"...)
     * @param {any[]|null}  data     Plain document data
     * @param {string|null} pack     Pack name
     * @param {string|null} parentId Used to avoid an infinite loop in properties if set
     * @return {Promise<null>}
     */
    static async getObjectGameOrPack({ uuid, id, type, data = null, pack = null, parentId = null }) {
        let document = null;

        try {
            // Direct Object
            if (data?._id) {
                document = Pl1eHelpers.createDocumentFromCompendium({ type, data });
            } else if (!uuid && (!id || !type)) {
                return null;
            }

            // UUID
            if (!document && !!uuid) {
                document = await fromUuid(uuid);
            }
            // TODO need to migrate to UUID

            // Named pack
            if (!document) {
                // If no pack passed, but it's a core item, we know the pack to get it
                if (!pack && id.substring(0, 7) === "PLCore") {
                    pack = Pl1eHelpers.getPackNameForCoreItem(id);
                }

                if (pack) {
                    const tmpData = await game.packs.get(pack).getDocument(id);
                    if (tmpData) {
                        document = Pl1eHelpers.createDocumentFromCompendium({ type, data: tmpData });
                    }
                }
            }

            // Game object
            if (!document) {
                document = CONFIG[type].collection.instance.get(id);
            }

            // Unknown pack object, iterate all packs
            if (!document) {
                for (const comp of game.packs) {
                    const tmpData = await comp.getDocument(id);
                    if (tmpData) {
                        document = Pl1eHelpers.createDocumentFromCompendium({ type, data: tmpData });
                    }
                }
            }

            // Final
            if (document) {
                // Care to infinite loop in properties
                if (!parentId) {
                    await Pl1eHelpers.refreshItemProperties(document);
                }
                document.prepareData();
            }
        } catch (err) {
            console.warn("PL1E | ", err);
        }
        return document;
    }

    /**
     * Make a temporary item for compendium drag n drop
     * @param {string}          type
     * @param {Pl1eItem|JournalPl1e|any[]} data
     * @return {Pl1eItem}
     */
    static createDocumentFromCompendium({ type, data }) {
        let document = null;

        switch (type) {
            case "Item":
                if (data instanceof Pl1eItem) {
                    document = data;
                } else {
                    document = new Pl1eItem(data);
                }
                break;

            // case "JournalEntry":
            //     if (data instanceof game.l5r5e.JournalL5r5e) {
            //         document = data;
            //     } else {
            //         document = new game.l5r5e.JournalL5r5e(data);
            //     }
            //     break;

            default:
                console.log(`PL1E | createObjectFromCompendium - Unmanaged type ${type}`);
                break;
        } // swi

        return document;
    }

    /**
     * Babele and properties specific
     * @param {Document} document
     * @return {Promise<void>}
     */
    static async refreshItemProperties(document) {
        if (document.system?.properties && typeof Babele !== "undefined") {
            document.system.properties = await Promise.all(
                document.system.properties.map(async (property) => {
                    const gameProp = await Pl1eHelpers.getObjectGameOrPack({
                        id: property.id,
                        type: "Item",
                        parentId: document._id || 1,
                    });
                    if (gameProp) {
                        return { id: gameProp.id, name: gameProp.name };
                    } else {
                        console.warn(`L5R5E | Unknown property id[${property.id}]`);
                    }
                    return property;
                })
            );
            document.updateSource({ "system.properties": document.system.properties });
        }
    }

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
    static async resetClones(item) {
        // Reset items subItems
        for (const subItem of game.items) {
            if (subItem.system.subItemsMap === undefined) continue;
            await this.resetCloneSubItems(subItem, item._id);
        }
        // Reset actors items
        for (const actor of game.actors) {
            await this.resetCloneActorItems(actor, item._id);
        }
    }

    /**
     * Reset this actor items (if sourceId is corresponding source)
     * @param actor
     * @param sourceId
     * @returns {Promise<void>}
     */
    static async resetCloneActorItems(actor, sourceId) {
        let updateDocument = false;
        const itemsData = [];
        for (let item of actor.items.values()) {
            if (item.getFlag('core', 'sourceId') === undefined) return;
            if (item.getFlag('core', 'sourceId').split('.')[1] !== sourceId) return;
            let original = await fromUuid(item.getFlag('core', 'sourceId'));
            if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(item.type)) {
                itemsData.push({
                    "_id": item._id,
                    "name": original.name,
                    "img": original.img,
                    "system.attributes": original.system.attributes,
                    "system.optionalAttributes": original.system.optionalAttributes
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
            actor.sheet.render(actor.sheet.rendered);
        }
    }

    /**
     * Reset this item subItem (if sourceId is corresponding source)
     * @param item
     * @param sourceId
     * @returns {Promise<void>}
     */
    static async resetCloneSubItems(item, sourceId) {
        let updateDocument = false;
        for (let [key, subItem] of item.system.subItemsMap) {
            if (subItem.getFlag('core', 'sourceId') === undefined) continue;
            if (subItem.getFlag('core', 'sourceId').split('.')[1] !== sourceId) continue;
            let original = await fromUuid(subItem.getFlag('core', 'sourceId'));
            if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(subItem.type)) {
                subItem.name = original.name;
                subItem.img = original.img;
                subItem.system.attributes = original.system.attributes;
                subItem.system.optionalAttributes = original.system.optionalAttributes;
                subItem.sheet.render(subItem.sheet.rendered);
                updateDocument = true;
            }
            else {
                console.warn("Unknown type : " + subItem.type);
            }
        }
        if (updateDocument) await item.saveEmbedItems();
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

}
