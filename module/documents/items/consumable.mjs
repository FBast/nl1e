import {Pl1eItem} from "../item.mjs";

export class Pl1eConsumable extends Pl1eItem {

    /** @inheritDoc */
    async _postActivate(characterData) {
        // Update item use
        await this.update({
            "system.removedUses": this.system.attributes.removedUses + 1
        })

        // The item have no more uses and is not reloadable
        if (this.system.removedUses >= this.system.attributes.uses && !this.system.attributes.isReloadable) {
            await this.delete();
        }
    }

    /** @inheritDoc */
    _canActivate(characterData) {
        if (!super._canActivate(characterData)) return false;

        if (characterData.attributes.outCombatOnly && characterData.token && characterData.token.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.OutCombatOnly"));
            return false;
        }
        return true;
    }

}

