export class DMTool extends Application {

    constructor(options={}) {
        if (DMTool._instance) {
            throw new Error("Pl1eDMTool already has an instance!!!");
        }

        super(options);

        DMTool._instance = this;
        DMTool.closed = true;

        this.data = {};
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["dm-tool"],
            height: "auto",
            id: "dm-tool-app",
            popOut: false,
            resizable: false,
            template: "systems/pl1e/templates/apps/dm-tool.hbs",
            title: "MJ Tool",
            width: "auto",
        });
    }

    getData() {
        const data = super.getData();

        data.advantageDisadvantage = game.settings.get("pl1e", "globalAdvantages");
        data.bonusMalus = game.settings.get("pl1e", "globalBonuses");
        data.game = game;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".sub, .add").on("click", async (ev) => {
            const type = $(ev.currentTarget).parents(".resource").attr("data-type");
            const change = $(ev.currentTarget).hasClass("add") ? 1 : -1;
            const input = $(ev.currentTarget).siblings("input[type='number']");
            const currentValue = parseInt(input.val());
            const newValue = currentValue + change;
            input.val(newValue);

            await game.settings.set("pl1e", type, newValue);

            // Trigger a custom event to notify about the update
            Hooks.callAll("preparePlayersActorsData");
        });

        html.find(".action-btn").on("click", ev => {
            const action = $(ev.currentTarget).data("action");
            console.log(`Action ${action} triggered`);
            // Add your action handling logic here
        });
    }

    static async initialise() {
        if (this._instance) return;

        console.log("PL1E | Initialising DM Tool");
        new DMTool();

        if (DMTool._instance) DMTool._instance.render(true);
        await this.registerSocketEvents();
    }

    static async registerSocketEvents() {
        console.log("PL1E | Registering MJ Tool socket events");

        // Register your socket events here
        // game.socket.on("system.your-system", ev => {
        //     if (ev.operation === "someOperation") {
        //         // Handle the operation
        //     }
        // });
    }
}
