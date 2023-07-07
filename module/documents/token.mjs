export class Pl1eToken extends Token {

    _canDrag(user, event) {
        if (this.combatant !== undefined) {
            const actorMisc = this.actor.system.misc;

            if (actorMisc.action === 0 && actorMisc.remainingMovement === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
                return false;
            }
        }
        return super._canDrag(user, event);
    }

    _canControl(user, event) {
        if (this.combatant !== undefined) {
            const currentTokenId = game.combat.current?.tokenId;

            if (currentTokenId !== this._id) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
                return false;
            }
        }
        return super._canControl(user, event);
    }

}