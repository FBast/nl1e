import {Pl1eHelpers} from "./helpers.mjs";

export class Pl1eMacro {

    /**
    * Trigger an item to roll when a macro.mjs is clicked.
    * @param {string} itemName                Name of the item on the selected actor to trigger.
    * @returns {Promise<ChatMessage|object>}  Roll result.
    */
    static rollItem(itemName) {
        return Pl1eHelpers.getTarget(itemName, "Item")?.use();
    }

    /**
    * Toggle an effect on and off when a macro.mjs is clicked.
    * @param {string} effectLabel       Label for the effect to be toggled.
    * @returns {Promise<ActiveEffect>}  The effect after it has been toggled.
    */
    static toggleEffect(effectLabel) {
        const effect = Pl1eHelpers.getTarget(effectLabel, "ActiveEffect");
        return effect?.update({disabled: !effect.disabled});
    }

    /**
    * Attempt to create a macro.mjs from the dropped data. Will use an existing macro.mjs if one exists.
    * @param {object} dropData     The dropped data
    * @param {number} slot         The hotbar slot to use
    */
    static async createMacro(dropData, slot) {
        const macroData = { type: "script", scope: "actor" };
        switch ( dropData.type ) {
            case "Item":
                const itemData = await Item.implementation.fromDropData(dropData);
                if ( !itemData ) return ui.notifications.warn(game.i18n.localize("WARN.Unowned"));
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
                if ( !effectData ) return ui.notifications.warn(game.i18n.localize("WARN.Unowned"));
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

        // Assign the macro.mjs to the hotbar
        const macro = game.macros.find(m => (m.name === macroData.name) && (m.command === macroData.command)
            && m.author.isSelf) || await Macro.create(macroData);
        await game.user.assignHotbarMacro(macro, slot);
    }

}