import {Pl1eEvent} from "../../helpers/events.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {Pl1eJournalPageSheet} from "./journal-page-sheet.mjs";
import {Pl1eFilter} from "../../helpers/filter.mjs";
import {Pl1eTrade} from "../../helpers/trade.mjs";

const FILTER_CATEGORIES = ["weapons", "wearables", "consumables", "commons", "modules", "services"];
const ITEM_TYPES = new Set(["weapon", "wearable", "consumable", "common", "module", "service"]);

export class Pl1eMerchantPageSheet extends Pl1eJournalPageSheet {

    /* -------------------------------------------- */
    /*  Options                                     */
    /* -------------------------------------------- */

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{ dropSelector: ".drop-target" }],
            submitOnChange: true
        });
    }

    /* -------------------------------------------- */
    /*  Flags                                       */
    /* -------------------------------------------- */

    _getEntries() {
        const raw = this.document.getFlag("pl1e", "items");
        return Array.isArray(raw) ? raw : [];
    }

    async _setEntries(entries) {
        await this.document.setFlag("pl1e", "items", entries);
    }

    /* -------------------------------------------- */
    /*  Data                                        */
    /* -------------------------------------------- */

    async getData(options) {
        const context = await super.getData(options);

        context.filters = await Pl1eFilter
            .getFilters(this.document.id, FILTER_CATEGORIES)
            .catch(() => Object.fromEntries(FILTER_CATEGORIES.map(c => [c, new Set()])));

        const entries = this._getEntries();
        const items = await this._buildRuntimeItems(entries);

        await this._decorateItems(items);

        this._runtimeItemsBySourceId = new Map(
            items.map(i => [i.flags.pl1e.sourceId, i])
        );

        context.actor = {
            type: "merchant",
            isOwner: this.document.testUserPermission(
                game.user,
                CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
            ),
            system: {
                favorites: this.document.system?.favorites ?? {}
            }
        };
        context.items = items;
        context.itemNumber = items.length;
        context.merchantPrices = Object.fromEntries(
            items.map(i => [i.flags.pl1e.sourceId, i.flags.pl1e.price])
        );

        for (const category of FILTER_CATEGORIES) {
            const type = category.slice(0, -1);
            const typed = items.filter(i => i.type === type);

            context[category] = Pl1eFilter.filterDocuments(
                typed,
                context.filters[category]
            );
            context[`${category}Count`] = typed.length;
        }

        context.hasAnyItem = FILTER_CATEGORIES.some(c => context[`${c}Count`] > 0);

        return context;
    }

    /* -------------------------------------------- */
    /*  Runtime items                               */
    /* -------------------------------------------- */

    async _buildRuntimeItems(entries) {
        const items = [];

        for (const { sourceId } of entries) {
            if (!sourceId) continue;

            const source = await Pl1eHelpers.getDocument("Item", sourceId);
            if (!source) continue;

            const raw = source.toObject();
            raw._id = foundry.utils.randomID();

            raw.flags ??= {};
            raw.flags.pl1e = {
                sourceId,
                fromMerchant: true
            };

            items.push(new CONFIG.Item.documentClass(raw, { parent: null }));
        }

        return items;
    }

    /* -------------------------------------------- */
    /*  Decoration                                  */
    /* -------------------------------------------- */

    async _decorateItems(items) {
        const buyMultiplier = this.document.system.buyMultiplier ?? 100;

        for (const item of items) {
            if (!ITEM_TYPES.has(item.type)) continue;

            const baseUnits = Pl1eHelpers.moneyToUnits({
                gold: item.system.attributes.goldPrice,
                silver: item.system.attributes.silverPrice,
                copper: item.system.attributes.copperPrice
            });

            const adjusted = Math.round(baseUnits * (buyMultiplier / 100));
            const price = Pl1eHelpers.unitsToMoney(adjusted);

            item.flags.pl1e.price = price;

            item.combinedPassiveAspects = await item.getCombinedPassiveAspects();
            item.combinedActiveAspects  = await item.getCombinedActiveAspects();

            item.enriched = await TextEditor.enrichHTML(
                item.system.description || "",
                { async: true }
            );
        }
    }

    /* -------------------------------------------- */
    /*  Listeners                                   */
    /* -------------------------------------------- */

    async activateListeners(html) {
        await super.activateListeners(html);
        const canInspectItems = !this.document.system?.privateItems;

        // Tooltip
        html.find(".item-tooltip-activate").on("click", ev => {
            ev.preventDefault();
            ev.stopPropagation();

            if (!canInspectItems) {
                ui.notifications.warn(game.i18n.localize("PL1E.PrivateItemsWarning"));
                return;
            }

            Pl1eEvent.onItemTooltip(ev);
        });

        // Open item sheet
        html.find(".item-edit").on("click", ev => {
            ev.preventDefault();
            ev.stopPropagation();

            if (!canInspectItems) {
                ui.notifications.warn(game.i18n.localize("PL1E.PrivateItemsWarning"));
                return;
            }

            Pl1eEvent.onItemEdit(ev, this.document);
        });

        html.find(".item-remove").on("click", async ev => {
            ev.preventDefault();
            ev.stopPropagation();

            const li = ev.currentTarget.closest(".item");
            const sourceId = li?.dataset.sourceId ?? li?.dataset.itemId;
            if (!sourceId) return;

            const next = this._getEntries().filter(e => e.sourceId !== sourceId);
            await this._setEntries(next);
            this.render();
        });

        const filters = await Pl1eFilter.getFilters(this.document.id, FILTER_CATEGORIES);
        html.find(".item-filter-list").each((_, ul) =>
            this._initializeFilterItemList(ul, filters)
        );
        html.find(".item-filter").on("click", this._onToggleFilter.bind(this));

        this._applyMerchantTradeColors(html);
        this._setupDragAndDrop(html);
    }

    /* -------------------------------------------- */
    /*  Drag & Drop                                 */
    /* -------------------------------------------- */

    _setupDragAndDrop(html) {
        html.find(".item").each((_, el) => {
            el.setAttribute("draggable", true);

            el.addEventListener("dragstart", async ev => {
                const sourceId = el.dataset.itemSourceId;
                if (!sourceId) return;

                const source = await Pl1eHelpers.getDocument("Item", sourceId);
                if (!source) return;

                const runtimeItem = this._runtimeItemsBySourceId?.get(sourceId);
                const price = runtimeItem?.flags?.pl1e?.price;

                ev.dataTransfer.setData(
                    "text/plain",
                    JSON.stringify({
                        type: "Item",
                        uuid: source.uuid,
                        flags: {
                            pl1e: {
                                fromMerchant: true,
                                merchantPageId: this.document.id,
                                sourceId: sourceId,
                                price
                            }
                        }
                    })
                );
            });
        });

        html.find(".drop-target")
            .on("dragover", ev => ev.preventDefault())
            .on("drop", async ev => {
                ev.preventDefault();

                const data = this._getDragData(ev);
                if (!data) return;

                if (this._isFolderDrop(data)) {
                    await this._onDropFolder(data);
                    return;
                }

                if (this._isItemDrop(data)) {
                    await this._onDropItem(data);
                }
            });
    }

    _getDragData(ev) {
        try {
            return JSON.parse(
                ev.originalEvent.dataTransfer.getData("text/plain")
            );
        } catch {
            return null;
        }
    }

    _isFolderDrop(data) {
        return data.type === "Folder" || data.documentName === "Folder";
    }

    _isItemDrop(data) {
        return data.type === "Item" && !!data.uuid;
    }

    async _onDropFolder(data) {
        if (!this.document.isOwner) return;

        const folder = await Folder.implementation.fromDropData(data);
        if (!folder || folder.type !== "Item") return;

        let added = false;

        for (const itemData of folder.contents) {
            const item = await Pl1eHelpers.getDocument("Item", itemData._id);
            if (!item) continue;

            await this._addItemToMerchant(item);
            added = true;
        }

        if (added) this.render();
    }

    async _onDropItem(data) {
        const item =
            await fromUuid(data.uuid).catch(() => null)
            ?? await Pl1eHelpers.getDocument("Item", data.uuid);

        if (!item || !ITEM_TYPES.has(item.type)) return;

        if (this._canSellItem(item)) {
            await this._sellItemToMerchant(item);
            return;
        }

        if (!this.document.isOwner) return;

        const added = await this._addItemToMerchant(item);
        if (added) this.render();
    }

    _canSellItem(item) {
        return (
            item.isEmbedded &&
            item.parent?.documentName === "Actor" &&
            (item.parent.isOwner || game.user.isGM)
        );
    }

    async _sellItemToMerchant(item) {
        if (!item?.isEmbedded) return;

        const seller = item.parent;
        if (!seller) return;

        if (!seller.isOwner && !game.user.isGM) return;

        if (!this._merchantAcceptsItem(item)) {
            ui.notifications.warn(game.i18n.localize("PL1E.MerchantRejectsItem"));
            return;
        }

        const sellMultiplier = this.document.system?.sellMultiplier ?? 0;

        await Pl1eTrade.sellItem(
            seller,
            this.document,
            item,
            sellMultiplier
        );
    }

    _merchantAcceptsItem(item) {
        const mode = this.document.system?.buyMode ?? "none";
        const entries = this._getEntries();

        switch (mode) {
            case "none":
                return false;

            case "same-item":
                return entries.some(e => e.sourceId === item.sourceId);

            case "same-type": {
                const soldTypes = new Set();

                for (const { sourceId } of entries) {
                    const sold = this._runtimeItemsBySourceId?.get(sourceId);
                    if (sold) soldTypes.add(sold.type);
                }

                return soldTypes.has(item.type);
            }

            case "all":
                return true;

            default:
                return false;
        }
    }

    async _addItemToMerchant(item) {
        if (!ITEM_TYPES.has(item.type)) return false;

        const entries = this._getEntries();
        if (entries.some(e => e.sourceId === item.id)) return false;

        entries.push({ sourceId: item.id });
        await this._setEntries(entries);
        return true;
    }

    /* -------------------------------------------- */
    /*  UI helpers                                  */
    /* -------------------------------------------- */

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

    _applyMerchantTradeColors(html) {
        const buy = parseFloat(html.find(".trade-rate.buy .value").text());
        const sell = parseFloat(html.find(".trade-rate.sell .value").text());

        if (!Number.isNaN(buy)) {
            html.find(".trade-rate.buy .value").css(
                "color",
                this._getTradeColor(buy, { min: 50, mid: 100, max: 150, invert: true })
            );
        }

        if (!Number.isNaN(sell)) {
            html.find(".trade-rate.sell .value").css(
                "color",
                this._getTradeColor(sell, { min: 0, mid: 50, max: 100 })
            );
        }
    }

    _getTradeColor(value, { min, mid, max, invert = false }) {
        const RED = [255, 0, 0];
        const WHITE = [255, 255, 255];
        const GREEN = [0, 255, 0];

        value = Math.max(min, Math.min(max, value));
        const low = invert ? GREEN : RED;
        const high = invert ? RED : GREEN;

        const lerp = (a, b, t) =>
            a.map((v, i) => Math.round(v + (b[i] - v) * t));

        if (value <= mid) {
            return `rgb(${lerp(low, WHITE, (value - min) / (mid - min)).join(",")})`;
        }
        return `rgb(${lerp(WHITE, high, (value - mid) / (max - mid)).join(",")})`;
    }
}
