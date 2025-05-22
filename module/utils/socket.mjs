import { giftItem } from "../helpers/trade.mjs";
import { Pl1eHelpers } from "../helpers/helpers.mjs";

export function registerSocketHandlers(PL1E) {
    /**
     * Send an action to be executed by the first active GM.
     *
     * @param {string} action - The action name to execute
     * @param {object} data - The data to send with the action
     */
    PL1E.socket.executeAsGM = function (action, data) {
        if (!game.users?.size) {
            console.warn("PL1E | executeAsGM was called before game.users is available.");
            return;
        }

        const gm = game.users.find(u => u.isGM && u.active);
        if (!gm) {
            ui.notifications.warn("No active GM available to handle the socket action.");
            return;
        }

        game.socket.emit("system.pl1e", {action, data, toUser: gm.id});
    };

    /**
     * Broadcast an action to all connected clients.
     *
     * @param {string} action - The action name to execute
     * @param {object} data - The data to send with the action
     */
    PL1E.socket.executeForEveryone = function (action, data) {
        game.socket.emit("system.pl1e", {action, data});
    };

    Hooks.once("ready", () => {
        // Register socket listeners once the game is ready
        game.socket.on("system.pl1e", async ({action, data, toUser}) => {
            // If the action is targeted to a specific user and it's not us, skip it
            if (toUser && game.user.id !== toUser) return;

            switch (action) {
                case "giftItem":
                    await giftItem(data.sourceActorUuid, data.targetActorUuid, data.itemId);
                    break;
                case "tokenUpdate":
                    const scene = await Pl1eHelpers.getDocument("Scene", data.sceneId);
                    const token = await Pl1eHelpers.getDocument("Token", data.tokenId, {scene});
                    await token.actor.update(data.updateData);
                    break;
                case "displayScrollingText":
                    Pl1eHelpers.displayScrollingText(data);
                    break;
                case "centerAndSelectToken":
                    await Pl1eHelpers.centerAndSelectToken(data.tokenId);
                    break;
                default:
                    console.warn(`PL1E | Unknown socket action: ${action}`);
            }
        });
    });
}