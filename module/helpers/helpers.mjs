/**
 * Extends the actor to process special things from PL1E.
 */
export class Pl1eHelpers {

    /**
     * Return true is a GM is connected
     * @returns {boolean}
     */
    static isGMConnected() {
        let isGMConnected = false;
        for (let user of game.users) {
            if (user.role === 4 && user.active) { // 4 is the role ID for GM
                isGMConnected = true;
                break;
            }
        }
        return isGMConnected;
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
     * Reset all clones using their sourceUuid
     * @param {Item} originalItem
     * @returns {Promise<void>}
     */
    static async resetClones(originalItem) {
        // Update actors embedded items copied of original item
        for (const actor of game.actors) {
            const itemsData = [];
            for (let item of actor.items) {
                if (!item.isEmbedded) continue;
                if (!item.sourceUuid || item.sourceUuid !== originalItem.uuid) continue
                itemsData.push({
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
                });
            }
            await actor.updateEmbeddedDocuments("Item", itemsData);
        }

        // Update actors with this item to add the new item
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceUuid !== originalItem.uuid) continue;
                for (const uuid of actorItem.system.refItemsChildren) {
                    if (actor.items.find(item => item.uuid === uuid)) continue;
                    // Actor does not contain the uuid child as item
                    const newItem = await fromUuid(uuid);
                    await actor.addItem(newItem, actorItem.parentId);
                }
            }
        }

        // Update actors with this item to remove the related embedded items
        for (const actor of game.actors) {
            for (const actorItem of actor.items) {
                if (actorItem.sourceUuid !== originalItem.uuid) continue;
                for (const otherActorItem of actor.items) {
                    if (otherActorItem.childId !== actorItem.parentId) continue;
                    // Other actor item is a child of actor item
                    if (actorItem.system.refItemsChildren.includes(otherActorItem.sourceUuid)) continue;
                    // Other actor item is not in the ref items children array
                    await actor.removeItem(otherActorItem);
                }
            }
        }

        // Render all visible sheets
        const sheets = Object.values(ui.windows).filter(sheet => sheet.rendered);
        sheets.forEach(sheet => sheet.render(true));
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

    /**
     * Center of the screen
     * @returns {{x: number, y: number}}
     */
    static screenCenter() {
        // const canvas = document.getElementById("board");
        return {
            x: window.innerWidth / 4,
            y: window.innerHeight / 4
        }
    }

    /**
     * Retrieve the indexed data for a Document using its UUID. Will never return a result for embedded documents.
     * @param {string} uuid  The UUID of the Document index to retrieve.
     * @returns {object}     Document's index if one could be found.
     */
    static indexFromUuid(uuid) {
        const parts = uuid.split(".");
        let index;

        // Compendium Documents
        if ( parts[0] === "Compendium" ) {
            const [, scope, packName, id] = parts;
            const pack = game.packs.get(`${scope}.${packName}`);
            index = pack?.index.get(id);
        }

        // World Documents
        else if ( parts.length < 3 ) {
            const [docName, id] = parts;
            const collection = CONFIG[docName].collection.instance;
            index = collection.get(id);
        }

        return index || null;
    }

}
