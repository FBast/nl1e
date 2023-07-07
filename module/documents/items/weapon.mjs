import {Pl1eItem} from "../item.mjs";
import {Pl1eChat} from "../../helpers/chat.mjs";

export class Pl1eWeapon extends Pl1eItem {

    /** @override */
    async toggle(options) {
        if (!this._canToggle()) return;

        const hands = this.system.attributes.hands;
        const takenHands = (this.system.isEquippedMain ? 1 : 0) + (this.system.isEquippedSecondary ? 1 : 0);

        // Toggle item hands
        if (hands === 2) {
            await this.update({
                "system.isEquippedMain": !this.system.isEquippedMain,
                "system.isEquippedSecondary": !this.system.isEquippedSecondary
            });
        }
        else if (options.main) {
            // Switch hand case
            if (!this.system.isEquippedMain && this.system.isEquippedSecondary) {
                await this.update({"system.isEquippedSecondary": false});
            }
            await this.update({"system.isEquippedMain": !this.system.isEquippedMain})
        }
        else {
            // Switch hand case
            if (!this.system.isEquippedSecondary && this.system.isEquippedMain) {
                await this.update({["system.isEquippedMain"]: false});
            }
            await this.update({"system.isEquippedSecondary": !this.system.isEquippedSecondary});
        }

        // Unequip other items
        for (let otherItem of this.actor.items) {
            // Ignore if otherItem is not a weapon
            if (otherItem.type !== 'weapon') continue;
            // Ignore if otherItem is this
            if (otherItem === this) continue;
            // If other item is equipped on main and this item is equipped on main
            if (otherItem.system.isEquippedMain && this.system.isEquippedMain) {
                // If other item is equipped on two hands
                if (otherItem.system.attributes.hands === 2) {
                    await otherItem.update({
                        "system.isEquippedMain": false,
                        "system.isEquippedSecondary": false
                    });
                }
                // Else other item only equip main hand
                else {
                    await otherItem.update({"system.isEquippedMain": false});
                }
            }
            // If other item is equipped on secondary and this item is equipped on secondary
            if (otherItem.system.isEquippedSecondary && this.system.isEquippedSecondary) {
                // If other item is equipped on two hands
                if (otherItem.system.attributes.hands === 2) {
                    await otherItem.update({
                        "system.isEquippedMain": false,
                        "system.isEquippedSecondary": false
                    });
                }
                // Else other item only equip secondary hand
                else {
                    await otherItem.update({"system.isEquippedSecondary": false});
                }
            }
        }

        // Remove action if in combat and more taken hands than before
        if (takenHands < (this.system.isEquippedMain ? 1 : 0) + (this.system.isEquippedSecondary ? 1 : 0)) {
            await this.actor.update({"system.misc.action": this.actor.system.misc.action - 1});
            await Pl1eChat.actionMessage(this.parent, "PL1E.Equip", 1, { item: this });
        }

        this.actor.sheet.render(false);
    }

    /**
     * Check if the toggle is valid
     * @private
     */
    _canToggle() {
        let isValid = true;
        const token = this.actor.bestToken;
        if (token !== null && token.inCombat && token.id !== game.combat.current.tokenId) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
            isValid = false;
        }
        if (token !== null && token.inCombat && token.id === game.combat.current.tokenId && this.actor.system.misc.action === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            isValid = false;
        }
        return isValid;
    }

}