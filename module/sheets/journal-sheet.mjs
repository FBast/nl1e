import {JournalEditor} from "./journal-editor-sheet.mjs";

export class Pl1eJournalPageSheet extends JournalPageSheet {

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

        return context;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelectorAll(".launch-text-editor").forEach(e => {
            e.addEventListener("click", this._onLaunchTextEditor.bind(this));
        });
    }

    /**
     * Handle launching the individual text editing window.
     * @param {Event} event  The triggering click event.
     */
    _onLaunchTextEditor(event) {
        event.preventDefault();
        const textKeyPath = event.currentTarget.dataset.target;
        const label = event.target.closest(".form-group").querySelector("label");
        const editor = new JournalEditor(this.document, { textKeyPath, title: label?.innerText });
        editor.render(true);
    }

}