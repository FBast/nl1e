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
                // Flag the source GUID
                if (document.uuid && !document.pack && !document.getFlag("core", "sourceId")) {
                    document.updateSource({ "flags.core.sourceId": document.uuid });
                }

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
     * @param {Pl1eItem} item
     * @returns {Promise<void>}
     */
    static async resetClones(item) {
        for (let [key, value] of Object.entries(game.documentIndex.uuids[item.uuid])) {
            for (let leaf of value) {
                let document = leaf.entry;
                // Resetting sub items
                if (document.system.subItemsMap !== undefined) {
                    for (let [key, subItem] of document.system.subItemsMap) {
                        if (subItem.getFlag('core', 'sourceId') === undefined) continue;
                        if (subItem.getFlag('core', 'sourceId').split('.')[1] !== item._id) continue;
                        let original = await fromUuid(subItem.getFlag('core', 'sourceId'));
                        if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(subItem.type)) {
                            subItem.name = original.name;
                            subItem.img = original.img;
                            subItem.system.description = original.system.description;
                            subItem.system.attributes = original.system.attributes;
                        }
                    }
                    document.saveEmbedItems();
                }
                // Resetting item
                if (document.getFlag('core', 'sourceId') === undefined) continue;
                if (document.getFlag('core', 'sourceId').split('.')[1] !== item._id) continue;
                let original = await fromUuid(document.getFlag('core', 'sourceId'));
                if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(document.type)) {
                    await document.update({
                        "name": original.name,
                        "img": original.img,
                        "system.attributes": original.system.attributes
                    })
                    console.log("PL1E | Resetting the " + document.type + " : " + document._id);
                } else {
                    console.warn("Unknown type : " + document.type);
                }
            }
        }
    }

    /**
     * Reset this document (if sourceId is corresponding source)
     * @param document
     * @param sourceId
     * @returns {Promise<void>}
     */
    static async resetClone(document, sourceId) {
        if (document.getFlag('core', 'sourceId') === undefined) return;
        if (document.getFlag('core', 'sourceId').split('.')[1] !== sourceId) return;
        let original = await fromUuid(document.getFlag('core', 'sourceId'));
        if (['feature', 'ability', 'weapon', 'wearable', 'consumable', 'common'].includes(document.type)) {
            await ChatMessage.create({
                rollMode: game.settings.get('core', 'rollMode'),
                flavor: '[admin] Clone reset',
                content: 'Document ' + document._id + ' has been reset using ' + original._id + ' data'
            });
            await document.update({
                "name": original.name,
                "img": original.img,
                "system.description": original.system.description,
                "system.attributes": original.system.attributes
            })
        } else {
            console.warn("Unknown type : " + document.type);
        }
    }

    /**
     * Convert a value to currency with gold, silver and copper
     * @param value the currency sum
     * @returns {{gold: {value: number}, copper: {value: number}, silver: {value: number}}}
     */
    static unitsToCurrency(value) {
        let currency = {
            "gold": {"value": 0},
            "silver": {"value": 0},
            "copper": {"value": 0}
        };
        currency['gold']['value'] = Math.floor(value / 100);
        value -= currency['gold']['value'] * 100
        currency['silver']['value'] = Math.floor(value / 10);
        value -= currency['silver']['value'] * 10;
        currency['copper']['value'] = value;
        return currency;
    }

    /**
     * Convert currency to value
     * @param currency gold, silver and copper
     * @returns number
     */
    static currencyToUnits(currency) {
        return currency.gold.value * 100 + currency.silver.value * 10 + currency.copper.value;
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
