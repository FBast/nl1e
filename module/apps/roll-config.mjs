export class RollConfig extends FormApplication {

    constructor(actor, skill, options = {}) {
        super(options);
        this.actor = actor;
        this.skill = skill;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: ["roll-config"],
            classes: ["pl1e"],
            resizable: false,
            title: game.i18n.localize("PL1E.RollConfig"),
            template: "systems/pl1e/templates/apps/roll-config.hbs"
        });
    }


    submit(button) {
        super.submit(button);
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
        const dialog = new RollConfig(actor, skill);
        dialog.render(true);

        // return new Promise(resolve => {
        //     const dialog = new this(actor, skill, {
        //         close: () => resolve(null)
        //     });
        //     dialog.render(true);
        //     dialog.resolve = resolve;
        // });
    }

}
