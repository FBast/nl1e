import {Pl1eItem} from "./item.mjs";
import {Pl1eChatMessage} from "../chat-message.mjs";

export class Pl1eWearable extends Pl1eItem {

    /** @inheritDoc **/
    get isEquipped() {
        if (!this.system.isEquipped) return false;

        return super.isEquipped;
    }

    /** @inheritDoc **/
    get isEnabled() {
        if (!this.isEquipped) return false;

        return super.isEnabled;
    }

    /** @override */
    async toggle(options) {
        if (!this._canToggle()) return;
        const slot = this.system.attributes.slot;

        // Toggle item slot
        await this.update({
            ["system.isEquipped"]: !foundry.utils.getProperty(this, "system.isEquipped"),
        });

        // Ignore if not using a slot
        if (!['garment', 'armor', 'ring', 'necklace'].includes(slot)) return;

        // If the item is now equipped
        if (this.system.isEquipped) {
            // Unequip other subItems
            let ringCount = 1;
            for (let otherItem of this.actor.items) {
                // Ignore if otherItem is not a wearable
                if (otherItem.type !== 'wearable') continue;
                // Ignore if otherItem is item
                if (otherItem === this) continue;
                // Count same subItems slot
                if (otherItem.system.isEquipped && otherItem.system.attributes.slot === slot) {
                    // Unequipped immediately if garment, armor or necklace
                    if (['garment', 'armor', 'necklace'].includes(slot)) {
                        await otherItem.update({
                            ["system.isEquipped"]: false
                        });
                    }
                    // Count equipped rings if ring
                    else if (['ring'].includes(slot)) {
                        if (ringCount >= 2) {
                            await otherItem.update({
                                ["system.isEquipped"]: false
                            });
                        } else {
                            ringCount++;
                        }
                    }
                }
            }

            // Remove action if in combat
            if (this.parent.bestToken !== null && this.parent.bestToken.inCombat) {
                await this.actor.update({
                    "system.general.action": this.actor.system.general.action - 1
                });
                await Pl1eChatMessage.actionMessage(this.parent, "PL1E.Equip", 1, { item: this });
            }
        }

        await super.toggle(options);
    }

    /**
     * Check if the toggle is valid
     * @private
     */
    _canToggle() {
        const token = this.actor.bestToken;

        if ((this.system.attributes.slot === "armor" || this.system.attributes.slot === "garment")
            && token && token.inCombat) {
            ui.notifications.info(game.i18n.localize("PL1E.OutCombatOnly"));
            return false;
        }
        if (token !== null && token.inCombat && token.id !== game.combat.current.tokenId) {
            ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
            return false;
        }
        if (token !== null && this.actor.system.general.action <= 0 && !this.system.isEquipped) {
            ui.notifications.info(game.i18n.localize("PL1E.NoMoreAction"));
            return false;
        }
        return true;
    }

}