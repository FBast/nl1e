import {Pl1eItem} from "../item.mjs";

export class Pl1eWearable extends Pl1eItem {

    /** @override */
    async toggle(options) {
        const slot = this.system.attributes.slot;

        // Toggle item slot
        await this.update({
            ["system.isEquipped"]: !getProperty(this, "system.isEquipped"),
        });

        // If unequipped then return
        if (!this.system.isEquipped) return;

        // Ignore if not using a slot
        if (!['clothes', 'armor', 'ring', 'amulet'].includes(slot)) return;

        // Unequip other subItems
        let ringCount = 1;
        for (let otherItem of this.actor.items) {
            // Ignore if otherItem is not a wearable
            if (otherItem.type !== 'wearable') continue;
            // Ignore if otherItem is item
            if (otherItem === this) continue;
            // Count same subItems slot
            if (otherItem.system.isEquipped && otherItem.system.attributes.slot === slot) {
                // Unequipped immediately if clothes, armor or amulet
                if (['clothes', 'armor', 'amulet'].includes(slot)) {
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
        this.actor.sheet.render(false);
    }

}