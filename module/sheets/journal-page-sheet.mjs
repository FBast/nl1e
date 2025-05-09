import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eTrade} from "../helpers/trade.mjs";

export class Pl1eJournalPageSheet extends JournalPageSheet {

    /** @inheritdoc */
    toc = {};

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{dropSelector: ".drop-target"}],
            submitOnChange: true
        });
    }

    /** @inheritDoc */
    get template() {
        return `systems/pl1e/templates/journal/page-${this.object.type}-${this.isEditable ? "edit" : "view"}.hbs`;
    }

    /** @inheritDoc */
    async getData(options) {
        const context = super.getData(options);
        context.system = context.document.system;

        context.title = Object.fromEntries(
            Array.fromRange(4, 1).map(n => [`level${n}`, context.data.title.level + n - 1])
        );

        if (this.object.type === "merchant") {
            const flags = foundry.utils.getProperty(this.object, "flags.pl1e") || {};
            const itemsData = flags.items || [];

            // Recreate items from flag data
            const items = itemsData.map(data => new CONFIG.Item.documentClass(data, { parent: null }));

            // Build a fake actor compatible with partials
            const fakeActor = {
                type: "merchant",
                items,
                isOwner: true,
                img: "icons/svg/coins.svg",
                system: {
                    general: {
                        buyMultiplier: this.object.getFlag("pl1e", "buyMultiplier") ?? 50,
                        sellMultiplier: this.object.getFlag("pl1e", "sellMultiplier") ?? 100,
                        unlimitedItems: false
                    },
                    merchantPrices: {}
                },
                flags: { pl1e: {} } // Optional, avoids Handlebars errors in some partials
            };

            // Decorate each item for compatibility with partials
            for (let item of fakeActor.items) {
                if (!["weapon", "wearable", "consumable", "common", "module"].includes(item.type)) continue;

                const price = {
                    gold: item.system.attributes.goldPrice,
                    silver: item.system.attributes.silverPrice,
                    copper: item.system.attributes.copperPrice
                };

                const value = Math.round(
                    Pl1eHelpers.moneyToUnits(price) * (fakeActor.system.general.sellMultiplier / 100)
                );

                const adjustedPrice = Pl1eHelpers.unitsToMoney(value);

                fakeActor.system.merchantPrices[item.id] = adjustedPrice;

                item.flags ??= {};
                item.flags.pl1e = {
                    ...(item.flags.pl1e ?? {}),
                    fromMerchant: true,
                    price: adjustedPrice,
                    merchantName: this.document.name
                };

                item.system.attributes.goldPrice = adjustedPrice.gold ?? 0;
                item.system.attributes.silverPrice = adjustedPrice.silver ?? 0;
                item.system.attributes.copperPrice = adjustedPrice.copper ?? 0;

                item.enriched = await TextEditor.enrichHTML(item.system.description || "", { async: true });
            }

            // Inject fake actor into context
            context.actor = fakeActor;
            context.merchantPrices = fakeActor.system.merchantPrices;
            context.weapons = fakeActor.items.filter(i => i.type === "weapon");
            context.wearables = fakeActor.items.filter(i => i.type === "wearable");
            context.consumables = fakeActor.items.filter(i => i.type === "consumable");
            context.commons = fakeActor.items.filter(i => i.type === "common");
            context.modules = fakeActor.items.filter(i => i.type === "module");
        }

        if (context.system.temperature) {
            // Translate temperature value from 1-9 scale to 1%-98% scale
            context.temperaturePercentage = ((context.system.temperature - 1) / (9 - 1)) * (98 - 1) + 1;
        }

        if (context.system.humidity) {
            // Translate water level value from 1-9 scale to 10%-100% scale
            context.humidityPercentage = ((context.system.humidity - 1) / (9 - 1)) * (100 - 10) + 10;
        }

        // Enriched HTML description
        context.enriched = await TextEditor.enrichHTML(context.system.content, {
            secrets: this.document.isOwner,
            async: true,
            relativeTo: this.document
        });

        return context;
    }

    /** @inheritDoc */
    async _renderInner(...args) {
        const html = await super._renderInner(...args);
        this.toc = JournalEntryPage.buildTOC(html.get());
        return html;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.document));

        // Handle custom editor button
        html[0].querySelectorAll(".launch-text-editor").forEach(e => {
            e.addEventListener("click", ev => Pl1eEvent.onLaunchTextEditor(ev, this.document));
        });

        if (this.object.type === "merchant") {
            // DRAG: buy for an actor
            html.find(".item").each((i, el) => {
                el.setAttribute("draggable", true);
                el.addEventListener("dragstart", async ev => {
                    const itemId = el.dataset.itemId;
                    const itemsData = this.object.getFlag("pl1e", "items") || [];
                    const itemData = itemsData.find(i => i._id === itemId);
                    if (!itemData) return;

                    const sellMultiplier = this.object.getFlag("pl1e", "sellMultiplier") ?? 100;
                    const price = {
                        gold: itemData.system?.attributes?.goldPrice ?? 0,
                        silver: itemData.system?.attributes?.silverPrice ?? 0,
                        copper: itemData.system?.attributes?.copperPrice ?? 0
                    };

                    const value = Math.round(Pl1eHelpers.moneyToUnits(price) * (sellMultiplier / 100));
                    const adjustedPrice = Pl1eHelpers.unitsToMoney(value);

                    const dragData = {
                        type: "Item",
                        itemData: itemData,
                        flags: {
                            pl1e: {
                                fromMerchant: true,
                                price: adjustedPrice,
                                merchantName: this.document.name,
                                merchantPageId: this.document.id
                            }
                        }
                    };

                    ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
                });
            });

            // DROP: add if owner or sell
            html.find(".drop-target").on("drop", async (event) => {
                event.preventDefault();

                const dataTransfer = event.originalEvent?.dataTransfer;
                if (!dataTransfer) return;

                let data;
                try {
                    data = JSON.parse(dataTransfer.getData("text/plain"));
                } catch (err) {
                    return console.warn("PL1E | Invalid drop:", err);
                }

                if (data.type !== "Item") return;

                // Sell from actor
                if (data.uuid) {
                    const item = await fromUuid(data.uuid);
                    if (item?.isEmbedded && item.parent?.documentName === "Actor") {
                        const seller = item.parent;
                        const buyMultiplier = this.document.getFlag("pl1e", "buyMultiplier") ?? 50;
                        return await Pl1eTrade.sellItem(seller, item, buyMultiplier);
                    }
                }

                // Drop from owner
                if (!this.document.isOwner) return;

                let itemData = data.itemData;

                if (!itemData && data.uuid) {
                    const item = await fromUuid(data.uuid);
                    if (!item) return;
                    itemData = item.toObject();
                }

                if (!itemData) return;

                const existing = this.document.getFlag("pl1e", "items") || [];
                const alreadyExists = existing.some(i =>
                    i._id === itemData._id || (i.name === itemData.name && i.type === itemData.type)
                );

                if (alreadyExists) {
                    ui.notifications.warn(`${itemData.name} is already in the merchant inventory.`);
                    return;
                }

                existing.push(itemData);
                await this.document.setFlag("pl1e", "items", existing);
                ui.notifications.info(`${itemData.name} added to merchant.`);
                this.render();
            });


            // DELETE: owner only
            if (this.document.isOwner) {
                html.find(".item-remove").on("click", async (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    const li = event.currentTarget.closest(".item");
                    const itemId = li?.dataset.itemId;
                    if (!itemId) return;

                    const currentItems = this.document.getFlag("pl1e", "items") || [];
                    const updatedItems = currentItems.filter(i => i._id !== itemId);

                    await this.document.setFlag("pl1e", "items", updatedItems);
                    ui.notifications.info(game.i18n.localize("PL1E.ItemRemoved"));
                    this.render();
                });
            }
        }
    }
}