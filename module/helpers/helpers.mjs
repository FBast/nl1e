import {PL1E} from "../pl1e.mjs";

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
            // Split path into parts parts
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
                const flatObject = foundry.utils.flattenObject(obj[i]);
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
     * Get a document from a compendium or from the world by ID
     * @param {string} type - The document type ("Item", "Actor", "Token", "Macro", etc.)
     * @param {string} id - The document ID to search
     * @param {Object} options - Optional parameters (e.g., scene)
     * @returns {Promise<foundry.abstract.Document>} - The resolved document or undefined
     */
    static async getDocument(type, id, options = {}) {
        let document = undefined;

        // Check compendiums first
        for (const pack of game.packs.filter(pack => pack.documentName === type)) {
            document = await pack.getDocument(id);
            if (document) break;
        }

        // Check world collections
        if (!document) {
            switch (type) {
                case "Item":
                    document = game.items.get(id);
                    break;
                case "Actor":
                    document = game.actors.get(id);
                    break;
                case "Token":
                    if (!options.scene) throw new Error("PL1E | getDocument with Token type requires a scene in options");
                    document = options.scene.tokens.get(id);
                    break;
                case "Macro":
                    document = game.macros.get(id);
                    break;
                case "RollTable":
                    document = game.tables.get(id);
                    break;
                case "Scene":
                    document = game.scenes.get(id);
                    break;
                case "JournalEntryPage":
                    document = game.journal.reduce((found, entry) => {
                        return found || entry.pages.get(id);
                    }, null);
                    break;
            }
        }

        // Using uuid in last case
        if (!document)
            document = await fromUuid(id);

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

    static async getDocumentsDataFromPack(packName, includeNone = false) {
        const documents = {};
        if (includeNone) documents["none"] = {
            label: "PL1E.None.M"
        };

        const pack = game.packs.find(pack => pack.metadata.name === packName);
        const docs = await pack.getDocuments();

        // Order by name
        const sortedDocs = docs.sort((a, b) => a.name.localeCompare(b.name));

        for (const document of sortedDocs) {
            documents[document._id] = {
                label: document.name
            };
        }

        return documents;
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
        let data = PL1E;
        for (let key of keys) {
            // Ignore if not string
            if (typeof key !== "string") continue;

            data = data[key];
            if (data === undefined) {
                console.warn(`PL1E | config return is undefined with keys ${keys}`);
                break;
            }
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
        let itemCopy = foundry.utils.duplicate(item);
        cleanObject(itemCopy.system, model, removed);
        console.log("PL1E | removed system properties:", removed);
        await item.update({ system: itemCopy.system }, { merge: false });
    }

    static levelToXP(actor, level) {
        if (level === 0) return 0;
        const levelCaps = this.levelCaps(actor);
        const xp = levelCaps[level - 1];
        return xp === undefined ? levelCaps[levelCaps.length - 1] : xp;
    }

    static XPToLevel(actor, xp) {
        const levelCaps = this.levelCaps(actor);
        let level = 0;
        for (let levelCap of levelCaps) {
            if (levelCap <= xp) level++;
            else break;
        }
        return level;
    }

    static applyResolution(value, roll, resolutionType) {
        let resolvedValue = value;
        switch (resolutionType) {
            case "multipliedBySuccess":
                resolvedValue *= roll > 0 ? roll : 0;
                break;
            case "ifSuccess":
                resolvedValue = roll > 0 ? roll : 0;
                break;
        }
        return resolvedValue;
    }

    static assignIfDefined(source, target, condition, sourceProperty, targetProperty = sourceProperty) {
        if (condition && source[sourceProperty] !== undefined) {
            target[targetProperty] = source[sourceProperty];
        }
    }

    static displayScrollingText(data) {
        const minSize = game.settings.get("pl1e", "scrollingTextMinFont");
        const maxSize = game.settings.get("pl1e", "scrollingTextMaxFont");
        const duration = game.settings.get("pl1e", "scrollingTextDuration");
        const options = {
            duration: duration * 1000,
            fontSize: Math.clamp(data.fontSize * maxSize, minSize, maxSize),
            fill: data.fillColor,
        }
        canvas.interface.createScrollingText(data.position, data.text, options);
    }

    static async centerAndSelectToken(tokenId) {
        const token = canvas.tokens.get(tokenId);
        if (!token) return;

        // Pan camera on the token
        await canvas.animatePan({
            x: token.center.x,
            y: token.center.y,
            duration: 250
        });

        // Select token if owner
        if (token.owner) {
            token.control({releaseOthers: true});
        }
    }

    static levelCaps(actor) {
        const classNumber = Math.max(actor.items.filter(item => item.type === "class").length, 1);
        const key = classNumber === 1 ? "monoClassLevelCaps" : "multiClassLevelCaps";
        return game.settings.get("pl1e", key).split(',').map(x => parseInt(x.trim()));
    }

    static sortDocuments(context) {
        // Define an object containing specific sorting functions for each type of document
        const sortFunctions = {
            background: (a, b) => {
                const backgroundOrder = ["race", "culture", "class", "mastery"];

                // Compare using background order
                let typeComparison = backgroundOrder.indexOf(a.type) - backgroundOrder.indexOf(b.type);
                if (typeComparison !== 0) {
                    return typeComparison;
                }

                // Then compare by name
                return a.name.localeCompare(b.name);
            },
            abilities: (a, b) => {
                const abilitiesOrder = Object.keys(PL1E.activations);

                // Sort enabled abilities first
                if (a.isEnabled && !b.isEnabled) return -1;
                if (!a.isEnabled && b.isEnabled) return 1;

                // Compare by level
                if (a.system.attributes.level < b.system.attributes.level) return -1;
                if (a.system.attributes.level > b.system.attributes.level) return 1;

                // Then Compare by activation using the abilities order
                let activationComparison = abilitiesOrder.indexOf(a.system.attributes.activation)
                    - abilitiesOrder.indexOf(b.system.attributes.activation);
                if (activationComparison !== 0) {
                    return activationComparison;
                }

                // Then compare by name
                return a.name.localeCompare(b.name);
            },
            features: (a, b) => b.system.points - a.system.points,
            weapons: (a, b) => a.name.localeCompare(b.name),
            wearables: (a, b) => a.name.localeCompare(b.name),
            consumables: (a, b) => {
                const consumables = Object.keys(PL1E.consumableActivations);

                // Compare by activation using the consumable order
                let activationComparison = consumables.indexOf(a.system.attributes.activation)
                    - consumables.indexOf(b.system.attributes.activation);
                if (activationComparison !== 0) {
                    return activationComparison;
                }

                // Then compare by name
                return a.name.localeCompare(b.name);
            },
            commons: (a, b) => a.name.localeCompare(b.name),
            modules: (a, b) => a.name.localeCompare(b.name)
        };

        // List of object to sort
        const categories = ["background", "abilities", "features", "weapons", "wearables", "consumables", "commons", "modules"];

        // Apply sorting on context
        for (let category of categories) {
            if (context[category] && sortFunctions[category]) {
                context[category] = context[category].sort(sortFunctions[category]);
            }
        }
    }

    static hexToRgba(hex, alpha = 0.5) {
        hex = hex.replace('#', '');

        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    static tokensWithinTemplate(template) {
        const tokens = template.object.scene.tokens.contents;

        const shape = template.object.shape;
        const containedTokens = [];

        // Template's position on the canvas
        const gridSize = template.object.scene.grid.size;
        const templateX = template.x;
        const templateY = template.y;

        tokens.forEach(token => {
            const tokenX = token.x;
            const tokenY = token.y;
            let contains = false;

            switch (shape.constructor) {
                case PIXI.Rectangle: {
                    // Adjust width and height if they are zero
                    const width = shape.width === 0 ? gridSize : shape.width;
                    const height = shape.height === 0 ? gridSize : shape.height;

                    const rect = new PIXI.Rectangle(
                        shape.x + templateX - gridSize / 2,
                        shape.y + templateY - gridSize / 2,
                        width,
                        height
                    );
                    contains = rect.contains(tokenX, tokenY);
                    break;
                }
                case PIXI.Circle: {
                    const radius = shape.radius === 0 ? gridSize / 2 : shape.radius;
                    const circle = new PIXI.Circle(
                        shape.x + templateX - gridSize / 2,
                        shape.y + templateY - gridSize / 2,
                        radius
                    );
                    contains = circle.contains(tokenX, tokenY);
                    break;
                }
                case PIXI.Polygon: {
                    const points = shape.points.map((p, i) => i % 2 === 0 ? p + templateX - gridSize / 2 : p + templateY - gridSize / 2);
                    const poly = new PIXI.Polygon(points);
                    contains = poly.contains(tokenX, tokenY);
                    break;
                }
                default:
                    console.warn("Shape type not supported:", shape.constructor);
                    break;
            }

            if (contains) {
                containedTokens.push(token);
            }
        });

        return containedTokens;
    }
}
