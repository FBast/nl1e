export class JournalClassPageSheet extends JournalPageSheet {

    /** @inheritDoc */
    static get defaultOptions() {
        const options = foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{dropSelector: ".drop-target"}],
            submitOnChange: true
        });
        options.classes.push("class-journal");
        return options;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    get template() {
        return `systems/pl1e/templates/journal/page-${this.object.type}-${this.isEditable ? "edit" : "view"}.hbs`;
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    toc = {};

    /* -------------------------------------------- */

    /** @inheritDoc */
    async getData(options) {
        const context = super.getData(options);

        return context;
    }

    /* -------------------------------------------- */
    /*  Rendering                                   */
    /* -------------------------------------------- */

    /** @inheritDoc */
    async _renderInner(...args) {
        const html = await super._renderInner(...args);
        this.toc = JournalEntryPage.buildTOC(html.get());
        return html;
    }

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);
        // html[0].querySelectorAll(".item-delete").forEach(e => {
        //     e.addEventListener("click", this._onDeleteItem.bind(this));
        // });
        // html[0].querySelectorAll(".launch-text-editor").forEach(e => {
        //     e.addEventListener("click", this._onLaunchTextEditor.bind(this));
        // });
    }

    /* -------------------------------------------- */

    /** @inheritDoc */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);

    }

}