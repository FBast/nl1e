import { Pl1eEvent } from "../../helpers/events.mjs";
import { Pl1eHelpers } from "../../helpers/helpers.mjs";
import {Pl1eTrade} from "../../helpers/trade.mjs";
import {Pl1eJournalPageSheet} from "./journal-page-sheet.mjs";
import {Pl1eFilter} from "../../helpers/filter.mjs";

const FILTER_CATEGORIES = ["weapons", "wearables", "consumables", "commons", "modules", "services"];
const ITEM_TYPES = new Set(["weapon", "wearable", "consumable", "common", "module", "service"]);

export class Pl1eMerchantPageSheet extends Pl1eJournalPageSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{ dropSelector: ".drop-target" }],
            submitOnChange: true
        });
    }

    async getData(options) {
        const context = await super.getData(options);

        context.filters = await Pl1eFilter.getFilters(this.document.id, FILTER_CATEGORIES).catch(() => {
            return Object.fromEntries(FILTER_CATEGORIES.map(c => [c, new Set()]));
        });

        const itemsData = foundry.utils.getProperty(this.object, "flags.pl1e.items") || [];
        const items = itemsData.map(data => new CONFIG.Item.documentClass(data, { parent: null }));
        const fakeActor = this._createFakeActor(items);

        await this._decorateItems(fakeActor);

        context.actor = fakeActor;
        context.merchantPrices = fakeActor.system.merchantPrices;
        context.itemNumber = items.length;

        for (const category of FILTER_CATEGORIES) {
            const type = category.slice(0, -1);
            context[category] = Pl1eFilter.filterDocuments(items.filter(i => i.type === type), context.filters[category]);
            context[`${category}Count`] = items.filter(i => i.type === type).length;
        }

        return context;
    }

    async activateListeners(html) {
        await super.activateListeners(html);

        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.document));

        const filters = await Pl1eFilter.getFilters(this.document.id, FILTER_CATEGORIES);
        html.find(".item-filter-list").each((i, ul) => this._initializeFilterItemList(ul, filters));
        html.find(".item-filter").on("click", this._onToggleFilter.bind(this));

        this._setupDragAndDrop(html);
        if (this.document.isOwner) this._setupRemoveListeners(html);
    }

    _initializeFilterItemList(ul, filters) {
        const type = ul.dataset.filter;
        const set = filters[type] ?? new Set();
        ul.querySelectorAll(".item-filter").forEach(li => {
            if (set.has(li.dataset.filter)) li.classList.add("color-disabled");
        });
    }

    async _onToggleFilter(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const type = li.parentElement.dataset.filter;
        const value = li.dataset.filter;

        await toggleFilter(this.document.id, type, value);
        this.document.parent?.sheet?.render(true);
    }

    _createFakeActor(items) {
        return {
            type: "merchant",
            items,
            isOwner: this.document.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER),
            img: "icons/svg/coins.svg",
            system: {
                general: {
                    buyMultiplier: this.object.getFlag("pl1e", "buyMultiplier") ?? 50,
                    sellMultiplier: this.object.getFlag("pl1e", "sellMultiplier") ?? 100
                },
                merchantPrices: {}
            },
            flags: { pl1e: {} }
        };
    }

    async _decorateItems(fakeActor) {
        for (let item of fakeActor.items) {
            if (!ITEM_TYPES.has(item.type)) continue;

            const price = {
                gold: item.system.attributes.goldPrice,
                silver: item.system.attributes.silverPrice,
                copper: item.system.attributes.copperPrice
            };

            const value = Math.round(Pl1eHelpers.moneyToUnits(price) * (fakeActor.system.general.sellMultiplier / 100));
            const adjustedPrice = Pl1eHelpers.unitsToMoney(value);

            fakeActor.system.merchantPrices[item.id] = adjustedPrice;

            item.flags ??= {};
            item.flags.pl1e = {
                ...(item.flags.pl1e ?? {}),
                fromMerchant: true,
                price: adjustedPrice
            };

            item.system.attributes.goldPrice = adjustedPrice.gold ?? 0;
            item.system.attributes.silverPrice = adjustedPrice.silver ?? 0;
            item.system.attributes.copperPrice = adjustedPrice.copper ?? 0;

            item.enriched = await TextEditor.enrichHTML(item.system.description || "", { async: true });
        }
    }

    _setupDragAndDrop(html) {
        html.find(".item").each((i, el) => {
            el.setAttribute("draggable", true);
            el.addEventListener("dragstart", async ev => {
                const itemId = el.dataset.itemId;
                const itemsData = this.object.getFlag("pl1e", "items") || [];
                const itemData = itemsData.find(i => i._id === itemId);
                if (!itemData) return;

                const sellMultiplier = this.object.getFlag("pl1e", "sellMultiplier") ?? 100;
                const price = {
                    gold: itemData.system.attributes.goldPrice,
                    silver: itemData.system.attributes.silverPrice,
                    copper: itemData.system.attributes.copperPrice
                };

                const value = Math.round(Pl1eHelpers.moneyToUnits(price) * (sellMultiplier / 100));
                const adjustedPrice = Pl1eHelpers.unitsToMoney(value);

                const dragData = {
                    type: "Item",
                    itemData,
                    flags: {
                        pl1e: {
                            fromMerchant: true,
                            price: adjustedPrice,
                            merchantPageId: this.document.id
                        }
                    }
                };

                ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
            });
        });

        html.find(".drop-target").on("drop", async event => {
            event.preventDefault();

            const dataTransfer = event.originalEvent?.dataTransfer;
            if (!dataTransfer) return;

            let data;
            try {
                data = JSON.parse(dataTransfer.getData("text/plain"));
            } catch (err) {
                return console.warn("PL1E | Invalid drop:", err);
            }

            const item = await Pl1eHelpers.getDocument("Item", data.sourceId ?? data.uuid);
            const allowedTypes = [...ITEM_TYPES];
            if (data.type !== "Item" || !allowedTypes.includes(item?.type)) return;

            if (this.document.isOwner) {
                //TODO should use the sourceId or uuid to store the item, this way recreating the items keep the modifications of the original
                const existing = this.document.getFlag("pl1e", "items") || [];
                const alreadyExists = existing.some(i => i._id === item.id || (i.name === item.name && i.type === item.type));
                if (!alreadyExists) {
                    existing.push(item.toObject());
                    await this.document.setFlag("pl1e", "items", existing);
                    ui.notifications.info(`${item.name} added to merchant.`);
                    this.render();
                }
            } else if (item?.isEmbedded && item.parent?.documentName === "Actor") {
                const seller = item.parent;
                const buyMultiplier = this.document.getFlag("pl1e", "buyMultiplier") ?? 50;
                await Pl1eTrade.sellItem(seller, this.document, item, buyMultiplier);
            }
        });
    }

    _setupRemoveListeners(html) {
        html.find(".item-remove").on("click", async event => {
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
