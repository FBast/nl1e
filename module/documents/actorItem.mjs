import {Pl1eItem} from "./item.mjs";
import {Pl1eItemProxy} from "./itemProxy.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class Pl1eActorItem extends Pl1eItem {

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    async prepareData() {
        // As with the actor class, subItems are documents that can have their data
        super.prepareData();

        //TODO this process should be done for original item only, not actor embedded items

        // // Prepare refItems
        // if (this.system.refItems.uuids) {
        //     this.system.refItems.uuids = Object.values(this.system.refItems.uuids);
        //     this.system.refItems.items = Object.values(this.system.refItems.items);
        //     for (let i = 0; i < this.system.refItems.uuids.length; i++) {
        //         const uuid = this.system.refItems.uuids[i];
        //         const itemData = this.system.refItems.items[i];
        //         let originalItem = game.items.find(item => item.uuid === uuid);
        //         // Item does not exist then remove from the arrays
        //         if (!originalItem) {
        //             this.system.refItems.items.splice(i, 1);
        //             this.system.refItems.uuids.splice(i, 1);
        //             await this.update({
        //                 "system.refItems.items": this.system.refItems.items,
        //                 "system.refItems.uuids": this.system.refItems.uuids
        //             });
        //             i--;
        //         }
        //         else {
        //             await this.addItem(originalItem);
        //             // this.system.refItems.items[i] = originalItem;
        //
        //
        //
        //             // const originalData = originalItem.toObject(false);
        //             // Pl1eHelpers.mergeDeep(originalData, itemData);
        //             // originalData._id = this.system.refItems.ids[i];
        //             // originalItem = new Pl1eItemProxy(originalData);
        //             // await originalItem.setFlag("core", "sourceUuid", uuid);
        //             // this.system.refItems.items[i] = originalItem;
        //         }
        //     }
        // }
    }

    /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        if (!this.actor) return null;
        const rollData = this.actor.getRollData();
        // Grab the item's system data as well.
        rollData.item = foundry.utils.deepClone(this.system);
        return rollData;
    }

    //region Item interactions

    /**
     * Toggle the state of the item (could be necessary to be used)
     * @param options
     * @returns {Promise<void>}
     */
    async toggle(options) {
        throw new Error("PL1E | toggle method is not implemented");
    }

    /**
     * Use the item
     * @returns {Promise<void>}
     */
    async activate() {
        throw new Error("PL1E | use method is not implemented");
    }

    /**
     * Apply the item effect after usage
     * @returns {Promise<void>}
     */
    async apply(characterData, targetsData) {
        throw new Error("PL1E | apply method is not implemented");
    }

    /**+
     * Reload the item
     * @returns {Promise<void>}
     */
    async reload(options) {
        throw new Error("PL1E | reload method is not implemented");
    }

    //endregion

}