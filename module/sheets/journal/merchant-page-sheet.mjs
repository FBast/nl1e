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

        context.hasAnyItem = FILTER_CATEGORIES.some(category => {
            return context[`${category}Count`] > 0;
        });

        return context;
    }

    async activateListeners(html) {
        await super.activateListeners(html);

        const tooltipButtons = html.find(".item-tooltip-activate");
        const editButtons = html.find(".item-edit");

        // Sécurité : on enlève tout binding existant
        tooltipButtons.off("click");
        editButtons.off("click");

        if (this.document.system.disableItemTooltip) {

            const warnDisabled = ev => {
                ev.preventDefault();
                ev.stopPropagation();
                ui.notifications.warn(
                    game.i18n.localize("PL1E.ItemTooltipDisabled")
                );
            };

            tooltipButtons.on("click", warnDisabled);
            editButtons.on("click", warnDisabled);

        } else {
            tooltipButtons.on("click", ev => Pl1eEvent.onItemTooltip(ev));
            editButtons.on("click", ev => Pl1eEvent.onItemEdit(ev, this.document));
        }

        const filters = await Pl1eFilter.getFilters(this.document.id, FILTER_CATEGORIES);
        html.find(".item-filter-list").each((i, ul) =>
            this._initializeFilterItemList(ul, filters)
        );
        html.find(".item-filter").on("click", this._onToggleFilter.bind(this));

        this._applyMerchantTradeColors(html);
        this._setupDragAndDrop(html);
        if (this.document.isOwner) this._setupRemoveListeners(html);
    }

    /**
     * Apply trade colors to merchant bar
     */
    _applyMerchantTradeColors(html) {

        const buyValue  = parseFloat(html.find(".trade-rate.buy .value").text());
        const sellValue = parseFloat(html.find(".trade-rate.sell .value").text());

        if (!Number.isNaN(buyValue)) {
            const color = this._getTradeColor(buyValue, {
                min: 50,
                mid: 100,
                max: 150,
                invert: true   // BUY = plus bas = mieux
            });
            html.find(".trade-rate.buy .value").css("color", color);
        }

        if (!Number.isNaN(sellValue)) {
            const color = this._getTradeColor(sellValue, {
                min: 0,
                mid: 50,
                max: 100,
                invert: false  // SELL = plus haut = mieux
            });
            html.find(".trade-rate.sell .value").css("color", color);
        }
    }

    /**
     * Linearly interpolate between two colors
     */
    _lerpColor(a, b, t) {
        return a.map((v, i) => Math.round(v + (b[i] - v) * t));
    }

    /**
     * Compute trade color (red ↔ white ↔ green)
     */
    _getTradeColor(value, { min, mid, max, invert = false }) {

        const RED   = [255, 0, 0];
        const WHITE = [255, 255, 255];
        const GREEN = [0, 255, 0];

        // Clamp
        value = Math.max(min, Math.min(max, value));

        const low  = invert ? GREEN : RED;
        const high = invert ? RED   : GREEN;

        if (value <= mid) {
            const t = (value - min) / (mid - min);
            return `rgb(${this._lerpColor(low, WHITE, t).join(",")})`;
        } else {
            const t = (value - mid) / (max - mid);
            return `rgb(${this._lerpColor(WHITE, high, t).join(",")})`;
        }
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

        await Pl1eFilter.toggleFilter(this.document.id, type, value);
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
                    sellMultiplier: this.object.system.sellMultiplier ?? 100,
                    buyMultiplier: this.object.system.buyMultiplier ?? 50
                },
                merchantPrices: {}
            },
            flags: { pl1e: {} }
        };
    }

    async _decorateItems(fakeActor) {
        const prices = {};

        for (let item of fakeActor.items) {
            if (!ITEM_TYPES.has(item.type)) continue;

            const price = {
                gold: item.system.attributes.goldPrice,
                silver: item.system.attributes.silverPrice,
                copper: item.system.attributes.copperPrice
            };

            const value = Math.round(Pl1eHelpers.moneyToUnits(price) * (fakeActor.system.general.buyMultiplier / 100));
            const adjustedPrice = Pl1eHelpers.unitsToMoney(value);

            fakeActor.system.merchantPrices[item.id] = adjustedPrice;

            item.flags ??= {};
            item.flags.pl1e = {
                ...(item.flags.pl1e ?? {}),
                fromMerchant: true,
                price: adjustedPrice,
            };

            item.system.attributes.goldPrice = adjustedPrice.gold ?? 0;
            item.system.attributes.silverPrice = adjustedPrice.silver ?? 0;
            item.system.attributes.copperPrice = adjustedPrice.copper ?? 0;

            item.enriched = await TextEditor.enrichHTML(item.system.description || "", { async: true });
            prices[item.id] = adjustedPrice;
        }

        await this.document.setFlag("pl1e", "prices", prices);
    }

    _setupDragAndDrop(html) {
        html.find(".item").each((i, el) => {
            el.setAttribute("draggable", true);
            el.addEventListener("dragstart", ev => {
                ev.stopPropagation()

                const itemId = el.dataset.itemId;
                const itemsData = this.object.getFlag("pl1e", "items") || [];
                const itemData = itemsData.find(i => i._id === itemId);
                if (!itemData) return;

                const prices = this.document.getFlag("pl1e", "prices") || {};
                const price = prices[itemId];

                const dragData = {
                    type: "Item",
                    itemData,
                    flags: {
                        pl1e: {
                            fromMerchant: true,
                            price: price,
                            merchantPageId: this.document.id
                        }
                    }
                };

                ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
            });
        });

        html.find(".drop-target")
            .on("dragenter", ev => {
                ev.preventDefault();
                ev.currentTarget.classList.add("drop-ready");
            })
            .on("dragover", ev => {
                ev.preventDefault(); // OBLIGATOIRE pour autoriser le drop
            })
            .on("dragleave", ev => {
                ev.currentTarget.classList.remove("drop-ready");
            })
            .on("drop", async event => {
                event.preventDefault();
                event.currentTarget.classList.remove("drop-ready");

                const dataTransfer = event.originalEvent?.dataTransfer;
                if (!dataTransfer) return;

                let data;
                try {
                    data = JSON.parse(dataTransfer.getData("text/plain"));
                } catch (err) {
                    return console.warn("PL1E | Invalid drop:", err);
                }

                const item = await fromUuid(data.uuid);
                const allowedTypes = [...ITEM_TYPES];
                if (data.type !== "Item" || !allowedTypes.includes(item?.type)) return;

                if (item?.isEmbedded && item.parent?.documentName === "Actor") {
                    const seller = item.parent;
                    const sellMultiplier = this.object.system.sellMultiplier;
                    await Pl1eTrade.sellItem(seller, this.document, item, sellMultiplier);
                }
                else if (this.document.isOwner) {
                    const item = await Pl1eHelpers.getDocument("Item", data.uuid);
                    const existing = this.document.getFlag("pl1e", "items") || [];

                    // const alreadyExists = existing.some(
                    //     i => i._id === item.id || (i.name === item.name && i.type === item.type)
                    // );
                    const alreadyExists = existing.some(
                        i => i.flags?.pl1e?.sourceId === item.id
                    );

                    if (!alreadyExists) {
                        const raw = item.toObject();

                        raw._id = foundry.utils.randomID();
                        raw.flags ??= {};
                        raw.flags.pl1e ??= {};
                        raw.flags.pl1e.sourceId = item.id;
                        raw.flags.pl1e.fromMerchant = true;

                        existing.push(raw);

                        await this.document.setFlag("pl1e", "items", existing);
                        ui.notifications.info(`${item.name} added to merchant.`);
                        this.render();
                    }
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
