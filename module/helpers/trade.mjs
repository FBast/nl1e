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
        const overallPrice = item.system.attributes.price.value * (1 + targetActor.system.sellMultiplicator / 100);
        const currencyPrice = HelpersPl1e.valueToCurrencies(overallPrice);
        await sourceActor.update({
            ["system.currencies.gold.value"]: sourceActor.system.currencies.gold.value + currencyPrice.gold,
            ["system.currencies.silver.value"]: sourceActor.system.currencies.silver.value + currencyPrice.silver,
            ["system.currencies.copper.value"]: sourceActor.system.currencies.copper.value + currencyPrice.copper,
        });
        sourceActor.render(false);
        // Send message for historic
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: sourceActor}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("PL1E.ChatFlavorSelling"),
            content: item.name + game.i18n.localize("PL1E.SoldFor")
                + currencyPrice.gold + game.i18n.localize("PL1E.Gold")
                + currencyPrice.silver + game.i18n.localize("PL1E.Silver")
                + currencyPrice.copper + game.i18n.localize("PL1E.Copper")
        });
    }

    static async buyItem(item, merchantActor) {
        console.log(item);
        const priceMultiplicator = 1 + merchantActor.system.buyMultiplicator / 100;
        let price = Math.round(item.system.attributes.price.value * priceMultiplicator);
        let totalCurrency = game.user.character.system.attributes.totalCurrency;
        if (totalCurrency < price) return;
        totalCurrency -= price;
        const currency = HelpersPl1e.valueToCurrencies(totalCurrency);
        await game.user.character.update({
            ["system.currencies.gold.value"]: currency.gold,
            ["system.currencies.silver.value"]: currency.silver,
            ["system.currencies.copper.value"]: currency.copper,
        })
        // Send message for historic
        price = HelpersPl1e.valueToCurrencies(price);
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor: game.user.character}),
            rollMode: game.settings.get('core', 'rollMode'),
            flavor: game.i18n.localize("PL1E.ChatFlavorPurchasing"),
            content: item.name + game.i18n.localize("PL1E.ChatBoughtFor")
                + price.gold + game.i18n.localize("PL1E.ChatGold")
                + price.silver + game.i18n.localize("PL1E.ChatSilver")
                + price.copper + game.i18n.localize("PL1E.ChatCopper")
        });
        await game.user.character.createEmbeddedDocuments("Item", [item]);
        merchantActor.sheet.render(false);
    }

}