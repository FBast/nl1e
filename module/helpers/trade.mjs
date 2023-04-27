import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eChat} from "./chat.mjs";

export class Pl1eTrade {

    /**
     * Give an item to another player
     * @param {Pl1eActor} sourceActor
     * @param {Pl1eActor} targetActor
     * @param {Pl1eItem} item
     */
    static async giftItem(sourceActor, targetActor, item) {
        await targetActor.addItem(item);
        await sourceActor.deleteItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, sourceActor, targetActor, "gift");
    }

    /**
     * Sell an item to a merchant
     * @param {Pl1eActor} sellerActor
     * @param {Pl1eActor} buyerActor
     * @param {Pl1eItem} item
     */
    static async sellItem(sellerActor, buyerActor, item) {
        const priceUnits = Pl1eHelpers.moneyToUnits(item.system.price) * (1 + buyerActor.system.general.sellModifier / 100);
        const priceMoney = Pl1eHelpers.unitsToMoney(priceUnits);
        await sellerActor.update({
            ["system.money.gold"]: sellerActor.system.money.gold + priceMoney.gold,
            ["system.money.silver"]: sellerActor.system.money.silver + priceMoney.silver,
            ["system.money.copper"]: sellerActor.system.money.copper + priceMoney.copper,
        });
        await buyerActor.addItem(item);
        await sellerActor.deleteItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, sellerActor, buyerActor, "sale", priceMoney);
    }

    /**
     * Buy an item from a merchant
     * @param {Pl1eActor} buyerActor
     * @param {Pl1eActor} sellerActor
     * @param {Pl1eItem} item
     */
    static async buyItem(buyerActor, sellerActor, item) {
        let priceMoney = sellerActor.system.merchantPrices[item.id];
        let priceUnits = Pl1eHelpers.moneyToUnits(priceMoney);
        let units = Pl1eHelpers.moneyToUnits(buyerActor.system.money);
        if (units < priceUnits) return;
        units -= priceUnits;
        const money = Pl1eHelpers.unitsToMoney(units);
        await buyerActor.update({
            ["system.money.gold"]: money.gold,
            ["system.money.silver"]: money.silver,
            ["system.money.copper"]: money.copper,
        })
        await buyerActor.addItem(item);
        await sellerActor.deleteItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, buyerActor, sellerActor, "purchase", priceMoney);
    }

}