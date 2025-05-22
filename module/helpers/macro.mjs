export class Pl1eMacro {

    /**
     * Activate an item by ID on an actor by ID.
     * @param {string} actorId
     * @param {string} itemId
     * @returns {Promise<boolean>}
     */
    static async activateItem(actorId, itemId) {
        const actor = game.actors.get(actorId);
        if (!actor) {
            console.warn(`Pl1eMacro.activateItem: Actor '${actorId}' not found.`);
            return false;
        }

        const item = actor.items.get(itemId);
        if (!item) {
            console.warn(`Pl1eMacro.activateItem: Item '${itemId}' not found on '${actor.name}'.`);
            return false;
        }

        await item.activate?.();
        return true;
    }

    /**
     * Create a macro from a drag/drop event.
     * @param {object} dropData
     * @param {object} [options]
     */
    static async createMacroFromDrop(dropData, options = {}) {
        if (dropData.type !== "Item") return;

        const itemData = await Item.implementation.fromDropData(dropData);
        if (!itemData) {
            ui.notifications.info(game.i18n.localize("PL1E.Unowned"));
            return;
        }

        const actor = itemData.parent;
        if (!actor) {
            ui.notifications.warn("No actor found for macro creation.");
            return;
        }

        return this._createMacroFromData({ actorId: actor.id, itemData }, options);
    }

    /**
     * Create a macro from actor and item directly.
     * @param {Actor} actor
     * @param {Item} item
     * @param {object} [options]
     */
    static async createMacroFromItem(actor, item, options = {}) {
        if (!actor || !item) return;

        return this._createMacroFromData({
            actorId: actor.id,
            itemData: item
        }, options);
    }

    /**
     * Internal shared macro creation logic.
     * @param {object} input
     * @param {string} input.actorId
     * @param {Item} input.itemData
     * @param {object} options
     * @param {object} [options.flags]
     * @param {string} [options.folderName]
     * @param {number} [options.slot]
     */
    static async _createMacroFromData({ actorId, itemData }, { flags = {}, folderName = undefined, slot = undefined } = {}) {
        const macroData = {
            type: "script",
            scope: "actor",
            name: itemData.name,
            img: itemData.img,
            itemId: itemData.id,
            command: `game.pl1e.Pl1eMacro.activateItem("${actorId}", "${itemData._id}")`,
            flags
        };

        if (folderName) {
            let folder = game.folders.find(f => f.name === folderName && f.type === "Macro");
            if (!folder) {
                folder = await Folder.create({
                    name: folderName,
                    type: "Macro",
                    sorting: "a"
                });
            }
            macroData.folder = folder.id;
        }

        const macro = game.macros.find(m =>
            m.name === macroData.name &&
            m.itemId === macroData.itemId &&
            m.command === macroData.command &&
            m.author === game.user
        ) || await Macro.create(macroData);

        if (slot) await game.user.assignHotbarMacro(macro, slot);
        return macro;
    }
}