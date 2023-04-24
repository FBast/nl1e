// Import document classes.
import {Pl1eActor} from "./documents/actor.mjs";
import {Pl1eItem} from "./documents/item.mjs";
// Import subDocument classes
import {Pl1eItemProxy} from "./documents/itemProxy.mjs";
// Import sheet classes.
import {Pl1eActorSheet} from "./sheets/actor-sheet.mjs";
import {Pl1eItemSheet} from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";
import {PL1E} from "./config/config.mjs";
import Pl1eSocket from "./helpers/socket.mjs";
import {Pl1eMacro} from "./helpers/macro.mjs";
import {Pl1eEvent} from "./helpers/events.mjs";

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
    CONFIG.Item.documentClass = Pl1eItemProxy;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("pl1e", Pl1eActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("pl1e", Pl1eItemSheet, {makeDefault: true});

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();
});

Hooks.once("ready", async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (["Item", "ActiveEffect"].includes(data.type) ) {
            Pl1eMacro.createMacro(data, slot);
            return false;
        }
    });

    let previousRound = null;
    Hooks.on("updateCombat", async (combat, changed) => {
        if (combat.round !== previousRound) {
            // The round has ended, so reset the combat stats on all actors
            for (let combatant of combat.turns) {
                const actorMisc = combatant.token.actor.system.misc;
                await combatant.token.actor.update({
                    "system.misc.action": actorMisc.action + 2,
                    "system.misc.reaction": actorMisc.reaction + 1,
                    "system.misc.instant": actorMisc.instant + 1,
                });
            }
            previousRound = combat.round;
        }
    });

    // Restore tooltip expanded state
    Hooks.on("renderItemSheet", handleTooltipState);
    Hooks.on("renderActorSheet", handleTooltipState);
    function handleTooltipState(app, html, data) {
        const tooltips = html.find('.item-tooltip');
        tooltips.each(function() {
            const tooltip = $(this);
            const item = $(tooltip).closest(".item");

            // Check if tooltip associated
            if (tooltip === undefined) return;

            // Check if the tooltip state is in local storage
            const itemId = item.attr("data-item-id");
            const tooltipState = localStorage.getItem(`tooltipState_${itemId}`);

            // If the tooltip state is in local storage, show/hide the tooltip accordingly
            if (tooltipState !== null && tooltipState === "open") {
                $(tooltip).show();
                $(tooltip).toggleClass('expanded');
            }
        });
    }
});

Hooks.on("renderChatLog", (app, html, data) => {
    html.on("click", ".card-buttons button", Pl1eEvent.onChatCardAction.bind(this));
    html.on("click", ".actor-edit", Pl1eEvent.onActorEdit.bind(this));
    html.on("click", ".item-edit", Pl1eEvent.onItemEdit.bind(this));
});

Hooks.on("renderChatPopout", (app, html, data) => {
    html.on("click", ".card-buttons button", Pl1eEvent.onChatCardAction.bind(this));
    html.on("click", ".actor-edit", Pl1eEvent.onActorEdit.bind(this));
    html.on("click", ".item-edit", Pl1eEvent.onItemEdit.bind(this));
});

Hooks.once("socketlib.ready", () => {
    PL1E.socket = socketlib.registerSystem("pl1e");
    PL1E.socket.register("sendItem", function (data) {
        Pl1eSocket.sendItem(data.actor, data.targetActor, data.item)
    })
    PL1E.socket.register("sendContenant", function (data) {
        Pl1eSocket.sendContenant(data.actor, data.targetActor, data.item);
    })
})

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

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
});

Handlebars.registerHelper('plus', function(a, b) {
    return a + b;
});

Handlebars.registerHelper('multiply', function(a, b) {
    return a * b;
});

Handlebars.registerHelper('config', function (key) {
    if (key === undefined) {
        throw new Error(`PL1E | config key is undefined`);
    }
    return CONFIG.PL1E[key];
});

Handlebars.registerHelper('configEntry', function (key, entry) {
    if (key === undefined) {
        throw new Error(`PL1E | configEntry key is undefined`);
    }
    if (entry === undefined) {
        throw new Error(`PL1E | configEntry entry is undefined with key ${key}`);
    }
    return CONFIG.PL1E[key][entry];
});

Handlebars.registerHelper('configEntryLabel', function (key, entry) {
    return CONFIG.PL1E[key][entry].label;
});

Handlebars.registerHelper('selectOptionsWithLabel', function(choices, options) {
    const optionsData = {};
    for (const key in choices) {
        const value = choices[key];
        optionsData[key] = value.label;
    }
    return Handlebars.helpers.selectOptions(optionsData, options);
});

Handlebars.registerHelper('join', function(arr, separator) {
    return arr.join(separator);
});

Handlebars.registerHelper( 'eachInMap', function ( map, block ) {
    var out = '';
    Object.keys( map ).map(function( prop ) {
        out += block.fn( {key: prop, value: map[ prop ]} );
    });
    return out;
} );