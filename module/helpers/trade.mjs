import {Pl1eHelpers} from "./helpers.js";

export class Pl1eTrade {

    static async giftItem(item, sourceActor, targetActor) {
        if (targetActor.type === 'character') {
            await targetActor.createEmbeddedDocuments("Item", [item]);
            // Send message for historic
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: sourceActor}),
                rollMode: game.settings.get('core', 'rollMode'),
                flavor: game.i18n.localize("CHAT.FlavorGift"),
                content: item.name + game.i18n.localize("CHAT.GivenTo") + targetActor.name
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
        const priceUnits = item.system.attributes.price.value * (1 + targetActor.system.sellMultiplicator / 100);
        const priceCurrency = Pl1eHelpers.unitsToCurrency(priceUnits);
        await sourceActor.update({
            ["system.money.gold.value"]: sourceActor.system.money.gold.value + priceCurrency.gold.value,
            ["system.money.silver.value"]: sourceActor.system.money.silver.value + priceCurrency.silver.value,
            ["system.money.copper.value"]: sourceActor.system.money.copper.value + priceCurrency.copper.value,
        });
        sourceActor.render(false);
        // Send message for historic
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: sourceActor}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("CHAT.FlavorSelling"),
            content: item.name + game.i18n.localize("PL1E.SoldFor")
                + priceCurrency.gold.value + game.i18n.localize("PL1E.Gold")
                + priceCurrency.silver.value + game.i18n.localize("PL1E.Silver")
                + priceCurrency.copper.value + game.i18n.localize("PL1E.Copper")
        });
    }

    static async buyItem(item, buyerActor, merchantActor) {
        let priceCurrency = merchantActor.system.merchantPrices[item._id];
        let priceUnits = Pl1eHelpers.currencyToUnits(priceCurrency);
        let units = Pl1eHelpers.currencyToUnits(buyerActor.system.currency);
        if (units < priceUnits) return;
        units -= priceUnits;
        const currency = Pl1eHelpers.unitsToCurrency(units);
        await buyerActor.update({
            ["system.money.gold.value"]: currency.gold.value,
            ["system.money.silver.value"]: currency.silver.value,
            ["system.money.copper.value"]: currency.copper.value,
        })
        // Send message for historic
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: buyerActor}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("CHAT.FlavorPurchasing"),
            content: item.name + game.i18n.localize("CHAT.BoughtFor")
                + priceCurrency.gold.value + game.i18n.localize("CHAT.Gold")
                + priceCurrency.silver.value + game.i18n.localize("CHAT.Silver")
                + priceCurrency.copper.value + game.i18n.localize("CHAT.Copper")
        });
        await buyerActor.createEmbeddedDocuments("Item", [item]);
    }

}