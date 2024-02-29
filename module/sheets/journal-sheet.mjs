import {Pl1eEvent} from "../helpers/events.mjs";
import {PL1E} from "../pl1e.mjs";

export class Pl1eJournalPageSheet extends JournalPageSheet {

    /** @inheritdoc */
    toc = {};

    /** @inheritdoc */
    static get defaultOptions() {
        const options = foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{dropSelector: ".drop-target"}],
            submitOnChange: true
        });
        options.classes.push("class-journal");
        return options;
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
            // Translate temperature value from 1-9 scale to 5%-95% scale
            context.system.temperaturePercentage = ((context.system.temperature - 1) / (9 - 1)) * (95 - 5) + 5;
        }

        if (context.system.humidity) {
            // Translate water level value from 1-9 scale to 10%-100% scale
            context.system.humidityPercentage = ((context.system.humidity - 1) / (9 - 1)) * (100 - 10) + 10;
        }

        if (context.system.humidity) {
            let humidityLevel = context.system.humidity;
            let humidityHtml = '';

            for (let i = 1; i <= 10; i++) {
                if (i <= 3) {
                    humidityHtml += i <= humidityLevel ? '<i class="fas fa-tint-slash"></i>' : '<i class="far fa-tint-slash"></i>';
                } else if (i <= 7) {
                    humidityHtml += i <= humidityLevel ? '<i class="fas fa-tint"></i>' : '<i class="far fa-tint"></i>';
                } else {
                    humidityHtml += i <= humidityLevel ? '<i class="fas fa-cloud-rain"></i>' : '<i class="far fa-cloud-rain"></i>';
                }
            }

            context.humidityIcons = humidityHtml;
        }

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