import {Pl1eEvent} from "../helpers/events.mjs";

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
        html[0].querySelectorAll(".launch-text-editor").forEach(e => {
            e.addEventListener("click", ev => Pl1eEvent.onLaunchTextEditor(ev, this.document));
        });
    }

}