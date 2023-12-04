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
        return {
            x: window.innerWidth / 4,
            y: window.innerHeight / 4
        }
    }

    /**
     * Check recursive loop between parent item and child item or its sub items
     * @param parentItem {Pl1eItem}
     * @param childItem {Pl1eItem}
     * @returns {Promise<boolean>}
     */
    static async createRecursiveLoop(parentItem, childItem) {
        if (parentItem.id === childItem.id) return true;
        for (const refItem of await childItem.getRefItems()) {
            if (await this.createRecursiveLoop(parentItem, refItem.item)) return true;
        }
        return false;
    }

    /**
     * Get a document from a compendium if not in the game using id
     * @param {string} type
     * @param {string} id
     * @param {Object} options
     * @returns {Promise<Pl1eItem | Pl1eActor | Token | Macro | MeasuredTemplate | RollTable>}
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
                case "Item":
                    document = game.items.get(id);
                    break;
                case "Actor":
                    document = game.actors.get(id);
                    break;
                case "Token":
                    if (!options.scene) throw new Error("PL1E | getDocument with Token type need a scene as options")
                    document = options.scene.tokens.get(id)
                    break;
                case "Macro":
                    document = game.macros.get(id);
                    break;
                case "MeasuredTemplate":
                    document = canvas.templates.get(id);
                    break;
                case "RollTable":
                    document = game.tables.get(id);
                    break;
                case "Scene":
                    document = game.scenes.get(id);
                    break;
            }
        }

        return document;
    }

    /**
     * Get a document from a compendium if not in the game using id
     * @param {string} type
     * @param {string} subType
     * @param {string} id
     * @returns {Promise<Pl1eItem[] | Pl1eActor[] | Macro[]>}
     */
    static async getDocuments(type, subType = undefined, id = undefined) {
        let documents = [];

        // Inner function to check conditions and add document if it meets criteria
        const addIfMatches = (document) => {
            if ((id === undefined || document._id === id) && (!subType || document.type === subType)) {
                documents.push(document);
            }
        };

        // Search inside compendiums
        for (const pack of game.packs.filter(pack => pack.documentName === type)) {
            for (const document of await pack.getDocuments()) {
                addIfMatches(document);
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
            // ... other cases as needed ...
        }
        for (const document of worldCollection) {
            addIfMatches(document);
        }

        return documents;
    }

    static async getDocumentsData(type, subType = undefined, id = undefined) {
        // Get documents using the modified getDocuments method
        let documents = await Pl1eHelpers.getDocuments(type, subType, id);

        // Create an object with key-value pairs (UUID: Name)
        let documentsData = {};
        documents.forEach(doc => {
            documentsData[doc.id] = doc.name;
        });

        return documentsData;
    }

    static stringifyWithCircular(obj) {
        const seen = new Set();

        function replacer(key, value) {
            if (value !== null && typeof value === 'object') {
                if (seen.has(value)) {
                    return '[Circular Reference]';
                }
                seen.add(value);
            }
            return value;
        }

        return JSON.stringify(obj, replacer);
    }

    static getConfig(...keys) {
        let data = CONFIG.PL1E;
        for (let key of keys) {
            // Ignore if not string
            if (typeof key !== "string") continue;

            data = data[key];
            if (data === undefined)
                console.warn(`PL1E | config return is undefined with keys ${keys}`);
        }
        return data;
    }

    static multiLocalize(...keys) {
        return keys.map(key => {
            if (!key) return "";  // If the key is undefined or empty, return an empty string
            if (typeof key !== "string") return key;
            let localized = game.i18n.localize(key);
            return localized !== key ? localized : key;  // If localization returns the key itself, it means there's no translation for it
        }).join(' ');
    }

    static async CleanupItem(item) {
        // Load the model from template.json
        const template = await fetch("/systems/pl1e/template.json").then(r => r.json());

        const removed = {}; // Object to store removed properties

        // Function to clean an object based on the model
        function cleanObject(obj, model, removedObj) {
            for (let k in obj) {
                if (k === "passiveAspects" || k === "activeAspects") continue; // Skip these properties
                if (!(k in model)) {
                    removedObj[k] = obj[k];
                    delete obj[k];
                } else if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
                    removedObj[k] = {};
                    cleanObject(obj[k], model[k], removedObj[k]);
                    if (Object.keys(removedObj[k]).length === 0) {
                        delete removedObj[k]; // Remove empty objects from the removed object
                    }
                }
            }
        }

        let itemType = item.type;
        let specificTemplates = template.Item[itemType].templates;
        let model = {...template.Item[itemType]}; // Include direct properties
        delete model.templates; // Exclude the "templates" property
        for (let template of specificTemplates) {
            model = foundry.utils.mergeObject(model, template.Item.templates[template]);
        }
        let itemCopy = duplicate(item);
        cleanObject(itemCopy.system, model, removed);
        console.log("PL1E | Removed system properties:", removed);
        await item.update({ system: itemCopy.system }, { merge: false });
    }


}
