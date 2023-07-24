import {PL1E} from "./config/config.mjs";
// Import document classes.
import {Pl1eActor} from "./documents/actors/actor.mjs";
import {Pl1eItem} from "./documents/items/item.mjs";
// Import subDocument classes
import {Pl1eActorProxy} from "./documents/actors/actorProxy.mjs";
import {Pl1eItemProxy} from "./documents/items/itemProxy.mjs";
// Import sheet classes.
import {Pl1eActorSheet} from "./sheets/actor-sheet.mjs";
import {Pl1eItemSheet} from "./sheets/item-sheet.mjs";
import {Pl1eJournalPageSheet} from "./sheets/journal-sheet.mjs";
// Import helper/utility classes and constants.
import {preloadHandlebarsTemplates} from "./main/templates.mjs";
import {Pl1eMacro} from "./helpers/macro.mjs";
import {Pl1eCombat} from "./apps/combat.mjs";
import {Pl1eTokenDocument} from "./documents/token.mjs";
import Pl1eHooks from "./main/hooks.mjs";
import {RegisterSettings} from "./main/settings.mjs";
import {RegisterHandlebars} from "./main/handlebars.mjs";
import {GmToolbox} from "./apps/gmToolbox.mjs";
import {Pl1eCombatant} from "./documents/combatant.mjs";

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

Hooks.once('init', async function () {
    // Add utility classes to the layout game object so that they're more easily
    // accessible in layout contexts.
    game.pl1e = {
        Pl1eActor,
        Pl1eItem,
        Pl1eMacro,
        GmToolbox
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
    CONFIG.Actor.documentClass = Pl1eActorProxy;
    CONFIG.Item.documentClass = Pl1eItemProxy;
    CONFIG.Combat.documentClass = Pl1eCombat;
    CONFIG.Token.documentClass = Pl1eTokenDocument;
    CONFIG.Combatant.documentClass = Pl1eCombatant;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pl1e", Pl1eActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pl1e", Pl1eItemSheet, {makeDefault: true});
    DocumentSheetConfig.registerSheet(JournalEntryPage, "pl1e", Pl1eJournalPageSheet, {
        types: ["location", "organization"]
    })

    // Register custom system settings
    RegisterSettings();

    // Register custom Handlebars Helpers
    RegisterHandlebars();

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();
});

/* ------------------------------------ */
/*  Hooks Once                           */
/* ------------------------------------ */

Hooks.once("ready", Pl1eHooks.ready);
Hooks.once("socketlib.ready", Pl1eHooks.socketLibReady);
Hooks.once("dragRuler.ready", (SpeedProvider) => Pl1eHooks.dragRulerReady(SpeedProvider));

/* ------------------------------------ */
/*  Hooks On                             */
/* ------------------------------------ */

Hooks.on("renderChatMessage", (app, html, data) => Pl1eHooks.renderChatMessage(app, html, data));