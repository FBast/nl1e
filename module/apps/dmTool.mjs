export class DMTool extends FormApplication {
    constructor(options = {}) {
        if (DMTool._instance) {
            throw new Error("Pl1eDMTool already has an instance!!!");
        }

        super(options);
        DMTool._instance = this;
        DMTool.closed = true;

        this.data = {};
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pl1e", "dm-tool"],
            height: "auto",
            popOut: false,
            resizable: false,
            template: "systems/pl1e/templates/apps/dm-tool.hbs"
        });
    }

    getData() {
        const data = super.getData();

        data.advantages = game.settings.get("pl1e", "globalAdvantages");
        data.bonuses = game.settings.get("pl1e", "globalBonuses");
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

        // Dynamic positioning logic
        const dmToolForm = html[0]; // This refers to the form element of the DM tool
        const sidebar = document.querySelector('#sidebar');

        function adjustDmToolPosition() {
            if (sidebar && sidebar.classList.contains('collapsed')) {
                dmToolForm.classList.add('left-panel-hidden');
            } else {
                dmToolForm.classList.remove('left-panel-hidden');
            }
        }

        // Initial adjustment
        adjustDmToolPosition();

        // Adjust position when the sidebar's class list changes
        const observer = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
                if (mutation.attributeName === 'class') {
                    adjustDmToolPosition();
                }
            }
        });
        observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

        // Adjust position on window resize
        window.addEventListener('resize', adjustDmToolPosition);
    }

    static async initialise() {
        if (this._instance) return;

        new DMTool();

        if (DMTool._instance) DMTool._instance.render(true);
        await this.registerSocketEvents();
    }

    static async registerSocketEvents() {
        // Register your socket events here
        // game.socket.on("system.your-system", ev => {
        //     if (ev.operation === "someOperation") {
        //         // Handle the operation
        //     }
        // });
    }
}