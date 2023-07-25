import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eChat} from "./chat.mjs";

export class Pl1eTrade {

    /**
     * Send item from sourceActor to target targetActor
     * @param {string} sourceActorId the source actor
     * @param {string} targetActorId the target actor
     * @param {string} itemId the send item
     */
    static async sendItem(sourceActorId, targetActorId, itemId) {
        // Object are loose in transit, so we need to get them from this client using id
        const sourceActor = game.actors.get(sourceActorId);
        const targetActor = game.actors.get(targetActorId);
        const item = sourceActor.items.get(itemId);

        if (sourceActor.type === "character" && targetActor.type === "character") {
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
     * Send item from sourceActor to target targetActor
     * @param {string} sourceActorId the source actor
     * @param {string} targetActorId the target actor
     * @param {string} folderId the send folder
     */
    static async sendContenant(sourceActorId, targetActorId, folderId) {
        // if (game.user.isGM) {
        //     const actor = data.message.speaker.actor;
        //     const combatant.mjs = game.combat.data.combatants.find(c => c.actor.id === actor);
        //     const update = {
        //         id: combatant.mjs.id,
        //         initiative: data.update.content
        //     }
        //     await combatant.mjs.update(update);
        // }
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
        const priceUnits = Pl1eHelpers.moneyToUnits(item.system.price) * (buyerActor.system.general.sellMultiplier / 100);
        const priceMoney = Pl1eHelpers.unitsToMoney(priceUnits);
        await sellerActor.update({
            ["system.money.gold"]: sellerActor.system.money.gold + priceMoney.gold,
            ["system.money.silver"]: sellerActor.system.money.silver + priceMoney.silver,
            ["system.money.copper"]: sellerActor.system.money.copper + priceMoney.copper,
        });
        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);
        if (!buyerActor.system.general.unlimitedItems) await buyerActor.addItem(originalItem);
        await sellerActor.removeItem(item);
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
        });
        //TODO item.sourceId is null, it seems that merchant item dooes not have sourceId
        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);
        await buyerActor.addItem(originalItem);
        if (!sellerActor.system.general.unlimitedItems) await sellerActor.removeItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, buyerActor, sellerActor, "purchase", priceMoney);
    }

}