import {Pl1eChat} from "../helpers/chat.mjs";

export class Pl1eTokenDocument extends TokenDocument {

    /** @inheritDoc */
    get isDefeated() {
        return this.actor.system.resources.health.value <= -this.actor.system.misc.deathDoor;
    }

    get isUnconscious() {
        return this.actor.system.resources.health.value <= -this.actor.system.misc.unconsciousnessDoor;
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
        await this.updateStatusEffects();
        super._onUpdateBaseActor(update, options);
    }

    /** @inheritDoc */
    async _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        await this.updateStatusEffects();
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

    /**
     * Update the status effects
     * @return {Promise<void>}
     * @private
     */
    async updateStatusEffects() {
        if (!this.isOwner) return;

        // Helper function to handle toggling status effects
        const toggleStatusEffect = async (statusEffectId, isActive) => {
            const activeEffect = this.actor.effects.find(effect => effect.statuses.has(statusEffectId));
            const statusEffect = CONFIG.statusEffects.find(status => status.id === statusEffectId);
            if (!activeEffect && isActive) {
                // await this.actor.createEmbeddedDocuments("ActiveEffect", [statusEffect])
                await this.toggleActiveEffect(statusEffect, {overlay: true, active: true});
            }
            else if (activeEffect && !isActive) {
                // await this.actor.deleteEmbeddedDocuments("ActiveEffect", [activeEffect.id])
                await this.toggleActiveEffect(statusEffect, { overlay: false, active: false });
            }
        };

        // await toggleStatusEffect("unconscious", this.isUnconscious);
        await toggleStatusEffect("dead", this.isDefeated);
    }

}