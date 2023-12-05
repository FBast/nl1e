import {Pl1eChat} from "../helpers/chat.mjs";

export class Pl1eTokenDocument extends TokenDocument {

    /** @inheritDoc */
    async _preUpdate(data, options, user) {
        // Restrict the token movement
        if (this.combatant && !options.noRestriction && (data.x || data.y)) {
            const actorGeneral = this.actor.system.general;
            const actorMisc = this.actor.system.misc;
            const actorVariables = this.actor.system.variables;

            if (game.combat.current?.tokenId !== this.id) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
                delete data.x;
                delete data.y;
            }
            else if (actorMisc.movement === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMovement"));
                delete data.x;
                delete data.y;
            }
            else if (actorGeneral.action === 0 && actorVariables.remainingMovement === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
                delete data.x;
                delete data.y;
            }
            else {
                await this._restrictMovement(data);
            }
        }

        await super._preUpdate(data, options, user);
    }

    async _onUpdate(data, options, userId) {
        super._onUpdate(data, options, userId);

        const Sequence = window.Sequence;
        const style = {
            fill: "#ff0000",
            fontFamily: "Arial Black",
            fontSize: 28,
            stroke: "#ffffff",
            strokeThickness: 4
        }

        let text = "Coucou !";
        if (Sequence) {
            await new Sequence()
                .scrollingText(this.id, text)
                .atLocation(this.id)
                .text(text, style)
                .waitUntilFinished(-1000)
                .play()
        }
    }

    /**
     * Restrict the movement for the token in combat
     * @param data
     * @return {void}
     * @private
     */
    async _restrictMovement(data) {
        const actorGeneral = this.actor.system.general;
        const actorMisc = this.actor.system.misc;
        const actorVariables = this.actor.system.variables;
        const initialPosition = {x: this.x, y: this.y};

        const newPosition = {
            x: data.x === undefined ? this.x : data.x,
            y: data.y === undefined ? this.y : data.y
        }

        let distance = canvas.grid.measureDistance(initialPosition, newPosition, {gridSpaces: true});

        // Use an action if needed and possible
        let missingDistance = distance - actorVariables.remainingMovement;
        if (missingDistance > 0) {
            let requiredActions = Math.ceil(missingDistance / actorMisc.movement);

            // Return if not enough action to do this movement
            if (requiredActions > actorGeneral.action) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughActions"));
                delete data.x;
                delete data.y;
                return;
            }

            // Retrieve action and add remaining movement
            actorGeneral.action -= requiredActions;
            actorVariables.remainingMovement += requiredActions * actorMisc.movement;
            actorVariables.movementAction += requiredActions;
            await Pl1eChat.actionMessage(this.actor, "PL1E.Movement", requiredActions)
        }

        // If the distance exceeds the limit, restrict the token's movement
        let distanceLimit = actorVariables.remainingMovement;
        if (distance > distanceLimit) {
            const deltaX = newPosition.x - initialPosition.x;
            const deltaY = newPosition.y - initialPosition.y;
            const directionX = deltaX / distance;
            const directionY = deltaY / distance;
            data.x = initialPosition.x + directionX * distanceLimit;
            data.y = initialPosition.y + directionY * distanceLimit;
            distance = distanceLimit;
        }

        actorVariables.remainingMovement -= distance;
        actorVariables.usedMovement += distance;
        await this.actor.update({
            "system.general.action": actorGeneral.action,
            "system.variables.remainingMovement": actorVariables.remainingMovement,
            "system.variables.usedMovement": actorVariables.usedMovement,
            "system.variables.movementAction": actorVariables.movementAction
        });
    }

}