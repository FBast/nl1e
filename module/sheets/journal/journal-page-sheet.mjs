import {Pl1eEvent} from "../../helpers/events.mjs";

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

    async getData(options) {
        const context = await super.getData(options);
        context.system = context.document.system;

        context.title = Object.fromEntries(Array.fromRange(4, 1).map(n => [`level${n}`, context.data.title.level + n - 1]));

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
    }
}