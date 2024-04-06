import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eChat} from "./chat.mjs";

export class Pl1eTrade {

    /**
     * Send item from sourceActor to target targetActor
     * @param {string} sourceActorUuid the source actor uuid
     * @param {string} targetActorUuid the target actor uuid
     * @param {string} itemId the send item id
     */
    static async sendItem(sourceActorUuid, targetActorUuid, itemId) {
        // Object are loose in transit, so we need to get them from this client using id
        const sourceActor = await fromUuid(sourceActorUuid);
        const targetActor = await fromUuid(targetActorUuid);
        const item = sourceActor.items.get(itemId);

        if (sourceActor.type !== "merchant" && targetActor.type !== "merchant") {
            await Pl1eTrade.giftItem(sourceActor, targetActor, item);
        }
        else if (targetActor.type === "merchant") {
            await Pl1eTrade.sellItem(sourceActor, targetActor, item);
        }
        else if (sourceActor.type === "merchant") {
            await Pl1eTrade.buyItem(targetActor, sourceActor, item);
        }
    }

    /**
     * Give an item to another player
     * @param {Pl1eActor} sourceActor
     * @param {Pl1eActor} targetActor
     * @param {Pl1eItem} item
     */
    static async giftItem(sourceActor, targetActor, item) {
        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);
        await targetActor.addItem(originalItem);
        await sourceActor.removeItem(item);

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
        const price = {
            gold: item.system.attributes.goldPrice,
            silver: item.system.attributes.silverPrice,
            copper: item.system.attributes.copperPrice
        }
        const priceUnits = Pl1eHelpers.moneyToUnits(price) * (buyerActor.system.general.buyMultiplier / 100);
        const priceMoney = Pl1eHelpers.unitsToMoney(priceUnits);
        await sellerActor.update({
            ["system.money.gold"]: sellerActor.system.money.gold + priceMoney.gold,
            ["system.money.silver"]: sellerActor.system.money.silver + priceMoney.silver,
            ["system.money.copper"]: sellerActor.system.money.copper + priceMoney.copper,
        });

        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);

        // Check sell validation
        if (!originalItem.isValidForActor(buyerActor)) return;

        // Do not add the item if unlimited
        if (!buyerActor.system.general.unlimitedItems) await buyerActor.addItem(originalItem);

        // Process with the transaction
        await sellerActor.removeItem(item);

        // Send message for historic
        if (buyerActor.system.general.buyMultiplier === 0)
            await Pl1eChat.tradeMessage(item, sellerActor, buyerActor, "gift");
        else
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
        if (priceMoney) {
            let priceUnits = Pl1eHelpers.moneyToUnits(priceMoney);
            let units = Pl1eHelpers.moneyToUnits(buyerActor.system.money);
            if (units < priceUnits) return;
            units -= priceUnits;
            const money = Pl1eHelpers.unitsToMoney(units);
            await buyerActor.update({
                ["system.money.gold"]: money.gold,
                ["system.money.silver"]: money.silver,
                ["system.money.copper"]: money.copper,
            });
        }

        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);

        // Check buy validation
        if (!originalItem.isValidForActor(buyerActor)) return;

        // Process with transaction
        await buyerActor.addItem(originalItem);

        // Do not remove the item if unlimited
        if (!sellerActor.system.general.unlimitedItems) await sellerActor.removeItem(item);

        // Send message for historic
        if (!priceMoney || sellerActor.system.general.sellMultiplier === 0)
            await Pl1eChat.tradeMessage(item, sellerActor, buyerActor, "take");
        else
            await Pl1eChat.tradeMessage(item, buyerActor, sellerActor, "purchase", priceMoney);
    }

}