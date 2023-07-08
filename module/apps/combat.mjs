export class Pl1eCombat extends Combat {

    /** @inheritDoc */
    async nextRound() {
        for (const combatant of this.combatants) {
            await this.resetCombatStats(combatant.actor);
        }
        return super.nextRound();
    }

    async endCombat() {
        for (const combatant of this.combatants) {
            await this.resetCombatStats(combatant.actor);
        }
        return super.endCombat();
    }

    async resetCombatStats(actor) {
        await actor.update({
            "system.misc.action": 2,
            "system.misc.reaction": 1
        });
        for (let item of actor.items) {
            if (item.type === "weapon" || item.type === "wearable") {
                await item.update({
                    "system.isMajorActionUsed": false
                });
            }
        }
    }

}