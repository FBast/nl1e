import {PL1E} from "../../config/config.mjs";
import {Pl1eItem} from "../item.mjs";

export class Pl1eConsumable extends Pl1eItem {

    /** @override */
    async activate() {
        const token = this.actor.bestToken;
        if (!this._canActivate(token, token.actor)) return;

        const attributes = PL1E.attributes;

        // Removed one use
        await this.update({
            ["system.removedUses"]: foundry.utils.getProperty(this, "system.removedUses") + 1,
        });

        //TODO-fred Obsolete
        // Launch consumable effect
        for (let [id, attribute] of Object.entries(this.system.attributes)) {
            if (attributes[id]["path"] === undefined) continue;
            if (attributes[id]["operator"] === 'set') {
                setProperty(this.actor, attributes[id]["path"], attribute);
            } else if (attributes[id]["operator"] === 'push') {
                let currentValue = foundry.utils.getProperty(this.actor, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(attribute);
                setProperty(this.actor, attributes[id]["path"], currentValue);
            } else if (attributes[id]["operator"] === 'add') {
                let currentValue = foundry.utils.getProperty(this.actor, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = 0;
                await this.actor.update({
                    [attributes[id]["path"]]: currentValue + attribute
                });
            }
        }
        // The item have no more uses and is not reloadable
        if (this.system.removedUses >= this.system.attributes.uses && !this.system.attributes.isReloadable) {
            await this.delete();
        }
    }

    /** @override */
    async reload(options) {
        await this.update({
            ["system.removedUses"]: 0
        });
    }

    /** @inheritDoc */
    _canActivate(token, actor) {
        if (!super._canActivate(token, actor)) return false;

        const itemAttributes = this.system.attributes;
        if (itemAttributes.usageContext === "inCombat" && !token.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotInCombat"));
            return false;
        }
        if (itemAttributes.usageContext === "outCombat" && token.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.InCombatOnly"));
            return false;
        }
        return true;
    }

}

