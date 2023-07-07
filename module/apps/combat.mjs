import {Pl1eChat} from "../helpers/chat.mjs";

export class Pl1eCombat extends Combat {

    /** @inheritDoc */
    async nextRound() {
        await this.resetCombatStats(this.combatant.actor);
        return super.nextRound();
    }

    async resetCombatStats(actor) {
        await actor.update({
            "system.misc.action": 2,
            "system.misc.reaction": 1
        });
    }

    /**
     * Restrict the movement for the token in combat
     * @param scene
     * @param tokenData
     * @param updateData
     * @returns {boolean}
     */
    static async restrictMovement(scene, tokenData, updateData) {
        // Check if the scene is in combat
        const combat = game.combat;
        if (!combat || !combat.started) return;

        // Check if the token is part of the current turn
        const currentTokenId = combat.current?.tokenId;
        const token = game.scenes.viewed.tokens.get(currentTokenId);
        const actorMisc = token.actor.system.misc;

        if (currentTokenId !== tokenData._id) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
            delete tokenData.x;
            delete tokenData.y;
            return;
        }

        if (actorMisc.action === 0 && actorMisc.remainingMovement === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            delete tokenData.x;
            delete tokenData.y;
            return;
        }

        // Movement restriction for token based on remainingMovement
        if (tokenData.x || tokenData.y) {
            const initialPosition = {x: token.x, y: token.y};
            const newPosition = {x: tokenData.x ?? token.x, y: tokenData.y ?? token.y};
            const deltaX = newPosition.x - initialPosition.x;
            const deltaY = newPosition.y - initialPosition.y;
            let distance = canvas.grid.measureDistance(initialPosition, newPosition, {gridSpaces: true});

            let missingDistance = distance - actorMisc.remainingMovement;
            if (missingDistance > 0) {
                let requiredActions = Math.ceil(missingDistance / actorMisc.movement);
                requiredActions = Math.min(requiredActions, actorMisc.action);
                actorMisc.action -= requiredActions;
                actorMisc.remainingMovement += requiredActions * actorMisc.movement;
                await Pl1eChat.actionMessage(token.actor, "PL1E.Movement", requiredActions)
            }

            // If the distance exceeds the limit, restrict the token's movement
            let distanceLimit = actorMisc.remainingMovement;
            if (distance > distanceLimit) {
                const directionX = deltaX / distance;
                const directionY = deltaY / distance;
                const restrictedPosition = {
                    x: initialPosition.x + directionX * distanceLimit,
                    y: initialPosition.y + directionY * distanceLimit
                };

                // Update the token's position to the restricted position
                tokenData.x = restrictedPosition.x;
                tokenData.y = restrictedPosition.y;

                distance = distanceLimit;
            }

            actorMisc.remainingMovement -= distance;

            await token.actor.update({
                "system.misc": actorMisc
            })
        }
    }

}