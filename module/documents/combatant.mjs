export class Pl1eCombatant extends Combatant {

    /** @inheritDoc */
    get isDefeated() {
        const token = this.token;
        if (token) return token.isDefeated;
        return false;
    }

}