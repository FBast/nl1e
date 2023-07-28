export class Pl1eCombat extends Combat {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
    }

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
        for (const combatant of this.combatants) {
            await this._decreaseEffectsDuration(combat.combatant, combatant.actor);
        }
        return combat;
    }

    /** @inheritDoc */
    async endCombat() {
        for (const combatant of this.combatants) {
            await this._resetCombatStats(combatant.actor);
            await this._deleteActiveEffects(combatant.actor);
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
            "system.misc.action": 2,
            "system.misc.reaction": 1,
            "system.variables.usedMovement": 0,
            "system.variables.remainingMovement": 0,
            "system.variables.movementAction": 0
        });
        for (let item of actor.items) {
            if (item.type === "weapon" || item.type === "wearable") {
                await item.update({
                    "system.isMajorActionUsed": false
                });
            }
        }
    }

    /**
     * Decrease the duration of the effects linked to this combatant
     * @param {Combatant} combatant the related combatant
     * @param {Actor} actor the actor of the effects
     * @return {Promise<void>}
     * @private
     */
    async _decreaseEffectsDuration(combatant, actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            if (effect.getFlag("core", "sourceId") !== combatant.actor.id) continue;
            const duration = effect.data.duration;
            if (duration.rounds > 0) {
                duration.rounds -= 1;

                // If the rounds reach 0, remove the effect
                if (duration.rounds === 0) {
                    await effect.delete();
                }
                else {
                    // Update the duration of the effect
                    await effect.update({duration});
                }
            }
        }
    }

    /**
     * Remove all active effects
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     * @private
     */
    async _deleteActiveEffects(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            await effect.delete();
        }
    }

}