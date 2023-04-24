export class AppResting extends Application {

    constructor(actor, options = {}) {
        super(options);

        /** @type {Pl1eActor} */
        this.actor = actor;
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // classes: ["my-apps"],
            template: "systems/pl1e/templates/apps/app-resting.hbs",
            width: 400,
            height: "auto",
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "rest"}],
            resizable: true,
            closeOnSubmit: true,
            submitOnChange: false,
        });
    }

    /** @override */
    getData() {
        const data = super.getData();

        // Get rest items
        const restItems = [];
        for (let item of this.actor.items) {
            if (item.type === 'common' && item.system.attributes.isFood.value) {
                restItems.push(item);
            }
        }

        data.restItems = restItems;

        // Placeholders data
        data.health = 5;
        data.stamina = 5;
        data.mana = 5;
        data.maxSlots = 5;
        data.currentSlots = 2;
        data.memorizedAbilities = ['Fireball', 'Healing Touch'];
        data.availableAbilities = ['Ice Storm', 'Invisibility', 'Resurrection'];
        data.availableRanks = 3;
        data.maxMastery = 10;
        data.availableSkills = ['Swordsmanship', 'Archery', 'Magic'];

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        // Add any event listeners you need here
    }

    /** @override */
    async _updateObject(event, formData) {
        // Handle form submission here
    }

    /**
     * @param actor
     * @param rejectClose
     * @param options
     * @returns {Promise<unknown>}
     */
    static async createCamping(actor, { rejectClose= false, options= {} } = {}) {
        return new Promise((resolve, reject) => {
            const app = new this(actor, {
                title: `${game.i18n.localize("PL1E.CampingTitle")}: ${actor.name}`,
                close: () => {
                    // if ( rejectClose ) reject("No advancement type was selected");
                    // else resolve(null);
                }
            });
            app.render(true);
        });
    }

}