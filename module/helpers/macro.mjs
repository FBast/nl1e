export class Pl1eMacro {

    /**
    * Trigger an item to roll when a macro.mjs is clicked.
    * @param {string} itemName                Name of the item on the selected actor to trigger.
    * @returns {Promise<ChatMessage|object>}  Roll result.
    */
    static rollItem(itemName) {
        return this.getTarget(itemName, "Item")?.use();
    }

    /**
    * Toggle an effect on and off when a macro.mjs is clicked.
    * @param {string} effectLabel       Label for the effect to be toggled.
    * @returns {Promise<ActiveEffect>}  The effect after it has been toggled.
    */
    static toggleEffect(effectLabel) {
        const effect = this.getTarget(effectLabel, "ActiveEffect");
        return effect?.update({disabled: !effect.disabled});
    }

    /**
     * Activate an item when a macro is clicked
     * @param {string} itemName
     * @returns {Promise<boolean>}
     */
    static async activateItem(itemName) {
        const target = this.getTarget(itemName, "Item");
        if (target) await target.activate();
    }

    /**
     * Attempt to create a macro from the dropped data. Will use an existing macro if one exists.
     * @param {object} dropData             The dropped data
     * @param {number} slot                 The hotbar slot to use
     * @param {object} [options]            Additional options
     * @param {object} [options.flags]      Optional flags to apply to the macro
     * @param {object} [options.slot]       Optional flags to define a slot for the macro
     * @param {string} [options.folderName] Optional folder name to place the macro into
     */
    static async createMacro(dropData, { flags = {}, folderName = undefined, slot = undefined } = {}) {
        if (dropData.type !== "Item") return;

        const itemData = await Item.implementation.fromDropData(dropData);
        if (!itemData) return ui.notifications.info(game.i18n.localize("PL1E.Unowned"));

        const macroData = {
            type: "script",
            scope: "actor",
            name: itemData.name,
            img: itemData.img,
            itemId: itemData.id,
            command: `game.pl1e.Pl1eMacro.activateItem("${itemData.name}")`,
            flags
        };

        // Automatically find or create the folder if folderName is provided
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

        // Reuse existing macro if same name + command + author
        const macro = game.macros.find(m =>
            m.name === macroData.name &&
            m.itemId === macroData.itemId &&
            m.command === macroData.command &&
            m.author === game.user
        ) || await Macro.create(macroData);

        if (slot) await game.user.assignHotbarMacro(macro, slot);
        return macro;
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
        if ( !actor ) {
            ui.notifications.info(game.i18n.localize("PL1E.NoActorSelected"));
            return null;
        }

        const collection = (documentType === "Item") ? actor.items : actor.effects;
        const nameKeyPath = (documentType === "Item") ? "name" : "label";

        // Find item in collection
        const documents = collection.filter(i => foundry.utils.getProperty(i, nameKeyPath) === name);
        const type = game.i18n.localize(`DOCUMENT.${documentType}`);
        if ( documents.length === 0 ) {
            ui.notifications.info(game.i18n.format("PL1E.NoItemFound", { actor: actor.name, type, name }));
            return null;
        }
        return documents[0];
    }
}