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
        return await this.getTarget(itemName, "Item").activate();
    }

    /**
    * Attempt to create a macro.mjs from the dropped data. Will use an existing macro.mjs if one exists.
    * @param {object} dropData     The dropped data
    * @param {number} slot         The hotbar slot to use
    */
    static async createMacro(dropData, slot) {
        const macroData = { type: "script", scope: "actor" };
        if (dropData.type !== "Item") return;
        const itemData = await Item.implementation.fromDropData(dropData);
        if ( !itemData ) return ui.notifications.info(game.i18n.localize("PL1E.Unowned"));
        foundry.utils.mergeObject(macroData, {
            name: itemData.name,
            img: itemData.img,
            command: `game.pl1e.Pl1eMacro.activateItem("${itemData.name}")`,
            flags: {"pl1e.itemMacro": true}
        });

        // Assign the macro.mjs to the hotbar
        const macro = game.macros.find(m => (m.name === macroData.name) && (m.command === macroData.command)
            && m.author.isSelf) || await Macro.create(macroData);
        await game.user.assignHotbarMacro(macro, slot);
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
        if ( !actor ) return ui.notifications.info(game.i18n.localize("PL1E.NoActorSelected"));

        const collection = (documentType === "Item") ? actor.items : actor.effects;
        const nameKeyPath = (documentType === "Item") ? "name" : "label";

        // Find item in collection
        const documents = collection.filter(i => foundry.utils.getProperty(i, nameKeyPath) === name);
        const type = game.i18n.localize(`DOCUMENT.${documentType}`);
        if ( documents.length === 0 ) {
            return ui.notifications.info(game.i18n.format("PL1E.MissingTarget", { actor: actor.name, type, name }));
        }
        if ( documents.length > 1 ) {
            ui.notifications.info(game.i18n.format("PL1E.MultipleTargets", { actor: actor.name, type, name }));
        }
        return documents[0];
    }

}