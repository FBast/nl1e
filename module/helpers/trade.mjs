import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eChatMessage} from "../documents/chat-message.mjs";

export const Pl1eTrade = {
    /**
     * Give an item to another player
     * @param {Pl1eActor} sourceActor
     * @param {Pl1eActor} targetActor
     * @param {Pl1eItem} item
     */
    async giftItem(sourceActor, targetActor, item) {
        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId);
        await targetActor.addItem(originalItem);
        await sourceActor.removeItem(item);

        // Send message for historic
        await Pl1eChatMessage.tradeMessage(item, sourceActor, targetActor, "gift");
    },

    /**
     * Sell an item to a merchant (journal)
     * @param {Pl1eActor} sellerActor - The actor selling the item
     * @param {Pl1eJournalPageSheet} buyerJournal - The merchant buying the item
     * @param {Pl1eItem} item - The item being sold
     * @param {number} buyMultiplier - The merchant's buy multiplier (e.g. 50)
     */
    async sellItem(sellerActor, buyerJournal, item, buyMultiplier) {
        if (!this._canMerchantBuyItem(buyerJournal, item)) {
            ui.notifications.warn(game.i18n.localize("PL1E.MerchantRestrictBuySameItem"));
            return;
        }

        const price = {
            gold: item.system.attributes.goldPrice,
            silver: item.system.attributes.silverPrice,
            copper: item.system.attributes.copperPrice
        };

        const priceUnits = Math.floor(
            Pl1eHelpers.moneyToUnits(price) * (buyMultiplier / 100)
        );
        const priceMoney = Pl1eHelpers.unitsToMoney(priceUnits);

        await sellerActor.update({
            "system.money.gold": sellerActor.system.money.gold + priceMoney.gold,
            "system.money.silver": sellerActor.system.money.silver + priceMoney.silver,
            "system.money.copper": sellerActor.system.money.copper + priceMoney.copper
        });

        await sellerActor.removeItem(item);
        await Pl1eChatMessage.tradeMessage(item, sellerActor, buyerJournal, "sale", priceMoney);
    },

    _canMerchantBuyItem(merchantPage, item) {
        if (!merchantPage.system.restrictBuySameItem) return true;
        if (!item.sourceId) return false;

        const sourceItemId = item.sourceId.split(".").pop();
        const merchantItems = merchantPage.getFlag("pl1e", "items") || [];

        return merchantItems.some(e => e._id === sourceItemId);
    },

    /**
     * Buy an item from a merchant (journal-based, no source actor)
     * @param {Pl1eActor} buyerActor
     * @param {JournalEntryPage} sellerJournal
     * @param {Pl1eItem} item
     */
    async buyItem(buyerActor, sellerJournal, item) {
        // Hunger check
        const isService = item.type === "service";
        const isFood = item.system.attributes.serviceType === "food";
        const hungerReduction = item.system.attributes.hungerReduction ?? 0;

        if (isService && isFood && hungerReduction > 0) {
            const currentHunger = buyerActor.system.misc.hunger ?? 0;
            if ((currentHunger - hungerReduction) < 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.TooMuchFood"));
                return;
            }
        }

        // Price check
        const price = foundry.utils.getProperty(item, "flags.pl1e.price");
        if (price) {
            const priceUnits = Pl1eHelpers.moneyToUnits(price);
            const currentUnits = Pl1eHelpers.moneyToUnits(buyerActor.system.money);

            if (currentUnits < priceUnits) {
                ui.notifications.warn(game.i18n.localize("PL1E.NotEnoughMoney"));
                return;
            }

            const remainingUnits = currentUnits - priceUnits;
            const money = Pl1eHelpers.unitsToMoney(remainingUnits);

            await buyerActor.update({
                "system.money.gold": money.gold,
                "system.money.silver": money.silver,
                "system.money.copper": money.copper,
            });
        }

        const originalItem = await Pl1eHelpers.getDocument("Item", item.sourceId ?? item.id);

        await buyerActor.addItem(originalItem);
        await Pl1eChatMessage.tradeMessage(originalItem, sellerJournal, buyerActor, "purchase", price);
    }
}