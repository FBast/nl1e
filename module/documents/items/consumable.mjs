import {Pl1eItem} from "./item.mjs";

export class Pl1eConsumable extends Pl1eItem {

    /** @inheritDoc */
    async resolve(characterData, options) {
        await super.resolve(characterData, options);

        if (options.action === "launch") {
            // If the consumable has no more uses then destroy
            if (!characterData.item.system.attributes.isReloadable &&
                characterData.item.system.attributes.uses >= characterData.item.system.removedUses) {
                await this.actor.removeItem(characterData.item);
            }
        }
    }

}