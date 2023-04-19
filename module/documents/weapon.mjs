import {Pl1eActorItem} from "./actorItem.mjs";

export class Pl1eWeapon extends Pl1eActorItem {

    /** @override */
    async toggle(options) {
        if (!this._canToggle(this.actor)) return;

        const hands = this.system.attributes.hands.value;
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
        // Unequip other subItems
        for (let otherItem of this.actor.items) {
            // Ignore if otherItem is not a weapon
            if (otherItem.type !== 'weapon') continue;
            // Ignore if otherItem is item
            if (otherItem === this) continue;
            // If other item is equipped on main and this item is equipped on main
            if (otherItem.system.isEquippedMain && this.system.isEquippedMain) {
                // If other item is equipped on two hands
                if (otherItem.system.attributes.hands.value === 2) {
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
                if (otherItem.system.attributes.hands.value === 2) {
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
        if (takenHands < (this.system.isEquippedMain ? 1 : 0) + (this.system.isEquippedSecondary ? 1 : 0))
            await this.actor.update({"system.misc.action": this.actor.system.misc.action - 1});

        //TODO display a message when equipping weapon in combat

        this.actor.sheet.render(false);
    }

    /**
     * Check if the ability toggle is valid
     * @param {Actor} actor
     * @private
     */
    _canToggle(actor) {
        let isValid = true;
        // If is not in battle
        const token = actor.bestToken;
        if (token.inCombat && token.id !== game.combat.current.tokenId) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotYourTurn"));
            isValid = false;
        }
        if (token.inCombat && token.id === game.combat.current.tokenId && this.actor.system.misc.action === 0) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoMoreAction"));
            isValid = false;
        }
        return isValid;
    }

}