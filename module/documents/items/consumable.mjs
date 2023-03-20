import {Pl1eSubItem} from "./subItem.mjs";
import {PL1E} from "../../helpers/config.mjs";

export class Pl1eConsumable extends Pl1eSubItem {

    /** @override */
    async use(options) {
        const attributes = PL1E.attributes;

        // Removed one use
        await this.update({
            ["system.removedUses"]: foundry.utils.getProperty(this, "system.removedUses") + 1,
        });

        // Launch consumable effect
        for (let [id, attribute] of Object.entries(this.system.attributes)) {
            if (!attribute.apply || attributes[id]["path"] === undefined) continue;
            if (attributes[id]["operator"] === 'set') {
                foundry.utils.setProperty(this.actor.system, attributes[id]["path"], attribute.value);
            } else if (attributes[id]["operator"] === 'push') {
                let currentValue = foundry.utils.getProperty(this.actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(attribute.value);
                foundry.utils.setProperty(this.actor.system, attributes[id]["path"], currentValue);
            } else if (attributes[id]["operator"] === 'add') {
                let currentValue = foundry.utils.getProperty(this.actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = 0;
                await this.actor.update({
                    ["system." + attributes[id]["path"]]: currentValue + attribute.value
                });
            }
        }
        // The item have no more uses and is not reloadable
        if (this.system.removedUses >= this.system.attributes.uses.value && !this.system.attributes.reloadable.value) {
            await this.delete();
        }
    }

    /** @override */
    async reload(options) {
        await this.item.update({
            ["system.removedUses"]: 0
        });
    }

}