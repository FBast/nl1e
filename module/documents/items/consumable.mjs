import {Pl1eItem} from "./item.mjs";

export class Pl1eConsumable extends Pl1eItem {

    /** @inheritDoc */
    async launch(characterData) {
        await super.launch(characterData);

        // If the consumable has no more uses then destroy
        if (!characterData.item.system.attributes.isReloadable &&
            characterData.item.system.attributes.uses >= characterData.item.system.removedUses) {
            await characterData.item.delete();
        }
    }

}