// Import document classes.
import {Pl1eActor} from "./documents/actor.mjs";
import {Pl1eItem} from "./documents/item.mjs";
// Import sheet classes.
import {Pl1eActorSheet} from "./sheets/actor-sheet.mjs";
import {Pl1eItemSheet} from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";
import {PL1E} from "./helpers/config.mjs";
import SocketPl1e from "./helpers/socket.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {

    // Add utility classes to the layout game object so that they're more easily
    // accessible in layout contexts.
    game.pl1e = {
        Pl1eActor,
        Pl1eItem,
        rollItem
    };

    // Add custom constants for configuration.
    CONFIG.PL1E = PL1E;

    /**
     * Set an initiative formula for the system
     * @type {String}
     */
    CONFIG.Combat.initiative = {
        formula: "1d20 + @characteristics.agi.mod",
        decimals: 2
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = Pl1eActor;
    CONFIG.Item.documentClass = Pl1eItem;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pl1e", Pl1eActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pl1e", Pl1eItemSheet, {makeDefault: true});

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
        if (typeof arguments[arg] != 'object') {
            outStr += arguments[arg];
        }
    }
    return outStr;
});

Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
});

Handlebars.registerHelper('minus', function(a, b) {
    return a - b;
})

Handlebars.registerHelper('configEntry', function (key, entry) {
    return PL1E[key][entry];
})

Handlebars.registerHelper('config', function (key) {
    return PL1E[key];
})

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (["Item", "ActiveEffect"].includes(data.type) ) {
            createMacro(data, slot);
            return false;
        }
    });
});

Hooks.once("socketlib.ready", () => {
    PL1E.socket = socketlib.registerSystem("pl1e");
    PL1E.socket.register("sendItem", function (data) {
        SocketPl1e.sendItem(data.actor, data.targetActor, data.item)
    })
    PL1E.socket.register("sendContenant", function (data) {
        SocketPl1e.sendContenant(data.actor, data.targetActor, data.item);
    })
})

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Attempt to create a macro from the dropped data. Will use an existing macro if one exists.
 * @param {object} dropData     The dropped data
 * @param {number} slot         The hotbar slot to use
 */
async function createMacro(dropData, slot) {
    const macroData = { type: "script", scope: "actor" };
    switch ( dropData.type ) {
        case "Item":
            const itemData = await Item.implementation.fromDropData(dropData);
            if ( !itemData ) return ui.notifications.warn(game.i18n.localize("MACRO.5eUnownedWarn"));
            foundry.utils.mergeObject(macroData, {
                name: itemData.name,
                img: itemData.img,
                command: `game.pl1e.rollItem("${itemData.name}")`,
                flags: {"pl1e.itemMacro": true}
            });
            break;
        case "ActiveEffect":
            const effectData = await ActiveEffect.implementation.fromDropData(dropData);
            if ( !effectData ) return ui.notifications.warn(game.i18n.localize("MACRO.5eUnownedWarn"));
            foundry.utils.mergeObject(macroData, {
                name: effectData.label,
                img: effectData.icon,
                command: `game.pl1e.toggleEffect("${effectData.label}")`,
                flags: {"pl1e.effectMacro": true}
            });
            break;
        default:
            return;
    }

    // Assign the macro to the hotbar
    const macro = game.macros.find(m => (m.name === macroData.name) && (m.command === macroData.command)
        && m.author.isSelf) || await Macro.create(macroData);
    await game.user.assignHotbarMacro(macro, slot);
}

/* -------------------------------------------- */

/**
 * Find a document of the specified name and type on an assigned or selected actor.
 * @param {string} name          Document name to locate.
 * @param {string} documentType  Type of embedded document (e.g. "Item" or "ActiveEffect").
 * @returns {Document}           Document if found, otherwise nothing.
 */
function getMacroTarget(name, documentType) {
    let actor;
    const speaker = ChatMessage.getSpeaker();
    if ( speaker.token ) actor = game.actors.tokens[speaker.token];
    actor ??= game.actors.get(speaker.actor);
    if ( !actor ) return ui.notifications.warn(game.i18n.localize("MACRO.5eNoActorSelected"));

    const collection = (documentType === "Item") ? actor.items : actor.effects;
    const nameKeyPath = (documentType === "Item") ? "name" : "label";

    // Find item in collection
    const documents = collection.filter(i => foundry.utils.getProperty(i, nameKeyPath) === name);
    const type = game.i18n.localize(`DOCUMENT.${documentType}`);
    if ( documents.length === 0 ) {
        return ui.notifications.warn(game.i18n.format("MACRO.5eMissingTargetWarn", { actor: actor.name, type, name }));
    }
    if ( documents.length > 1 ) {
        ui.notifications.warn(game.i18n.format("MACRO.5eMultipleTargetsWarn", { actor: actor.name, type, name }));
    }
    return documents[0];
}

/* -------------------------------------------- */

/**
 * Trigger an item to roll when a macro is clicked.
 * @param {string} itemName                Name of the item on the selected actor to trigger.
 * @returns {Promise<ChatMessage|object>}  Roll result.
 */
function rollItem(itemName) {
    return getMacroTarget(itemName, "Item")?.use();
}

/* -------------------------------------------- */

/**
 * Toggle an effect on and off when a macro is clicked.
 * @param {string} effectLabel       Label for the effect to be toggled.
 * @returns {Promise<ActiveEffect>}  The effect after it has been toggled.
 */
function toggleEffect(effectLabel) {
    const effect = getMacroTarget(effectLabel, "ActiveEffect");
    return effect?.update({disabled: !effect.disabled});
}