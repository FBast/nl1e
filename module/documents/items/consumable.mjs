import {Pl1eItem} from "./item.mjs";

export class Pl1eConsumable extends Pl1eItem {

    /**
     * Check if the item need to be reloaded
     * @return {*|boolean}
     */
    get isReloaded() {
        if (this.system.attributes.uses > 0 && this.system.removedUses >= this.system.attributes.uses) return false;

        return super.isReloaded;
    }

    /** @inheritDoc **/
    get isEnabled() {
        if (!this.isReloaded) return false;

        return super.isEnabled;
    }

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