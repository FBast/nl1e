export class Pl1eCombat extends Combat {

    /** @inheritDoc */
    startCombat() {
        for (let combatant of this.combatants) {
            this.resetCombatStats(combatant.token.actor);
        }
        return super.startCombat();
    }

    /** @inheritDoc */
    nextRound() {
        for (let combatant of this.combatants) {
            this.resetCombatStats(combatant.token.actor);
        }
        return super.nextRound();
    }

    /** @inheritDoc */
    endCombat() {
        for (let combatant of this.combatants) {
            this.resetCombatStats(combatant.token.actor);
        }
        return super.endCombat();
    }

    resetCombatStats(actor) {
        // if (!actor.isOwner) return;
        actor.system.misc.action = 2;
        actor.system.misc.reaction = 1;
        actor.system.misc.remainingMovement = actor.system.misc.movement;
        for (let item of actor.items) {
            if (item.type === "weapon" || item.type === "wearable") {
                item.system.isMajorActionUsed = false;
            }
        }
    }

    /**
     * Restrict the movement for the token in combat
     * @param scene
     * @param tokenData
     * @param updateData
     * @returns {boolean}
     */
    static restrictMovement(scene, tokenData, updateData) {
        // Check if the scene is in combat
        const combat = game.combat;
        if (!combat || !combat.started) return false;

        // Check if the token is part of the current turn
        const currentTokenId = combat.current?.tokenId;
        const token = game.scenes.viewed.tokens.get(currentTokenId);

        if (currentTokenId !== tokenData._id) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
            return false;
        }

        if (token.actor.system.misc.action === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            return false;
        }

        // Movement restriction for token based on remainingMovement
        if (tokenData.x || tokenData.y) {
            const actorMisc = token.actor.system.misc;
            if (actorMisc.remainingMovement === actorMisc.movement) actorMisc.action--;

            const initialPosition = { x: token.x, y: token.y };
            const newPosition = { x: tokenData.x ?? token.x, y: tokenData.y ?? token.y };
            let distanceLimit = actorMisc.remainingMovement;
            const deltaX = newPosition.x - initialPosition.x;
            const deltaY = newPosition.y - initialPosition.y;
            let distance = canvas.grid.measureDistance(initialPosition, newPosition);
            distance = Math.floor(distance);

            // If the distance exceeds the limit, restrict the token's movement
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

                distance = canvas.grid.measureDistance(initialPosition, restrictedPosition);
            }

            actorMisc.remainingMovement -= distance;
            if (actorMisc.remainingMovement === 0 && actorMisc.action > 0)
                actorMisc.remainingMovement = actorMisc.movement;
            token.actor.system.misc = actorMisc;
        }
    }

}
