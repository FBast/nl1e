export class Pl1eCombat extends Combat {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
    }

    /** @inheritDoc */
    async nextRound() {
        for (const combatant of this.combatants) {
            await this._resetCombatStats(combatant.actor);
            await this._deleteCompletedActiveEffects(combatant.actor);
        }
        return super.nextRound();
    }

    /** @inheritDoc */
    async nextTurn() {
        /** @type {Combat} */
        const combat = await super.nextTurn();
        await this._applyContinuousEffects(combat.combatant.actor);
        await this._decreaseEffectsDuration(combat.combatant.actor);

        return combat;
    }

    /** @inheritDoc */
    async endCombat() {
        for (const combatant of this.combatants) {
            await this._resetCombatStats(combatant.actor);
            await this._deleteTemporaryActiveEffects(combatant.actor);
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
            "system.misc.reaction": 1,
            "system.variables.usedMovement": 0,
            "system.variables.remainingMovement": 0,
            "system.variables.movementAction": 0
        });
        for (let item of actor.items) {
            if (item.type === "weapon" || item.type === "wearable") {
                await item.update({
                    "system.majorActionUsed": false
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
                "system.resources.health.value": actor.system.resources.health.value - 5
            });
        }
        if (actor.statuses.has("regenerate") && !actor.statuses.has("dead")) {
            await actor.update({
                "system.resources.health.value": actor.system.resources.health.value + 5
            });
        }
        if (actor.statuses.has("unconscious")) {
            await actor.update({
                "system.resources.health.value": actor.system.resources.health.value - 1
            });
        }
    }

    /**
     * Decrease the duration of the effects linked to this actor
     * @param {Actor} actor
     * @return {Promise<void>}
     * @private
     */
    async _decreaseEffectsDuration(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            const duration = effect.duration;
            duration.rounds--;

            // Update the duration of the effect
            await effect.update({
                duration: duration
            });
        }
    }

    /**
     * Remove all completed active effects
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _deleteCompletedActiveEffects(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            if (effect.duration.rounds > 0) continue;
            await effect.delete();
        }
    }

    /**
     * Remove all temporary active effects
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _deleteTemporaryActiveEffects(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            await effect.delete();
        }
    }

}