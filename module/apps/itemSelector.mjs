export class ItemSelector extends FormApplication {

    constructor(items, options = {}) {
        super(options);
        this.items = items;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'item-selector-dialog',
            classes: ['pl1e'],
            title: `${game.i18n.localize("PL1E.SelectAnItem")}`,
            template: 'systems/pl1e/templates/apps/dialog-item-selector.hbs',
            resizable: false,
            width: 'auto',
            height: 'auto'
        });
    }

    getData() {
        return { items: this.items };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[data-action]').click(event => {
            const action = event.currentTarget.dataset.action;
            this.resolve(this.items[action]);
            this.close();
        });
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
