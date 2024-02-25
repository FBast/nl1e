import {Pl1eActor} from "./actor.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";

export class Pl1eMerchant extends Pl1eActor {

    /** @inheritDoc */
    async prepareData() {
        super.prepareData();

    }

    /** @inheritDoc */
    async prepareBaseData() {
        super.prepareBaseData();

    }

    /** @inheritDoc */
    async prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();
        const systemData = this.system;

        // Add merchant prices
        systemData.merchantPrices = {};
        for (let item of this.items) {
            if (!["weapon", "wearable", "consumable", "common", "module"].includes(item.type)) continue;
            const price = {
                gold: item.system.attributes.goldPrice,
                silver: item.system.attributes.silverPrice,
                copper: item.system.attributes.copperPrice
            }
            let value = Math.round(Pl1eHelpers.moneyToUnits(price) * (systemData.general.buyMultiplier / 100));
            systemData.merchantPrices[item._id] = Pl1eHelpers.unitsToMoney(value);
        }
    }

    /** @inheritDoc */
    async prepareDerivedData() {
        super.prepareDerivedData();

    }

}