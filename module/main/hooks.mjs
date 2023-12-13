import {Pl1eMacro} from "../helpers/macro.mjs";
import {Pl1eResting} from "../apps/resting.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {PL1E} from "../config/config.mjs";
import {Pl1eTrade} from "../helpers/trade.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {GmToolbox as displaySleeping, GmToolbox} from "../apps/gmToolbox.mjs";
import * as CONFIG from "../config/config.mjs";

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
            tooltips.each(function() {
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

    static getSceneControlButtons(controls) {
        const managePlayers = {
            icon: "fas fa-people-roof",
            name: "manage-players",
            title: "PL1E.ManagePlayers",
            button: true,
            visible: game.user.isGM,
            onClick: () => {
                console.log("Manage players");
            }
        };
        const startSleeping = {
            icon: "fas fa-face-sleeping",
            name: "start-sleeping",
            title: "PL1E.StartSleeping",
            button: true,
            visible: game.user.isGM,
            onClick: () => {
                const players = game.users.filter(user => user.active && !user.isGM);
                const playerIds = players.map(player => player.id);

                let abort = false;
                for (const player of players) {
                    // Return if the player has no associated character
                    if (!player.character) {
                        ui.notifications.info(`${game.i18n.localize("PL1E.PlayerHasNoCharacter")} : ${player.name}`);
                        abort = true;
                    }
                    // Return if the character is in creation mod
                    if (player.character.system.general.creationMod) {
                        ui.notifications.info(`${game.i18n.localize("PL1E.CharacterInCreationMode")} : ${player.character.name}`);
                        abort = true;
                    }
                }
                if (abort) return;

                // Execute the socket
                CONFIG.PL1E.socket.executeForUsers('displaySleeping', playerIds);
            }
        };
        controls.push({
            name: "gm-controls",
            title: game.i18n.localize("PL1E.GMControls"),
            icon: "fas fa-user-crown",
            layer: "controls",
            visible: game.user.isGM,
            activeTool: "manage-token",
            tools: [managePlayers, startSleeping]
        });
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
        PL1E.socket.register("displaySleeping", GmToolbox.displaySleeping);
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