export class Pl1eCombat extends Combat {

    /** @inheritDoc */
    async nextRound() {
        for (const combatant of this.combatants) {
            await this.resetCombatStats(combatant.actor);
        }
        return super.nextRound();
    }

    async resetCombatStats(actor) {
        await actor.update({
            "system.misc.action": 2,
            "system.misc.reaction": 1
        });
    }

}