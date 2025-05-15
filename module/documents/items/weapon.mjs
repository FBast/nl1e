import {Pl1eItem} from "./item.mjs";

export class Pl1eWeapon extends Pl1eItem {

    /**
     * Check if the item need to be reloaded
     * @return {*|boolean}
     */
    get isReloaded() {
        if (this.system.attributes.uses > 0 && this.system.removedUses >= this.system.attributes.uses) return false;

        return super.isReloaded;
    }

    /** @inheritDoc **/
    get isEquipped() {
        if (this.system.attributes.hands > 0 && !this.system.isEquippedMain && !this.system.isEquippedSecondary) return false;

        return super.isEquipped;
    }

    /** @inheritDoc **/
    get isEnabled() {
        if (!this.isEquipped) return false;

        return super.isEnabled;
    }

    /** @inheritDoc */
    get warnings() {
        const warnings = super.warnings;

        if (!this.isReloaded) warnings.push("PL1E.NotReloaded");
        if (!this.isMajorActionAvailable) warnings.push("PL1E.MajorActionUsed");

        return warnings;
    }

    /** @inheritDoc */
    _preUpdate(changed, options, user) {
        if (!this.isEmbedded) {
            // Reset default values in case of changes
            if (changed.system?.attributes?.meleeUse === false) {
                changed["system.attributes.reach"] = 0;
                changed["system.attributes.meleeRoll"] = [];
                changed["system.attributes.meleeOppositeRoll"] = [];
            }
            if (changed.system?.attributes?.meleeUse === true) {
                changed["system.attributes.reach"] = 1;
            }
            if (changed.system?.attributes?.rangedUse === false) {
                changed["system.attributes.range"] = 0;
                changed["system.attributes.rangeRoll"] = [];
                changed["system.attributes.rangeOppositeRoll"] = [];
            }
            if (changed.system?.attributes?.rangedUse === true) {
                changed["system.attributes.range"] = 4;
            }
            if (changed.system?.attributes?.magicUse === false) {
                changed["system.attributes.magicRoll"] = [];
                changed["system.attributes.magicOppositeRoll"] = [];
            }
        }

        return super._preUpdate(changed, options, user);
    }

    /** @inheritDoc */
    canToggle() {
        if (!super.canToggle()) return false;
        const token = this.actor.bestToken;

        if (token !== null && token.inCombat && token.id !== game.combat.current.tokenId) {
            ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
            return false;
        }
        if (token !== null && this.actor.system.general.action <= 0 && !this.isEquipped) {
            ui.notifications.info(game.i18n.localize("PL1E.NoMoreAction"));
            return false;
        }
        return true;
    }

    /** @inheritDoc */
    async toggle(options) {
        if (!this.canToggle()) return;

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
            // Switch a hand case
            if (!this.system.isEquippedMain && this.system.isEquippedSecondary) {
                await this.update({"system.isEquippedSecondary": false});
            }
            await this.update({"system.isEquippedMain": !this.system.isEquippedMain})
        }
        else {
            // Switch a hand case
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
            // If the other item is equipped on main and this item is equipped on main
            if (otherItem.system.isEquippedMain && this.system.isEquippedMain) {
                // If the other item is equipped on two hands
                if (otherItem.system.attributes.hands === 2) {
                    await otherItem.update({
                        "system.isEquippedMain": false,
                        "system.isEquippedSecondary": false
                    });
                }
                // Else the other item only equip the main hand
                else {
                    await otherItem.update({"system.isEquippedMain": false});
                }
            }
            // If the other item is equipped on secondary and this item is equipped on secondary
            if (otherItem.system.isEquippedSecondary && this.system.isEquippedSecondary) {
                // If the other item is equipped on two hands
                if (otherItem.system.attributes.hands === 2) {
                    await otherItem.update({
                        "system.isEquippedMain": false,
                        "system.isEquippedSecondary": false
                    });
                }
                // Else the other item only equip secondary hand
                else {
                    await otherItem.update({"system.isEquippedSecondary": false});
                }
            }
        }

        // Remove quick action if in combat and more taken hands than before
        if (this.parent.bestToken !== null && this.parent.bestToken.inCombat &&
            takenHands < (this.system.isEquippedMain ? 1 : 0) + (this.system.isEquippedSecondary ? 1 : 0)) {
            await this.actor.update({
                "system.general.action": this.actor.system.general.action - 1
            });
            await ChatMessage.actionMessage(this.parent, "PL1E.Equip", 1, { item: this });
        }

        await super.toggle(options);
    }
}