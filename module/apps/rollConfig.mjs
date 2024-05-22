export class RollConfig extends FormApplication {

    constructor(actor, skill, options = {}) {
        super(options);
        this.actor = actor;
        this.skill = skill;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'roll-config',
            classes: ['pl1e'],
            title: `${game.i18n.localize("PL1E.RollConfig")}`,
            template: 'systems/pl1e/templates/apps/roll-config.hbs',
            resizable: false,
            width: 'auto',
            height: 'auto'
        });
    }

    getData() {
        const data = super.getData();
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[data-action]').click(event => {
            const action = event.currentTarget.dataset.action;
            this.resolve(this.items[action]);
            this.close();
        });
    }

    static async createAndRender(actor, skill) {
        return new Promise(resolve => {
            const dialog = new this(actor, skill, {
                close: () => resolve(null)
            });
            dialog.render(true);
            dialog.resolve = resolve;
        });
    }

}
