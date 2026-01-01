import { Pl1eEvent } from "../../helpers/events.mjs";

export class Pl1eJournalPageSheet extends JournalPageSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{ dropSelector: ".drop-target" }],
            submitOnChange: true
        });
    }

    get template() {
        return `systems/pl1e/templates/journal/page-${this.object.type}-${this.isEditable ? "edit" : "view"}.hbs`;
    }

    /**
     * Returns the page stored items entries (flags.pl1e.items)
     * @returns {object[]}
     * @protected
     */
    _getPageItems() {
        const raw = this.document.getFlag("pl1e", "items");
        return Array.isArray(raw) ? raw : [];
    }

    /**
     * Persists the page stored items entries (flags.pl1e.items)
     * @param {object[]} items
     * @returns {Promise<void>}
     * @protected
     */
    async _setPageItems(items) {
        await this.document.setFlag("pl1e", "items", Array.isArray(items) ? items : []);
    }

    /**
     * Find an item entry by sourceId
     * @param {string} sourceId
     * @returns {object|null}
     * @protected
     */
    _findPageItemBySourceId(sourceId) {
        if (!sourceId) return null;
        return this._getPageItems().find(e => e?.flags?.pl1e?.sourceId === sourceId) ?? null;
    }

    /**
     * Upsert an item entry using flags.pl1e.sourceId as primary key
     * @param {object} entry
     * @returns {Promise<boolean>} true if inserted, false if updated
     * @protected
     */
    async _upsertPageItem(entry) {
        const sourceId = entry?.flags?.pl1e?.sourceId;
        if (!sourceId) throw new Error("PL1E | _upsertPageItem requires entry.flags.pl1e.sourceId");

        const items = this._getPageItems();
        const idx = items.findIndex(e => e?.flags?.pl1e?.sourceId === sourceId);

        if (idx === -1) {
            items.push(entry);
            await this._setPageItems(items);
            return true;
        }

        items[idx] = entry;
        await this._setPageItems(items);
        return false;
    }

    /**
     * Remove an item entry by sourceId
     * @param {string} sourceId
     * @returns {Promise<boolean>} true if removed
     * @protected
     */
    async _removePageItemBySourceId(sourceId) {
        if (!sourceId) return false;

        const items = this._getPageItems();
        const next = items.filter(e => e?.flags?.pl1e?.sourceId !== sourceId);

        if (next.length === items.length) return false;

        await this._setPageItems(next);
        return true;
    }

    async getData(options) {
        const context = await super.getData(options);
        context.system = context.document.system;

        context.title = Object.fromEntries(
            Array.fromRange(4, 1).map(n => [
                `level${n}`,
                context.data.title.level + n - 1
            ])
        );

        if (context.system.temperature)
            context.temperaturePercentage = ((context.system.temperature - 1) / 8) * 97 + 1;

        if (context.system.humidity)
            context.humidityPercentage = ((context.system.humidity - 1) / 8) * 90 + 10;

        context.enriched = await TextEditor.enrichHTML(context.data.text.content, {
            secrets: this.document.isOwner,
            async: true,
            relativeTo: this.document
        });

        return context;
    }

    async _renderInner(...args) {
        const html = await super._renderInner(...args);

        const tocRoot = html[0].cloneNode(true);
        tocRoot.querySelectorAll("[data-exclude-toc]").forEach(el => el.remove());
        this.toc = JournalEntryPage.buildTOC(tocRoot);

        return html;
    }

    async activateListeners(html) {
        super.activateListeners(html);

        html[0].querySelectorAll(".launch-text-editor").forEach(el => {
            el.addEventListener("click", ev => Pl1eEvent.onLaunchTextEditor(ev, this.document));
        });
    }
}