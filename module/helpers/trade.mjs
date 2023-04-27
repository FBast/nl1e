import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eChat} from "./chat.mjs";

export class Pl1eTrade {

    static async giftItem(item, sourceActor, targetActor) {
        await targetActor.addItem(item);
        await sourceActor.deleteItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, sourceActor, targetActor, "gift");
    }

    static async sellItem(item, sourceActor, targetActor) {
        const priceUnits = Pl1eHelpers.moneyToUnits(item.system.price) * (1 + targetActor.system.general.sellModifier / 100);
        const priceMoney = Pl1eHelpers.unitsToMoney(priceUnits);
        await sourceActor.update({
            ["system.money.gold"]: sourceActor.system.money.gold + priceMoney.gold,
            ["system.money.silver"]: sourceActor.system.money.silver + priceMoney.silver,
            ["system.money.copper"]: sourceActor.system.money.copper + priceMoney.copper,
        });
        await targetActor.addItem(item);
        await sourceActor.deleteItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, sourceActor, targetActor, "sale", priceMoney);
    }

    static async buyItem(item, sourceActor, targetActor) {
        let priceMoney = targetActor.system.merchantPrices[item._id];
        let priceUnits = Pl1eHelpers.moneyToUnits(priceMoney);
        let units = Pl1eHelpers.moneyToUnits(sourceActor.system.money);
        if (units < priceUnits) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughMoney"));
            return;
        }
        units -= priceUnits;
        const money = Pl1eHelpers.unitsToMoney(units);
        await sourceActor.update({
            ["system.money.gold"]: money.gold,
            ["system.money.silver"]: money.silver,
            ["system.money.copper"]: money.copper,
        })
        await sourceActor.addItem(item);
        await targetActor.deleteItem(item);
        // Send message for historic
        await Pl1eChat.tradeMessage(item, sourceActor, targetActor, "purchase", priceMoney);
    }

}