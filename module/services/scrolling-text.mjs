import { Pl1eHelpers } from "../helpers/helpers.mjs";
import { PL1E } from "../pl1e.mjs";

Hooks.once("ready", () => {

    Hooks.on("preUpdateActor", (actor, update, options) => {
        if (!update?.system?.resources) return;

        // Snapshot des ressources AVANT modification
        options.pl1ePrevResources = foundry.utils.duplicate(actor.system.resources);
    });

    Hooks.on("updateActor", (actor, update, options) => {
        if (!update?.system?.resources) return;
        if (!options.pl1ePrevResources) return;

        const prevResources = options.pl1ePrevResources;

        // Actor de token
        if (actor.isToken && actor.token) {
            handleScrolling(actor, actor.token, prevResources, actor.system.resources);
            return;
        }

        // Actor de base → tous les tokens actifs
        const tokens = actor.getActiveTokens(true, true);
        if (!tokens.length) return;

        for (const token of tokens) {
            handleScrolling(actor, token, prevResources, actor.system.resources);
        }
    });

});

/**
 * Handle scrolling text for a specific token
 * @param {Actor} actor
 * @param {Token} token
 * @param {object} prevResources
 * @param {object} newResources
 */
function handleScrolling(actor, token, prevResources, newResources) {

    const position = {
        x: token.x + token.width * token.parent.grid.size / 2,
        y: token.y + token.height * token.parent.grid.size / 2
    };

    const delayStep = 1000; // ms entre chaque scroll
    let index = 0;

    for (const [resourceKey, prev] of Object.entries(prevResources)) {
        const next = newResources?.[resourceKey];
        if (!next) continue;

        const diff = next.value - prev.value;
        if (diff === 0) continue;

        const delay = index * delayStep;

        setTimeout(() => {
            displayResourceScrollingText(resourceKey, diff, prev.max, position);
        }, delay);

        index++;
    }
}

/**
 * Display a scrolling text for a resource delta
 * @param {string} resourceKey
 * @param {number} diffValue
 * @param {number} maxValue
 * @param {{x:number,y:number}} position
 */
function displayResourceScrollingText(resourceKey, diffValue, maxValue, position) {

    const keyConfig = Pl1eHelpers.getConfig("resources", resourceKey);
    if (!keyConfig) return;

    const data = {
        text: `${diffValue} ${game.i18n.localize(keyConfig.label)}`,
        position: position,
        fontSize: Math.abs(diffValue) / maxValue,
        fillColor: diffValue > 0 ? "#00FF00" : "#FF0000"
    };

    // Multicast + local
    PL1E.socket.executeForEveryone("displayScrollingText", data);
    Pl1eHelpers.displayScrollingText(data);
}
