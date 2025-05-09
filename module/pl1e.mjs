import {Pl1eActor} from "./documents/actors/actor.mjs";
import {Pl1eItem} from "./documents/items/item.mjs";
import {preloadHandlebarsTemplates} from "./main/templates.mjs";
import {Pl1eMacro} from "./helpers/macro.mjs";
import {Pl1eActorProxy} from "./documents/actors/actorProxy.mjs";
import {Pl1eItemProxy} from "./documents/items/itemProxy.mjs";
import {Pl1eCombat} from "./apps/combat.mjs";
import {Pl1eTokenDocument} from "./documents/tokenDocument.mjs";
import {Pl1eToken} from "./documents/token.mjs";
import {Pl1eEffect} from "./documents/effect.mjs";
import {Pl1eActorSheet} from "./sheets/actor-sheet.mjs";
import {Pl1eItemSheet} from "./sheets/item-sheet.mjs";
import {Pl1eChatMessage} from "./documents/chatMessage.mjs";
import {Pl1eJournalPageSheet} from "./sheets/journal-page-sheet.mjs";
import {getConfigBase} from "./config/configBase.mjs";
import {getConfigActor} from "./config/configActors.mjs";
import {getConfigItems} from "./config/configItems.mjs";
import {getConfigAspects} from "./config/configAspects.mjs";
import {getConfigTemplates} from "./config/configTemplates.mjs";
import {getConfigRest} from "./config/configRest.mjs";
import {registerStatuses} from "./main/statuses.mjs";
import {registerSettings} from "./main/settings.mjs";
import {registerHandlebars} from "./main/handlebars.mjs";
import {Pl1eHelpers} from "./helpers/helpers.mjs";
import {Pl1eTrade} from "./helpers/trade.mjs";
import {TokenTooltip} from "./apps/tokenTooltip.mjs";

/* -------------------------------------------- */
/*  Globals                                     */
/* -------------------------------------------- */

// Export PL1E for easier access
export const PL1E = {};

// Register PL1E on system config
CONFIG.PL1E = PL1E;

/* -------------------------------------------- */
/*  System Hooks                                */
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
    CONFIG.Token.objectClass = Pl1eToken;
    CONFIG.ActiveEffect.documentClass = Pl1eEffect;
    CONFIG.ChatMessage.documentClass = Pl1eChatMessage;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pl1e", Pl1eActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pl1e", Pl1eItemSheet, {makeDefault: true});
    DocumentSheetConfig.registerSheet(JournalEntryPage, "pl1e", Pl1eJournalPageSheet, {
        types: ["location", "organization", "character", "merchant"]
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

    // Create token tooltip
    new TokenTooltip();

    // Register dynamic configs
    PL1E.sequencerMacros = await Pl1eHelpers.getDocumentsDataFromPack("legacy-sequencer-macros", true);
    PL1E.actorPreUpdate = await Pl1eHelpers.getDocumentsDataFromPack("legacy-actor-pre-update-macros", true);
    PL1E.tokenPreUpdate = await Pl1eHelpers.getDocumentsDataFromPack("legacy-token-pre-update-macros", true);
    PL1E.targetsResolution = await Pl1eHelpers.getDocumentsDataFromPack("legacy-targets-resolution-macros", true);
    PL1E.invocations = await Pl1eHelpers.getDocumentsDataFromPack("legacy-characters", true);
});

/* ------------------------------------ */
/*  Module Hooks                        */
/* ------------------------------------ */

Hooks.once("socketlib.ready", () => {
    PL1E.socket = socketlib.registerSystem("pl1e");
    PL1E.socket.register("giftItem", async function (data) {
        await Pl1eTrade.giftItem(data.sourceActorUuid, data.targetActorUuid, data.itemId);
    });
    // PL1E.socket.register("sendContenant", async function (data) {
    //     await Pl1eTrade.sendContenant(data.sourceActorUuid, data.targetActorUuid, data.itemUuid);
    // });
    PL1E.socket.register("tokenUpdate", async function (data) {
        const token = await Pl1eHelpers.getDocument("Token", data.tokenId, {
            scene: await Pl1eHelpers.getDocument("Scene", data.sceneId)
        });
        await token.actor.update(data.updateData);
        //TODO in case of no token for ability directly on actors
    });
    PL1E.socket.register("displayScrollingText", function (data) {
        Pl1eHelpers.displayScrollingText(data);
    });
    PL1E.socket.register("centerAndSelectToken", async (tokenId) => {
        await Pl1eHelpers.centerAndSelectToken(tokenId);
    });
});

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