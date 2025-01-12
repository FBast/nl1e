import { PL1E } from "../pl1e.mjs";

export class Pl1eCombat extends Combat {
    /** @inheritDoc */
    async nextRound() {
        for (const combatant of this.combatants) {
            await this._resetCombatStats(combatant.actor);
        }
        return super.nextRound();
    }

    /** @inheritDoc */
    async nextTurn() {
        /** @type {Combat} */
        const combat = await super.nextTurn();
        const currentCombatant = combat.combatant;
        const currentToken = canvas.tokens.get(currentCombatant.tokenId);

        if (currentToken.isOwner) {
            PL1E.socket.executeForEveryone("centerAndSelectToken", currentCombatant.tokenId);
        }

        // Decrease turns for all actors' effects with 0 rounds
        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            if (actor) {
                await this._decreaseEffectsTurn(actor);
            }
        }

        // Decrease turns for the current combatant's effects
        const currentActor = currentCombatant.actor;
        if (currentActor) {
            await this._decreaseEffectsRound(currentActor);
            await this._applyContinuousEffects(currentActor); // Apply continuous effects for the current combatant
        }

        return combat;
    }

    /** @inheritDoc */
    async endCombat() {
        for (const combatant of this.combatants) {
            const actor = combatant.actor;
            if (!actor) continue;

            // Reset the combat stats for the actor
            await this._resetCombatStats(actor);

            // Remove all temporary effects
            await this._removeAllTemporaryEffects(actor);
        }

        return super.endCombat();
    }


    /**
     * Reset all the combat stats of the actor
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _resetCombatStats(actor) {
        await actor.update({
            "system.general.action": 2,
            "system.general.reaction": 1,
            "system.general.quickAction": 1,
            "system.variables.usedMovement": 0,
            "system.variables.remainingMovement": 0,
            "system.variables.movementAction": 0,
        });
        for (let item of actor.items) {
            if (item.type === "weapon" || item.type === "wearable") {
                await item.update({
                    "system.majorActionUsed": false,
                });
            }
        }
    }

    /**
     * Apply the continuous effects of the actor
     * @param {Actor} actor
     * @return {Promise<void>}
     * @private
     */
    async _applyContinuousEffects(actor) {
        if (actor.statuses.has("bleeding") && !actor.statuses.has("dead")) {
            await actor.update({
                "system.resources.health.value": actor.system.resources.health.value - 5,
            });
        }
        if (actor.statuses.has("regenerate") && !actor.statuses.has("dead")) {
            await actor.update({
                "system.resources.health.value": actor.system.resources.health.value + 5,
            });
        }
        if (actor.statuses.has("unconscious")) {
            await actor.update({
                "system.resources.health.value": actor.system.resources.health.value - 1,
            });
        }
    }

    /**
     * Decrease turns for effects with 0 or null rounds for a specific actor.
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _decreaseEffectsTurn(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue; // Skip permanent effects

            const duration = effect.duration;

            // Normalize null or undefined rounds and turns to 0
            const rounds = duration.rounds ?? 0;
            const turns = duration.turns ?? 0;

            if (rounds === 0 && turns > 0) {
                // Decrease turns only if rounds are already 0
                duration.turns = turns - 1; // Decrement turns
            }

            // Delete the effect if both rounds and turns are 0
            if (duration.rounds <= 0 && duration.turns <= 0) {
                await effect.delete();
            }
            else {
                await effect.update({ duration });
            }
        }
    }


    /**
     * Decrease the duration of all effects for the current combatant.
     * Normalize null or undefined rounds and turns to 0.
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _decreaseEffectsRound(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue; // Skip permanent effects

            const duration = effect.duration;

            // Normalize null or undefined rounds and turns to 0
            const rounds = duration.rounds ?? 0;
            const turns = duration.turns ?? 0;

            if (rounds > 0) {
                // Decrease rounds if rounds > 0
                duration.rounds = rounds - 1;
            }

            // Delete the effect if both rounds and turns are 0
            if (duration.rounds <= 0 && duration.turns <= 0) {
                await effect.delete();
            }
            else {
                await effect.update({ duration });
            }
        }
    }

    /**
     * Remove all temporary effects from the actor.
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _removeAllTemporaryEffects(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue; // Skip permanent effects
            await effect.delete(); // Delete all temporary effects
        }
    }
}
