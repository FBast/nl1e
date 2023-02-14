export class Pl1eMacro {

    /**
    * Trigger an item to roll when a macro.js is clicked.
    * @param {string} itemName                Name of the item on the selected actor to trigger.
    * @returns {Promise<ChatMessage|object>}  Roll result.
    */
    static rollItem(itemName) {
        return this.getMacroTarget(itemName, "Item")?.use();
    }

    /**
    * Toggle an effect on and off when a macro.js is clicked.
    * @param {string} effectLabel       Label for the effect to be toggled.
    * @returns {Promise<ActiveEffect>}  The effect after it has been toggled.
    */
    static toggleEffect(effectLabel) {
        const effect = this.getMacroTarget(effectLabel, "ActiveEffect");
        return effect?.update({disabled: !effect.disabled});
    }

    /**
    * Attempt to create a macro.js from the dropped data. Will use an existing macro.js if one exists.
    * @param {object} dropData     The dropped data
    * @param {number} slot         The hotbar slot to use
    */
    static async createMacro(dropData, slot) {
        const macroData = { type: "script", scope: "actor" };
        switch ( dropData.type ) {
            case "Item":
                const itemData = await Item.implementation.fromDropData(dropData);
                if ( !itemData ) return ui.notifications.warn(game.i18n.localize("MACRO.UnownedWarn"));
                foundry.utils.mergeObject(macroData, {
                    name: itemData.name,
                    img: itemData.img,
                    // command: this.rollItem(itemData.name),
                    command: `game.pl1e.Pl1eMacro.rollItem("${itemData.name}")`,
                    flags: {"pl1e.itemMacro": true}
                });
                break;
            case "ActiveEffect":
                const effectData = await ActiveEffect.implementation.fromDropData(dropData);
                if ( !effectData ) return ui.notifications.warn(game.i18n.localize("MACRO.UnownedWarn"));
                foundry.utils.mergeObject(macroData, {
                    name: effectData.label,
                    img: effectData.icon,
                    command: this.toggleEffect(effectData.label),
                    // command: `game.pl1e.toggleEffect("${effectData.label}")`,
                    flags: {"pl1e.effectMacro": true}
                });
                break;
            default:
                return;
        }

        // Assign the macro.js to the hotbar
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
    static getMacroTarget(name, documentType) {
        let actor;
        const speaker = ChatMessage.getSpeaker();
        if ( speaker.token ) actor = game.actors.tokens[speaker.token];
        actor ??= game.actors.get(speaker.actor);
        if ( !actor ) return ui.notifications.warn(game.i18n.localize("MACRO.NoActorSelectedWarn"));

        const collection = (documentType === "Item") ? actor.items : actor.effects;
        const nameKeyPath = (documentType === "Item") ? "name" : "label";

        // Find item in collection
        const documents = collection.filter(i => foundry.utils.getProperty(i, nameKeyPath) === name);
        const type = game.i18n.localize(`DOCUMENT.${documentType}`);
        if ( documents.length === 0 ) {
            return ui.notifications.warn(game.i18n.format("MACRO.MissingTargetWarn", { actor: actor.name, type, name }));
        }
        if ( documents.length > 1 ) {
            ui.notifications.warn(game.i18n.format("MACRO.5eMultipleTargetsWarn", { actor: actor.name, type, name }));
        }
        return documents[0];
    }

}