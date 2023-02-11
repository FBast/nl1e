import {HelpersPl1e} from "./helpers.js";

export class TradePL1E {

    static async giftItem(item, sourceActor, targetActor) {
        if (targetActor.type === 'character') {
            await targetActor.createEmbeddedDocuments("Item", [item]);
            // Send message for historic
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: sourceActor}),
                rollMode: game.settings.get('core', 'rollMode'),
                flavor: game.i18n.localize("PL1E.ChatFlavorGift"),
                content: item.name + game.i18n.localize("PL1E.ChatGivenTo") + targetActor.name
            });
        }
        // Or sell item
        if (targetActor.type === 'merchant') {
            await TradePL1E.sellItem(item, sourceActor, targetActor);
        }
        // Delete source item
        sourceActor = game.actors.get(sourceActor._id);
        item = sourceActor.items.find(element => element._id === item._id);
        await item.delete();
    }

    static async sellItem(item, sourceActor, targetActor) {
        const priceUnits = item.system.attributes.price.value * (1 + targetActor.system.sellMultiplicator / 100);
        const priceCurrency = HelpersPl1e.unitsToCurrency(priceUnits);
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
            flavor: game.i18n.localize("PL1E.ChatFlavorSelling"),
            content: item.name + game.i18n.localize("PL1E.SoldFor")
                + priceCurrency.gold.value + game.i18n.localize("PL1E.Gold")
                + priceCurrency.silver.value + game.i18n.localize("PL1E.Silver")
                + priceCurrency.copper.value + game.i18n.localize("PL1E.Copper")
        });
    }

    static async buyItem(item, buyerActor, merchantActor) {
        let priceCurrency = merchantActor.system.merchantPrices[item._id];
        let priceUnits = HelpersPl1e.currencyToUnits(priceCurrency);
        let units = HelpersPl1e.currencyToUnits(buyerActor.system.currency);
        if (units < priceUnits) return;
        units -= priceUnits;
        const currency = HelpersPl1e.unitsToCurrency(units);
        await buyerActor.update({
            ["system.money.gold.value"]: currency.gold.value,
            ["system.money.silver.value"]: currency.silver.value,
            ["system.money.copper.value"]: currency.copper.value,
        })
        // Send message for historic
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: buyerActor}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("PL1E.ChatFlavorPurchasing"),
            content: item.name + game.i18n.localize("PL1E.ChatBoughtFor")
                + priceCurrency.gold.value + game.i18n.localize("PL1E.ChatGold")
                + priceCurrency.silver.value + game.i18n.localize("PL1E.ChatSilver")
                + priceCurrency.copper.value + game.i18n.localize("PL1E.ChatCopper")
        });
        await buyerActor.createEmbeddedDocuments("Item", [item]);
    }

}