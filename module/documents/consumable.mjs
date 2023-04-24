import {PL1E} from "../config/config.mjs";
import {Pl1eActorItem} from "./actorItem.mjs";

export class Pl1eConsumable extends Pl1eActorItem {

    /** @override */
    async activate() {
        const attributes = PL1E.attributes;

        // Removed one use
        await this.update({
            ["system.removedUses"]: foundry.utils.getProperty(this, "system.removedUses") + 1,
        });

        //TODO-fred Obsolete
        // Launch consumable effect
        for (let [id, attribute] of Object.entries(this.system.attributes)) {
            if (attributes[id]["path"] === undefined) continue;
            if (attributes[id]["operator"] === 'override') {
                foundry.utils.setProperty(this.actor, attributes[id]["path"], attribute.value);
            } else if (attributes[id]["operator"] === 'push') {
                let currentValue = foundry.utils.getProperty(this.actor, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(attribute.value);
                foundry.utils.setProperty(this.actor, attributes[id]["path"], currentValue);
            } else if (attributes[id]["operator"] === 'add') {
                let currentValue = foundry.utils.getProperty(this.actor, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = 0;
                await this.actor.update({
                    [attributes[id]["path"]]: currentValue + attribute.value
                });
            }
        }
        // The item have no more uses and is not reloadable
        if (this.system.removedUses >= this.system.attributes.uses.value && !this.system.attributes.isReloadable.value) {
            await this.delete();
        }
    }

    /** @override */
    async reload(options) {
        await this.update({
            ["system.removedUses"]: 0
        });
    }

}

