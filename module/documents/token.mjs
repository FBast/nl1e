import {Pl1eChat} from "../helpers/chat.mjs";

export class Pl1eTokenDocument extends TokenDocument {

    /** @inheritDoc */
    get isDefeated() {
        return this.actor.isDead;
    }

    get isInComa() {
        return this.actor.isInComa;
    }

    /** @inheritDoc */
    async _preUpdate(data, options, user) {
        // Restrict the token movement
        if ((data.x || data.y) && this.combatant !== null) {
            const currentTokenId = game.combat.current?.tokenId;
            const actorMisc = this.actor.system.misc;
            const actorVariables = this.actor.system.variables;
            if (currentTokenId !== this.id) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
                delete data.x;
                delete data.y;
            }
            else if (this.actor.effects.find(effect => effect.statuses.has("paralysis"))) {
                ui.notifications.warn(game.i18n.localize("PL1E.YouAreParalysed"));
                delete data.x;
                delete data.y;
            }
            else if (this.actor.effects.find(effect => effect.statuses.has("restrain"))) {
                ui.notifications.warn(game.i18n.localize("PL1E.YouAreRestrained"));
                delete data.x;
                delete data.y;
            }
            else if (actorMisc.action === 0 && actorVariables.remainingMovement === 0) {
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

    /** @inheritDoc */
    async _onUpdateBaseActor(update, options) {
        // await this.updateStatusEffects();
        super._onUpdateBaseActor(update, options);
    }

    /** @inheritDoc */
    async _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        // await this.updateStatusEffects();
        super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId);
    }

    /**
     * Restrict the movement for the token in combat
     * @param data
     * @return {void}
     * @private
     */
    async _restrictMovement(data) {
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
            if (requiredActions > actorMisc.action) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughActions"));
                delete data.x;
                delete data.y;
                return;
            }

            // Retrieve action and add remaining movement
            actorMisc.action -= requiredActions;
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
            "system.misc.action": actorMisc.action,
            "system.variables.remainingMovement": actorVariables.remainingMovement,
            "system.variables.usedMovement": actorVariables.usedMovement,
            "system.variables.movementAction": actorVariables.movementAction
        });
    }

}