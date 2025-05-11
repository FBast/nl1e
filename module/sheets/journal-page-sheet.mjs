import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {filterDocuments, getFilters, toggleFilter} from "../helpers/filterCache.mjs";
import {sellItem} from "../helpers/trade.mjs";

const FILTER_CATEGORIES = ["weapons", "wearables", "consumables", "commons", "modules"];
const ITEM_TYPES = new Set(["weapon", "wearable", "consumable", "common", "module"]);

export class Pl1eJournalPageSheet extends JournalPageSheet {
    toc = {};

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{ dropSelector: ".drop-target" }],
            submitOnChange: true
        });
    }

    get template() {
        return `systems/pl1e/templates/journal/page-${this.object.type}-${this.isEditable ? "edit" : "view"}.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        context.system = context.document.system;

        context.title = Object.fromEntries(Array.fromRange(4, 1).map(n => [`level${n}`, context.data.title.level + n - 1]));

        if (this.object.type === "merchant") {
            context.filters = await getFilters(this.document.id, FILTER_CATEGORIES).catch(() => {
                return Object.fromEntries(FILTER_CATEGORIES.map(c => [c, new Set()]));
            });

            const itemsData = foundry.utils.getProperty(this.object, "flags.pl1e.items") || [];
            const items = itemsData.map(data => new CONFIG.Item.documentClass(data, { parent: null }));
            const fakeActor = this._createFakeActor(items);

            await this._decorateItems(fakeActor);

            context.actor = fakeActor;
            context.merchantPrices = fakeActor.system.merchantPrices;

            for (const category of FILTER_CATEGORIES) {
                const type = category.slice(0, -1); // e.g. "weapons" → "weapon"
                context[category] = filterDocuments(items.filter(i => i.type === type), context.filters[category]);
            }
        }

        if (context.system.temperature)
            context.temperaturePercentage = ((context.system.temperature - 1) / 8) * 97 + 1;
        if (context.system.humidity)
            context.humidityPercentage = ((context.system.humidity - 1) / 8) * 90 + 10;

        context.enriched = await TextEditor.enrichHTML(context.system.content, {
            secrets: this.document.isOwner,
            async: true,
            relativeTo: this.document
        });

        return context;
    }

    async _renderInner(...args) {
        const html = await super._renderInner(...args);
        this.toc = JournalEntryPage.buildTOC(html.get());
        return html;
    }

    async activateListeners(html) {
        super.activateListeners(html);

        html[0].querySelectorAll(".launch-text-editor").forEach(e => {
            e.addEventListener("click", ev => Pl1eEvent.onLaunchTextEditor(ev, this.document));
        });

        if (this.object.type !== "merchant") return;

        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.document));

        const filters = await getFilters(this.document.id, FILTER_CATEGORIES);
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
                    sellMultiplier: this.object.getFlag("pl1e", "sellMultiplier") ?? 100,
                    unlimitedItems: false
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

            const item = await Pl1eHelpers.getDocument("Item", data.sourceId, data.id)
            const allowedTypes = [...ITEM_TYPES];
            if (data.type !== "Item" || !allowedTypes.includes(item?.type)) return;

            if (this.document.isOwner) {
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
                await sellItem(seller, this.document, item, buyMultiplier);
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