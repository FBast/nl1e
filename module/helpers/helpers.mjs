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

    static flatten(obj) {
        const toReturn = {};

        for (const i in obj) {
            if (!obj.hasOwnProperty(i)) continue;

            if ((typeof obj[i]) == 'object' && obj[i] !== null) {
                const flatObject = flattenObject(obj[i]);
                for (const x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;

                    toReturn[i + '.' + x] = flatObject[x];
                }
            } else {
                toReturn[i] = obj[i];
            }
        }
        return toReturn;
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
     * Check recursive loop for items
     * @param item
     * @param newUuid
     * @returns {Promise<boolean>}
     */
    static async createRecursiveLoop(item, newId) {
        // if (item._id === newId) return true;
        // for (const id of item.system.refItemsParents) {
        //     const subItem = await Pl1eHelpers.getDocument("Item", id);
        //     if (await this.createRecursiveLoop(subItem, newId)) {
        //         return true;
        //     }
        // }
        return false;
    }

    /**
     * Get a document from a compendium if not in the game using id
     * @param {string} type
     * @param {string} id
     * @param {Object} options
     * @returns {Promise<Pl1eItem | Pl1eActor | Macro>}
     */
    static async getDocument(type, id, options = {}) {
        let document = undefined;

        // Search inside compendiums
        for (const pack of game.packs.filter(pack => pack.documentName === type)) {
            document = await pack.getDocument(id);
            if (document) break;
        }

        if (document === undefined || document === null) {
            // Search inside current game
            switch (type) {
                case "Actor":
                    document = game.actors.get(id);
                    break;
                case "Token":
                    document = game.scenes.viewed.tokens.get(id);
                    break;
                case "Item":
                    document = game.items.get(id);
                    break;
                case "Macro":
                    document = game.macros.get(id);
                    break;
            }
        }

        return document;
    }

    /**
     * Get a document from a compendium if not in the game using id
     * @param {string} type
     * @param {string} id
     * @returns {Promise<Pl1eItem[] | Pl1eActor[] | Macro[]>}
     */
    static async getDocuments(type, id = undefined) {
        let documents = [];

        // Search inside compendiums
        for (const pack of game.packs.filter(pack => pack.documentName === type)) {
            for (const document of await pack.getDocuments()) {
                if (id !== undefined && document._id === id) documents.push(document);
                else if (id === undefined) documents.push(document);
            }
        }

        // Search inside world collection game
        let worldCollection;
        switch (type) {
            case "Actor":
                worldCollection = game.actors;
                break;
            case "Item":
                worldCollection = game.items;
                break;
            case "Macro":
                worldCollection = game.macros;
                break;
        }
        for (const document of worldCollection) {
            if (id !== undefined && document._id === id) documents.push(document);
            else if (id === undefined) documents.push(document);
        }

        return documents;
    }

}
