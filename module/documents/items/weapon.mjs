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
    async toggle(options = {}) {
        if (!this.canToggle()) return;

        const hands = this.system.attributes.hands;
        const isMain = this.system.isEquippedMain;
        const isSecondary = this.system.isEquippedSecondary;
        const totalBefore = (isMain ? 1 : 0) + (isSecondary ? 1 : 0);

        const otherWeapons = this.actor.items.filter(i => i.type === "weapon" && i !== this);
        const mainFree = !otherWeapons.some(i => i.system.isEquippedMain);
        const secFree = !otherWeapons.some(i => i.system.isEquippedSecondary);

        // Determine the desired equip state
        let newMain = false;
        let newSecondary = false;

        if (hands === 2) {
            const equip = !isMain || !isSecondary;
            newMain = equip;
            newSecondary = equip;
        }
        else if ("main" in options) {
            if (options.main) {
                newMain = !isMain;
                newSecondary = false;
            } else {
                newMain = false;
                newSecondary = !isSecondary;
            }
        }
        else {
            if (isMain || isSecondary) {
                newMain = false;
                newSecondary = false;
            } else if (mainFree) {
                newMain = true;
            } else if (secFree) {
                newSecondary = true;
            } else {
                newMain = true;
            }
        }

        // Unequip other weapons that share used hands or are 2-handed but no longer valid
        for (const other of this.actor.items) {
            if (other.type !== "weapon" || other === this) continue;

            const isTwoHanded = other.system.attributes.hands === 2;
            const equippedMain = other.system.isEquippedMain;
            const equippedSec = other.system.isEquippedSecondary;

            // Flag for unequip
            let unequip = false;

            // If the weapon we're about to equip uses the same hands
            if (newMain && equippedMain) unequip = true;
            if (newSecondary && equippedSec) unequip = true;

            // If the other weapon is 2-handed and no longer fully equipped (or soon won't be)
            if (isTwoHanded && (equippedMain || equippedSec)) unequip = true;

            if (unequip) {
                await other.update({
                    "system.isEquippedMain": false,
                    "system.isEquippedSecondary": false
                });
            }
        }

        // Equip this item
        await this.update({
            "system.isEquippedMain": newMain,
            "system.isEquippedSecondary": newSecondary
        });

        // Consume action if necessary
        const totalAfter = (newMain ? 1 : 0) + (newSecondary ? 1 : 0);
        if (this.parent.bestToken?.inCombat && totalBefore < totalAfter) {
            await this.actor.update({
                "system.general.action": this.actor.system.general.action - 1
            });
            await ChatMessage.actionMessage(this.parent, "PL1E.Equip", 1, { item: this });
        }

        await super.toggle(options);
    }

    async activate() {
        if (this.canToggle()) {
            await this.toggle();
        }
    }
}