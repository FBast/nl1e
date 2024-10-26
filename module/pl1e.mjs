// Import document classes
import {Pl1eActor} from "./documents/actors/actor.mjs";
import {Pl1eItem} from "./documents/items/item.mjs";
// Import main classes and functions
import Pl1eHooks from "./main/hooks.mjs";
import {preloadHandlebarsTemplates} from "./main/templates.mjs";
// Import helper/utility classes and constants
import {Pl1eMacro} from "./helpers/macro.mjs";
import {Pl1eActorProxy} from "./documents/actors/actorProxy.mjs";
import {Pl1eItemProxy} from "./documents/items/itemProxy.mjs";
import {Pl1eCombat} from "./apps/combat.mjs";
import {Pl1eTokenDocument} from "./documents/token.mjs";
import {Pl1eActiveEffect} from "./documents/effect.mjs";
import {Pl1eActorSheet} from "./sheets/actor-sheet.mjs";
import {Pl1eItemSheet} from "./sheets/item-sheet.mjs";
import {Pl1eChatMessage} from "./documents/chatMessage.mjs";
import {Pl1eJournalPageSheet} from "./sheets/journal-sheet.mjs";
import {getConfigBase} from "./config/configBase.mjs";
import {getConfigActor} from "./config/configActors.mjs";
import {getConfigItems} from "./config/configItems.mjs";
import {getConfigAspects} from "./config/configAspects.mjs";
import {getConfigTemplates} from "./config/configTemplates.mjs";
import {getConfigRest} from "./config/configRest.mjs";
import {localizeStatuses, registerStatuses} from "./main/statuses.mjs";
import {registerSettings} from "./main/settings.mjs";
import {registerHandlebars} from "./main/handlebars.mjs";
import {Pl1eHelpers} from "./helpers/helpers.mjs";


/* -------------------------------------------- */
/*  Globals                                     */
/* -------------------------------------------- */

// Export PL1E for easier access
export const PL1E = {};

// Register PL1E on system config
CONFIG.PL1E = PL1E;

/* -------------------------------------------- */
/*  Hooks                                       */
/* -------------------------------------------- */

Hooks.once('init', async function () {
    // Add utility classes to the layout game object so that they're more easily
    // accessible in layout contexts.
    game.pl1e = {
        Pl1eActor,
        Pl1eItem,
        Pl1eMacro
    };

    // Set an initiative formula for the system
    CONFIG.Combat.initiative = {
        formula: "@misc.initiative",
        decimals: 2
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = Pl1eActorProxy;
    CONFIG.Item.documentClass = Pl1eItemProxy;
    CONFIG.Combat.documentClass = Pl1eCombat;
    CONFIG.Token.documentClass = Pl1eTokenDocument;
    CONFIG.ActiveEffect.documentClass = Pl1eActiveEffect;
    CONFIG.ChatMessage.documentClass = Pl1eChatMessage;
    // CONFIG.MeasuredTemplate.objectClass = Pl1eMeasuredTemplate;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pl1e", Pl1eActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pl1e", Pl1eItemSheet, {makeDefault: true});
    DocumentSheetConfig.registerSheet(JournalEntryPage, "pl1e", Pl1eJournalPageSheet, {
        types: ["location", "organization", "character"]
    });

    // Register configs
    getConfigBase();
    getConfigActor();
    getConfigItems();
    getConfigAspects();
    getConfigTemplates();
    getConfigRest();

    // Register custom statuses
    registerStatuses();

    // Register custom system settings
    registerSettings();

    // Register custom Handlebars Helpers
    registerHandlebars();

    // Preload Handlebars templates.
    await preloadHandlebarsTemplates();
});

/* ------------------------------------ */
/*  Hooks Once                          */
/* ------------------------------------ */

Hooks.once("ready", async function () {
    // Initialize tracker
    // if (game.user.isGM) await DMTool.initialise();

    // Localize custom statuses
    localizeStatuses();

    // Register dynamic configs
    PL1E.sequencerMacros = await Pl1eHelpers.getDocumentsDataFromPack("legacy-sequencer-macros", true);
    PL1E.actorPreUpdate = await Pl1eHelpers.getDocumentsDataFromPack("legacy-actor-pre-update-macros", true);
    PL1E.tokenPreUpdate = await Pl1eHelpers.getDocumentsDataFromPack("legacy-token-pre-update-macros", true);
    PL1E.targetsResolution = await Pl1eHelpers.getDocumentsDataFromPack("legacy-targets-resolution-macros", true);
    PL1E.invocations = await Pl1eHelpers.getDocumentsDataFromPack("legacy-characters", true);

    // Launch all ready hooks
    Pl1eHooks.ready();
});
Hooks.once("socketlib.ready", Pl1eHooks.socketLibReady);
Hooks.once("dragRuler.ready", (SpeedProvider) => Pl1eHooks.dragRulerReady(SpeedProvider));

/* ------------------------------------ */
/*  Hooks On                            */
/* ------------------------------------ */

Hooks.on("renderChatMessage", (app, html, data) => Pl1eHooks.renderChatMessage(app, html, data));
Hooks.on("controlToken", async (token, isSelected) => Pl1eHooks.controlToken(token, isSelected));
Hooks.on("getSceneControlButtons", (controls) => Pl1eHooks.getSceneControlButtons(controls));
