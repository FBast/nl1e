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

        // Default system type
        if (context.system.type === undefined) {
            let typeArray = PL1E[`${context.document.type}Types`];
            if (typeArray === undefined) throw new Error(`PL1E | Cannot find any ${context.document.type}Types`);
            await this.document.update({
                "system.type": Object.keys(typeArray)[0]
            });
        }

        // Default system subType
        if (context.system.subType === undefined) {
            let subTypeArray = PL1E[`${context.system.type}Types`];
            if (subTypeArray !== undefined) {
                await this.document.update({
                    "system.subType": Object.keys(subTypeArray)[0]
                });
            }
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