export class Pl1eCombat extends Combat {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
    }

    /** @inheritDoc */
    async nextRound() {
        for (const combatant of this.combatants) {
            await this.resetCombatStats(combatant.actor);
            await this.updateActiveEffects(combatant.actor);
        }
        return super.nextRound();
    }

    /** @inheritDoc */
    async endCombat() {
        for (const combatant of this.combatants) {
            await this.resetCombatStats(combatant.actor);
            await this.deleteActiveEffects(combatant.actor);
        }
        return super.endCombat();
    }

    /**
     * Reset all the combat stats of the actor
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     */
    async resetCombatStats(actor) {
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
     * Update all the active effect decreasing their duration
     * @param {Pl1eActor} actor
     * @return {Promise<void>}
     */
    async updateActiveEffects(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            const duration = effect.data.duration;
            if (duration.rounds > 0) {
                duration.rounds -= 1;

                // If the rounds reach 0, remove the effect
                if (duration.rounds === 0) {
                    await effect.delete();
                } else {
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
     */
    async deleteActiveEffects(actor) {
        for (const effect of actor.effects) {
            if (effect.getFlag("pl1e", "permanent")) continue;
            await effect.delete();
        }
    }

}