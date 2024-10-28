export class ItemSelector extends FormApplication {

    constructor(items, options = {}) {
        super(options);
        this.items = items;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e", "item-selector"],
            title: `${game.i18n.localize("PL1E.SelectAnItem")}`,
            template: 'systems/pl1e/templates/apps/item-selector.hbs',
            resizable: false,
        });
    }

    getData() {
        return { items: this.items };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(`.toggle-item`).on("click", this._onSelectItem.bind(this));
    }

    _onSelectItem(event) {
        const itemIndex = $(event.currentTarget).data("item-index");
        this.resolve(this.items[itemIndex]);
        this.close();
    }

    static async createAndRender(actor, items) {
        return new Promise(resolve => {
            const dialog = new this(items, {
                close: () => resolve(null)
            });
            dialog.render(true);
            dialog.resolve = resolve;
        });
    }
}
