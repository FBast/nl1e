import {Pl1eChat} from "../helpers/chat.mjs";

export class Pl1eTokenDocument extends TokenDocument {

    async _preUpdate(data, options, user) {
        if ((data.x || data.y) && this.combatant !== null) {
            const currentTokenId = game.combat.current?.tokenId;
            const actorMisc = this.actor.system.misc;
            if (currentTokenId !== this.id) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
                delete data.x;
                delete data.y;
            }
            else if (actorMisc.action === 0 && actorMisc.remainingMovement === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
                delete data.x;
                delete data.y;
            }
            else {
                await this.restrictMovement(data);
            }
        }

        await super._preUpdate(data, options, user);
    }

    /**
     * Restrict the movement for the token in combat
     * @param data
     * @return {void}
     */
    async restrictMovement(data) {
        const actorMisc = this.actor.system.misc;
        const initialPosition = {x: this.x, y: this.y};

        const newPosition = {
            x: data.x === undefined ? this.x : data.x,
            y: data.y === undefined ? this.y : data.y
        }

        const deltaX = newPosition.x - initialPosition.x;
        const deltaY = newPosition.y - initialPosition.y;
        let distance = canvas.grid.measureDistance(initialPosition, newPosition, {gridSpaces: true});

        let missingDistance = distance - actorMisc.remainingMovement;
        if (missingDistance > 0) {
            let requiredActions = Math.ceil(missingDistance / actorMisc.movement);
            requiredActions = Math.min(requiredActions, actorMisc.action);
            actorMisc.action -= requiredActions;
            actorMisc.remainingMovement += requiredActions * actorMisc.movement;
            await Pl1eChat.actionMessage(this.actor, "PL1E.Movement", requiredActions)
        }

        // If the distance exceeds the limit, restrict the token's movement
        let distanceLimit = actorMisc.remainingMovement;
        if (distance > distanceLimit) {
            const directionX = deltaX / distance;
            const directionY = deltaY / distance;
            data.x = initialPosition.x + directionX * distanceLimit;
            data.y = initialPosition.y + directionY * distanceLimit;
            distance = distanceLimit;
        }

        actorMisc.remainingMovement -= distance;

        await this.actor.update({
            "system.misc": actorMisc
        })
    }

}