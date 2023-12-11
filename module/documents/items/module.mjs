import {Pl1eItem} from "./item.mjs";

export class Pl1eModule extends Pl1eItem {

    /** @inheritDoc */
    _preUpdate(changed, options, user) {
        if (!this.isEmbedded) {
            // Reset default values in case of changes
            if (changed.system?.attributes?.moduleType === "weapon") {
                changed["system.attributes.moduleSlot"] = [];
            }
            if (changed.system?.attributes?.moduleType === "shield") {
                changed["system.attributes.moduleSlot"] = [];
            }
        }

        return super._preUpdate(changed, options, user);
    }

}