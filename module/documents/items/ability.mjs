import {Pl1eItem} from "../item.mjs";

export class Pl1eAbility extends Pl1eItem {

    /**
     * Data of the character
     * @type {CharacterData}
     */
    characterData;

    /** @inheritDoc */
    async toggle(options) {
        if (!this.system.isMemorized && this.actor.system.general.slots - this.system.attributes.level < 0) return;

        await this.update({
            ["system.isMemorized"]: !this.system.isMemorized
        });

        await super.toggle(options);
    }

    /** @inheritDoc */
    _canActivate(actor, token) {
        if (!super._canActivate(actor, token)) return false;
        const itemAttributes = this.system.attributes;

        if (!this.system.isMemorized) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotMemorized"));
            return false;
        }
        if (itemAttributes.weaponLink !== "none" && this._getLinkableItems(itemAttributes, actor.items).length === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoLinkedItemMatch"));
            return false;
        }
        return true;
    }

}