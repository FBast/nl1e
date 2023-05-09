import {Pl1eActor} from "../actor.mjs";
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
            let value = Pl1eHelpers.moneyToUnits(item.system.price);
            value += Math.round(value * (systemData.general.buyModifier / 100));
            systemData.merchantPrices[item._id] = Pl1eHelpers.unitsToMoney(value);
        }
    }

    /** @inheritDoc */
    prepareDerivedData() {
        super.prepareDerivedData();

    }

}