import {Pl1eMacro} from "../helpers/macro.mjs";
import {Pl1eResting} from "../apps/resting.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eTrade} from "../helpers/trade.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {PL1E} from "../pl1e.mjs";

export default class Pl1eHooks {

    static ready() {
        // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
        Hooks.on("hotbarDrop", (bar, data, slot) => {
            if (["Item"].includes(data.type)) {
                Pl1eMacro.createMacro(data, slot);
                return false;
            }
        });

        // Restore tooltip expanded state
        Hooks.on("renderItemSheet", handleTooltipState);
        Hooks.on("renderActorSheet", handleTooltipState);

        function handleTooltipState(app, html, data) {
            const tooltips = html.find('.item-tooltip');
            tooltips.each(function () {
                const tooltip = $(this);
                const item = $(tooltip).closest(".item");

                // Check if tooltip associated
                if (tooltip === undefined) return;

                // Check if the tooltip state is in local storage
                const itemId = item.data("item-id");
                const tooltipState = localStorage.getItem(`tooltipState_${itemId}`);

                // If the tooltip state is in local storage, show/hide the tooltip accordingly
                if (tooltipState !== null && tooltipState === "open") {
                    $(tooltip).show();
                    $(tooltip).toggleClass('expanded');
                }
            });
        }

        Hooks.on("renderActorSheet", (actorSheet, html, data) => {
            if (actorSheet.actor.type === "character") {
                // Refresh the form application
                const formApp = Object.values(ui.windows)
                    .find(w => w instanceof Pl1eResting);
                if (formApp) formApp.render(true);

                // Apply the user color to the sheet
                for (const [id, user] of Object.entries(game.users.players)) {
                    if (user.character !== actorSheet.actor) continue;
                    actorSheet.element.css("background-color", user.color);
                }
            }
        });
    }

    static renderChatMessage(app, html, data) {
        html.find(".token-focus").on("click", ev => Pl1eEvent.onFocusToken(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, app));
        html.find(".card-buttons button").on("click", ev => Pl1eEvent.onChatCardAction(ev));
    }

    /* -------------------------------------------- */
    /*  Modules                                     */
    /* -------------------------------------------- */

    static socketLibReady() {
        PL1E.socket = socketlib.registerSystem("pl1e");
        PL1E.socket.register("sendItem", async function (data) {
            await Pl1eTrade.sendItem(data.sourceActorId, data.targetActorId, data.itemId)
        });
        PL1E.socket.register("sendContenant", async function (data) {
            await Pl1eTrade.sendContenant(data.sourceActorId, data.targetActorId, data.itemId);
        });
        PL1E.socket.register("tokenUpdate", async function (data) {
            const token = await Pl1eHelpers.getDocument("Token", data.tokenId, {
                scene: await Pl1eHelpers.getDocument("Scene", data.sceneId)
            });
            await token.actor.update(data.updateData);
        });
    }

    static dragRulerReady(SpeedProvider) {
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
                game.user.character
                // A character can always walk it's base speed and dash twice it's base speed
                return [
                    {range: walk, color: "walk"},
                    {range: run, color: "run"},
                    {range: extraMovement, color: "extraMovement"}
                ];
            }
        }

        dragRuler.registerSystem("pl1e", Pl1eSpeedProvider);
    }
}