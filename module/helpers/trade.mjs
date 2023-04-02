import {Pl1eHelpers} from "./helpers.mjs";

export class Pl1eTrade {

    static async giftItem(item, sourceActor, targetActor) {
        if (targetActor.type === 'character') {
            await targetActor.createEmbeddedDocuments("Item", [item]);
            // Send message for historic
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: sourceActor}),
                rollMode: game.settings.get('core', 'rollMode'),
                flavor: game.i18n.localize("PL1E.FlavorGift"),
                content: item.name + game.i18n.localize("PL1E.GivenTo") + targetActor.name
            });
        }
        // Or sell item
        if (targetActor.type === 'merchant') {
            await Pl1eTrade.sellItem(item, sourceActor, targetActor);
        }
        // Delete source item
        sourceActor = game.actors.get(sourceActor._id);
        item = sourceActor.items.find(element => element._id === item._id);
        await item.delete();
    }

    static async sellItem(item, sourceActor, targetActor) {
        const priceUnits = Pl1eHelpers.moneyToUnits(item.system.price) * (1 + targetActor.system.misc.sellMultiplicator / 100);
        const priceMoney = Pl1eHelpers.unitsToMoney(priceUnits);
        await sourceActor.update({
            ["system.money.gold.value"]: sourceActor.system.money.gold.value + priceMoney.gold.value,
            ["system.money.silver.value"]: sourceActor.system.money.silver.value + priceMoney.silver.value,
            ["system.money.copper.value"]: sourceActor.system.money.copper.value + priceMoney.copper.value,
        });
        sourceActor.render(sourceActor.rendered);
        // Send message for historic
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: sourceActor}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("PL1E.FlavorSelling"),
            content: item.name + game.i18n.localize("PL1E.SoldFor")
                + priceMoney.gold.value + game.i18n.localize("PL1E.Gold")
                + priceMoney.silver.value + game.i18n.localize("PL1E.Silver")
                + priceMoney.copper.value + game.i18n.localize("PL1E.Copper")
        });
    }

    static async buyItem(item, buyerActor, merchantActor) {
        let priceMoney = merchantActor.system.merchantPrices[item._id];
        let priceUnits = Pl1eHelpers.moneyToUnits(priceMoney);
        let units = Pl1eHelpers.moneyToUnits(buyerActor.system.money);
        if (units < priceUnits) return;
        units -= priceUnits;
        const money = Pl1eHelpers.unitsToMoney(units);
        await buyerActor.update({
            ["system.money.gold.value"]: money.gold.value,
            ["system.money.silver.value"]: money.silver.value,
            ["system.money.copper.value"]: money.copper.value,
        })
        buyerActor.render(buyerActor.rendered);
        // Send message for historic
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: buyerActor}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("PL1E.FlavorPurchasing"),
            content: item.name + game.i18n.localize("PL1E.BoughtFor")
                + priceMoney.gold.value + game.i18n.localize("PL1E.Gold")
                + priceMoney.silver.value + game.i18n.localize("PL1E.Silver")
                + priceMoney.copper.value + game.i18n.localize("PL1E.Copper")
        });
        await buyerActor.createEmbeddedDocuments("Item", [item]);
    }

}