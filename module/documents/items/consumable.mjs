import {Pl1eItem} from "../item.mjs";

export class Pl1eConsumable extends Pl1eItem {

    /** @override */
    async activate() {
        if (!await super.activate()) return false;

        // Update item use
        await this.update({
            "system.attributes.uses": this.system.attributes.uses - 1
        })

        // The item have no more uses and is not reloadable
        if (this.system.removedUses >= this.system.attributes.uses && !this.system.attributes.isReloadable) {
            await this.delete();
        }
    }

    /** @override */
    async reload(options) {
        await this.update({
            ["system.removedUses"]: 0
        });
    }

    /** @inheritDoc */
    _canActivate(actor, token) {
        if (!super._canActivate(actor, token)) return false;
        const itemAttributes = this.system.attributes;

        if (itemAttributes.outCombatOnly && token.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.OutCombatOnly"));
            return false;
        }
        return true;
    }

}

