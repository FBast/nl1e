import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eChatMessage} from "./chat-message.mjs";

export class Pl1eTokenDocument extends TokenDocument {



    /** @inheritDoc */
    async _preUpdate(data, options, user) {
        // // Restrict the token movement
        // if (this.combatant && !options.noRestriction && (data.x || data.y)) {
        //     const actorGeneral = this.actor.system.general;
        //     const actorMisc = this.actor.system.misc;
        //     const actorVariables = this.actor.system.variables;
        //
        //     if (game.combat.current?.tokenId !== this.id) {
        //         ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
        //         delete data.x;
        //         delete data.y;
        //     }
        //     else if (actorMisc.movement === 0) {
        //         ui.notifications.info(game.i18n.localize("PL1E.NoMovement"));
        //         delete data.x;
        //         delete data.y;
        //     }
        //     else if (actorGeneral.action === 0 && actorVariables.remainingMovement === 0) {
        //         ui.notifications.info(game.i18n.localize("PL1E.NoMoreAction"));
        //         delete data.x;
        //         delete data.y;
        //     }
        //     else {
        //         await this._restrictMovement(data);
        //     }
        // }

        // Apply passive aspects macros
        for (/** @type {Pl1eItem} */ const item of this.actor.items) {
            for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                if (!item.isEnabled) continue;
                if (aspect.name === "macro" && aspect.data !== "none" && aspect.dataGroup === "tokenPreUpdate") {
                    await Pl1eAspect.applyPassiveMacro(aspect, id, {
                        actor: this.actor,
                        data: data,
                        options: options,
                        user: user
                    });
                }
            }
        }

        // Apply active effect macro
        for (/** @type {Pl1eActiveEffect} */ const effect of this.actor.effects) {
            const macroId = effect.getFlag("pl1e", "tokenPreUpdateMacroId");
            if (macroId) {
                const macro = await Pl1eHelpers.getDocument("Macro", macroId);
                if (macro) await macro.execute({
                    actor: this.actor,
                    data: data,
                    options: options,
                    user: user
                });
            }
        }

        await super._preUpdate(data, options, user);
    }

    // /**
    //  * Restrict the movement for the token in combat
    //  * @param data
    //  * @return {void}
    //  * @private
    //  */
    // async _restrictMovement(data) {
    //     const actorGeneral = this.actor.system.general;
    //     const actorMisc = this.actor.system.misc;
    //     const actorVariables = this.actor.system.variables;
    //     const initialPosition = {x: this.x, y: this.y};
    //
    //     const newPosition = {
    //         x: data.x === undefined ? this.x : data.x,
    //         y: data.y === undefined ? this.y : data.y
    //     }
    //
    //     let distance = canvas.grid.measureDistance(initialPosition, newPosition, {gridSpaces: true});
    //
    //     // Use an action if needed and possible
    //     let missingDistance = distance - actorVariables.remainingMovement;
    //     if (missingDistance > 0) {
    //         let requiredActions = Math.ceil(missingDistance / actorMisc.movement);
    //
    //         // Return if not enough action to do this movement
    //         if (requiredActions > actorGeneral.action) {
    //             ui.notifications.info(game.i18n.localize("PL1E.NotEnoughActions"));
    //             delete data.x;
    //             delete data.y;
    //             return;
    //         }
    //
    //         // Retrieve action and add remaining movement
    //         actorGeneral.action -= requiredActions;
    //         actorVariables.remainingMovement += requiredActions * actorMisc.movement;
    //         actorVariables.movementAction += requiredActions;
    //         await Pl1eChatMessage.actionMessage(this.actor, "PL1E.Movement", requiredActions)
    //     }
    //
    //     // If the distance exceeds the limit, restrict the token's movement
    //     let distanceLimit = actorVariables.remainingMovement;
    //     if (distance > distanceLimit) {
    //         const deltaX = newPosition.x - initialPosition.x;
    //         const deltaY = newPosition.y - initialPosition.y;
    //         const directionX = deltaX / distance;
    //         const directionY = deltaY / distance;
    //         data.x = initialPosition.x + directionX * distanceLimit;
    //         data.y = initialPosition.y + directionY * distanceLimit;
    //         distance = distanceLimit;
    //     }
    //
    //     actorVariables.remainingMovement -= distance;
    //     actorVariables.usedMovement += distance;
    //     await this.actor.update({
    //         "system.general.action": actorGeneral.action,
    //         "system.variables.remainingMovement": actorVariables.remainingMovement,
    //         "system.variables.usedMovement": actorVariables.usedMovement,
    //         "system.variables.movementAction": actorVariables.movementAction
    //     });
    // }

}

// Hooks.on("preUpdateToken", (tokenDoc, changes, options, userId) => {
//     if (!("x" in changes || "y" in changes)) return;
//
//     const actor = tokenDoc.actor;
//     const vars = actor.system.variables;
//     const gen = actor.system.general;
//     const misc = actor.system.misc;
//
//     // Vérifie le tour
//     if (game.combat?.current?.tokenId !== tokenDoc.id) {
//         ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
//         return false;
//     }
//
//     // Recalcule la distance via le pathfinding
//     const waypoints = tokenDoc.object.getMovementPath({ x: changes.x, y: changes.y });
//     const distance = canvas.grid.measurePath(waypoints).distance;
//
//     let remaining = vars.remainingMovement;
//     let missing = distance - remaining;
//
//     if (missing > 0) {
//         const actionsNeeded = Math.ceil(missing / misc.movement);
//         if (actionsNeeded > gen.action) {
//             ui.notifications.info(game.i18n.localize("PL1E.NotEnoughActions"));
//             return false; // bloque le mouvement
//         }
//
//         // Consomme les actions si possible
//         gen.action -= actionsNeeded;
//         remaining += actionsNeeded * misc.movement;
//     }
//
//     if (distance > remaining) {
//         ui.notifications.info(game.i18n.localize("PL1E.NoMovement"));
//         return false;
//     }
//
//     // Mise à jour des variables si mouvement validé
//     actor.update({
//         "system.general.action": gen.action,
//         "system.variables.remainingMovement": remaining - distance,
//         "system.variables.usedMovement": vars.usedMovement + distance
//     });
// });
