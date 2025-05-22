/* -------------------------------------------- */
/*  Globals                                     */
/* -------------------------------------------- */

// Export PL1E for easier access
export const PL1E = {};

// Register PL1E on system config
CONFIG.PL1E = PL1E;

/* -------------------------------------------- */
/*  Imports                                     */
/* -------------------------------------------- */

import {preloadHandlebarsTemplates} from "./main/templates.mjs";
import {Pl1eActor} from "./documents/actors/actor.mjs";
import {Pl1eItem} from "./documents/items/item.mjs";
import {Pl1eMacro} from "./helpers/macro.mjs";
import {Pl1eActorProxy} from "./documents/actors/actor-proxy.mjs";
import {Pl1eItemProxy} from "./documents/items/item-proxy.mjs";
import {Pl1eCombat} from "./documents/combat.mjs";
import {Pl1eTokenDocument} from "./documents/token-document.mjs";
import {Pl1eToken} from "./documents/token.mjs";
import {Pl1eEffect} from "./documents/effect.mjs";
import {Pl1eActorSheet} from "./sheets/actor-sheet.mjs";
import {Pl1eItemSheet} from "./sheets/item-sheet.mjs";
import {Pl1eMerchantPageSheet} from "./sheets/journal/merchant-page-sheet.mjs";
import {Pl1eJournalPageSheet} from "./sheets/journal/journal-page-sheet.mjs";
import {Pl1eChatMessage} from "./documents/chat-message.mjs";
import {Pl1eHelpers} from "./helpers/helpers.mjs";
import {getConfigBase} from "./config/config-base.mjs";
import {getConfigActor} from "./config/config-actors.mjs";
import {getConfigItems} from "./config/config-items.mjs";
import {getConfigAspects} from "./config/config-aspects.mjs";
import {getConfigTemplates} from "./config/config-templates.mjs";
import {getConfigRest} from "./config/config-rest.mjs";
import {registerStatuses} from "./main/statuses.mjs";
import {registerSettings} from "./main/settings.mjs";
import {registerHandlebars} from "./main/handlebars.mjs";

import "./utils/placeable-tooltip.mjs";
import "./utils/token-hotbar.mjs";
import "./utils/color-sheets.mjs";
import "./utils/socket.mjs";
import {registerDragHighlighting} from "./utils/drag-highlight.mjs";

/* -------------------------------------------- */
/*  System Hooks                                */
/* -------------------------------------------- */

Hooks.once('init', async function () {
    // Global dynamic data
    game.pl1e = {
        Pl1eActor,
        Pl1eItem,
        Pl1eMacro,
        hasSequencer: false
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
    CONFIG.Token.objectClass = Pl1eToken;
    CONFIG.ActiveEffect.documentClass = Pl1eEffect;
    CONFIG.ChatMessage.documentClass = Pl1eChatMessage;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pl1e", Pl1eActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pl1e", Pl1eItemSheet, {makeDefault: true});
    DocumentSheetConfig.registerSheet(JournalEntryPage, "pl1e", Pl1eJournalPageSheet, {
        types: ["location", "organization", "character"],
        makeDefault: true
    });
    DocumentSheetConfig.registerSheet(JournalEntryPage, "pl1e", Pl1eMerchantPageSheet, {
        types: ["merchant"],
        makeDefault: true
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

Hooks.once("ready", async function () {
    // Localize custom statuses
    for (const statusEffect of CONFIG.statusEffects) {
        statusEffect.label = game.i18n.localize(statusEffect.label);
        statusEffect.description = game.i18n.localize(statusEffect.description);
    }

    // Register dynamic configs
    PL1E.sequencerMacros = await Pl1eHelpers.getDocumentsDataFromPack("legacy-sequencer-macros", true);
    PL1E.actorPreUpdate = await Pl1eHelpers.getDocumentsDataFromPack("legacy-actor-pre-update-macros", true);
    PL1E.tokenPreUpdate = await Pl1eHelpers.getDocumentsDataFromPack("legacy-token-pre-update-macros", true);
    PL1E.targetsResolution = await Pl1eHelpers.getDocumentsDataFromPack("legacy-targets-resolution-macros", true);
    PL1E.invocations = await Pl1eHelpers.getDocumentsDataFromPack("legacy-characters", true);
    
    // Highlight drag
    registerDragHighlighting();
});

/* ------------------------------------ */
/*  Module Hooks                        */
/* ------------------------------------ */

// Hooks.once("socketlib.ready", () => {
//     PL1E.socket = socketlib.registerSystem("pl1e");
//     PL1E.socket.register("giftItem", async function (data) {
//         await giftItem(data.sourceActorUuid, data.targetActorUuid, data.itemId);
//     });
//     PL1E.socket.register("tokenUpdate", async function (data) {
//         const token = await Pl1eHelpers.getDocument("Token", data.tokenId, {
//             scene: await Pl1eHelpers.getDocument("Scene", data.sceneId)
//         });
//         await token.actor.update(data.updateData);
//         //TODO in case of no token for ability directly on actors
//     });
//     PL1E.socket.register("displayScrollingText", function (data) {
//         Pl1eHelpers.displayScrollingText(data);
//     });
//     PL1E.socket.register("centerAndSelectToken", async (tokenId) => {
//         await Pl1eHelpers.centerAndSelectToken(tokenId);
//     });
// });

Hooks.once("dragRuler.ready", (SpeedProvider) => {
    class Pl1eSpeedProvider extends SpeedProvider {
        get colors() {
            return [
                {id: "walk", default: 0x00FF00, name: "PL1E.Walk"},
                {id: "run", default: 0xFFFF00, name: "PL1E.Run"},
                {id: "extraMovement", default: 0xFF8000, name: "PL1E.ExtraMovement"},
            ]
        }

        getRanges(token) {
            const movement = token.actor.system.misc.movement;
            const action = token.actor.system.general.action;
            const remainingMovement = token.actor.system.variables.remainingMovement;
            const usedMovement = token.actor.system.variables.usedMovement;
            const movementAction = token.actor.system.variables.movementAction;

            const totalMovement = remainingMovement + usedMovement;
            const totalAction = action + movementAction;
            const walk = totalAction >= 1 ? totalMovement + movement * (1 - movementAction) : 0;
            const run = totalAction >= 2 ? totalMovement + movement * (2 - movementAction) : 0;
            const extraMovement = totalAction >= 3 ? totalMovement + movement * (3 - movementAction) : 0;

            // A character can always walk it's base speed and dash twice it's base speed
            return [
                {range: walk, color: "walk"},
                {range: run, color: "run"},
                {range: extraMovement, color: "extraMovement"}
            ];
        }
    }

    dragRuler.registerSystem("pl1e", Pl1eSpeedProvider);
});

Hooks.once("sequencer.ready", () => {
    game.pl1e.hasSequencer = true;

    console.log("PL1E | Sequencer support enabled.");
});
