export class Pl1eItem extends Item {

    get isOriginal() {
        const sourceId = this.getFlag('core', 'sourceId');
        return !sourceId || sourceId === this.uuid;
    }

    /** @override */
    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);
        const updateData = {};
        if (data.img === undefined) {
            const img = CONFIG.PL1E.defaultIcons[data.type];
            if (img) updateData['img'] = img;
        }
        if (data.name.includes("New Item")) {
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (name) updateData['name'] = name;
        }
        await this.updateSource(updateData);
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    async prepareData() {
        // As with the actor class, subItems are documents that can have their data
        super.prepareData();

        // Prepare refItems
        if (this.system.refItemsUuids) {
            this.system.refItemsUuids = Object.values(this.system.refItemsUuids);
            for (let i = 0; i < this.system.refItemsUuids.length; i++) {
                const uuid = this.system.refItemsUuids[i];
                let originalItem = game.items.find(item => item.uuid === uuid);
                // Item does not exist then remove from the arrays
                if (!originalItem) {
                    this.system.refItemsUuids.splice(i, 1);
                    await this.update({
                        "system.refItemsUuids": this.system.refItemsUuids
                    });
                    i--;
                }
            }
        }
    }



}
