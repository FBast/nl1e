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
        if (!game.user.isGM) {
            html.find(".gm-only").hide(); // Hide the buttons for non-GM users
        } else {
            html.find(".gm-only").show(); // Ensure they are visible for the GM
        }
    }

    static async controlToken(token, isSelected) {
        if (!token.actor) return;

        const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
        if (dynamicHotbar && isSelected && token.actor.isOwner) {
            // Delete previous dynamic macros
            await Pl1eMacro.deleteAllDynamicMacros();

            // Generate macros for the selected token
            await Pl1eMacro.generateTokenMacros(token);
        }
    }

    static getSceneControlButtons(controls) {
        let tokenCategory = controls.find(c => c.name === "token");

        if (tokenCategory) {
            tokenCategory.tools.push({
                name: "dynamicHotBar",
                title: game.i18n.localize("PL1E.DynamicHotBar"),
                icon: "fas fa-exchange-alt",
                active: game.user.getFlag('pl1e', 'dynamicHotBar'),
                toggle: true,
                button: true,
                onClick: async (enable) => {
                    game.user.setFlag('pl1e', 'dynamicHotBar', enable);
                    if (!enable) {
                        // Delete previous dynamic macros
                        await Pl1eMacro.deleteAllDynamicMacros();

                        // Restore the default hotbar state
                        let defaultHotbarMacros = game.user.getFlag('pl1e', 'defaultHotbarMacros');
                        if (defaultHotbarMacros) {
                            for (const macroData of defaultHotbarMacros) {
                                let macro = game.macros.get(macroData.id);
                                await game.user.assignHotbarMacro(macro ? macro : null, macroData.slot);
                            }
                        }
                    }
                    else {
                        // Save the current state of the hotbar
                        const totalPages = 5;
                        let fullHotbarState = [];
                        for (let page = 1; page <= totalPages; page++) {
                            let pageMacros = game.user.getHotbarMacros(page);
                            pageMacros.forEach(pageMacro => {
                                fullHotbarState.push({
                                    id: pageMacro.macro ? pageMacro.macro.id : null,
                                    slot: pageMacro.slot
                                });
                            })
                        }
                        await game.user.setFlag('pl1e', 'defaultHotbarMacros', fullHotbarState);

                        // Generate the macros for the current token selected (if existing)
                        const selectedToken = game.canvas.tokens.controlled[0];
                        if (selectedToken && selectedToken.isOwner) {
                            // Generate macros for the selected token
                            await Pl1eMacro.generateTokenMacros(selectedToken);
                        }
                    }
                }
            });
        }
    }

    /* -------------------------------------------- */
    /*  Modules                                     */
    /* -------------------------------------------- */

    static socketLibReady() {
        PL1E.socket = socketlib.registerSystem("pl1e");
        PL1E.socket.register("sendItem", async function (data) {
            await Pl1eTrade.sendItem(data.sourceActorUuid, data.targetActorUuid, data.itemId);
        });
        // PL1E.socket.register("sendContenant", async function (data) {
        //     await Pl1eTrade.sendContenant(data.sourceActorUuid, data.targetActorUuid, data.itemUuid);
        // });
        PL1E.socket.register("tokenUpdate", async function (data) {
            const token = await Pl1eHelpers.getDocument("Token", data.tokenId, {
                scene: await Pl1eHelpers.getDocument("Scene", data.sceneId)
            });
            await token.actor.update(data.updateData);
        });
        PL1E.socket.register("displayScrollingText", function (data) {
            Pl1eHelpers.displayScrollingText(data);
        });
        PL1E.socket.register("centerAndSelectToken", async (tokenId) => {
            await Pl1eHelpers.centerAndSelectToken(tokenId);
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