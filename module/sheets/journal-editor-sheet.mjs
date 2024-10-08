export class JournalEditor extends DocumentSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["journal-editor"],
            template: "systems/pl1e/templates/journal/journal-editor.hbs",
            width: 550,
            height: 640,
            textKeyPath: null,
            resizable: true
        });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    get title() {
        if ( this.options.title ) return `${this.document.name}: ${this.options.title}`;
        else return this.document.name;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
        const data = super.getData();
        const rawText = foundry.utils.getProperty(this.document, this.options.textKeyPath) ?? "";
        return foundry.utils.mergeObject(data, {
            enriched: await TextEditor.enrichHTML(rawText, {
                secrets: this.document.isOwner,
                async: true,
                relativeTo: this.document
            })
        });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _updateObject(event, formData) {
        await this.document.update(formData);
    }

}