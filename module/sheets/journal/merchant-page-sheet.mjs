import {Pl1eEvent} from "../../helpers/events.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {Pl1eJournalPageSheet} from "./journal-page-sheet.mjs";
import {Pl1eFilter} from "../../helpers/filter.mjs";

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

        html.find(".item-tooltip-activate")
            .on("click", ev => Pl1eEvent.onItemTooltip(ev));

        html.find(".item-edit")
            .on("click", ev => Pl1eEvent.onItemEdit(ev, this.document));

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
                const sourceId = el.dataset.sourceId ?? el.dataset.itemId;
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
                                sourceId: source.id,
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

                let data;
                try {
                    data = JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain"));
                } catch {
                    return;
                }

                if (data.type !== "Item" || !data.uuid) return;

                const source =
                    await fromUuid(data.uuid).catch(() => null)
                    ?? await Pl1eHelpers.getDocument("Item", data.uuid);

                if (!source || !ITEM_TYPES.has(source.type)) return;

                const entries = this._getEntries();
                if (entries.some(e => e.sourceId === source.id)) return;

                entries.push({ sourceId: source.id });
                await this._setEntries(entries);
                this.render();
            });
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
