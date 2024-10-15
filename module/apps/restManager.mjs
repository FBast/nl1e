import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class RestManager extends FormApplication {

    constructor(actor, options = {}) {
        super(actor, options);

        this.environmentOptions = [
            { value: 1, img: 'systems/pl1e/assets/rest/exteriorHostile.jpg', alt: 'Hostile Environment' },
            { value: 2, img: 'systems/pl1e/assets/rest/exteriorCalm.jpg', alt: 'Calm Nature' },
            { value: 3, img: 'systems/pl1e/assets/rest/interiorPoor.jpg', alt: 'Poor Bed' },
            { value: 4, img: 'systems/pl1e/assets/rest/interiorStandard.jpg', alt: 'Standard Bed' },
            { value: 5, img: 'systems/pl1e/assets/rest/interiorLuxurious.jpg', alt: 'Luxurious Bed' }
        ];

        this.serviceOptions = [
            { value: 1, img: 'systems/pl1e/assets/rest/mealNothing.jpg', alt: 'No Meal' },
            { value: 2, img: 'systems/pl1e/assets/rest/mealFrugal.jpg', alt: 'Frugal Meal' },
            { value: 3, img: 'systems/pl1e/assets/rest/mealNormal.jpg', alt: 'Normal Meal' },
            { value: 4, img: 'systems/pl1e/assets/rest/mealGood.jpg', alt: 'Good Meal' }
        ];

        /** @type {Pl1eActor} */
        this.actor = actor;
        this.system = actor.system;
        this.items = [];
        this.skills = deepClone(this.actor.system.skills);
        this.skills = Object.fromEntries(Object.entries(this.skills).filter(([key]) => !Pl1eHelpers.getConfig("skills", key, "fixedRank")));
        this.maxRank = this.actor.system.general.maxRank;
        this.ranks = this.actor.system.general.ranks;
        this.itemEaten = null;
        this.itemDrink = null;
        this.selectedEnvironment = null;
        this.selectedService = null;
    }

    /** @inheritDoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e"],
            template: "systems/pl1e/templates/apps/rest-manager.hbs",
            width: "auto",
            height: "auto",
            scrollY: [
                ".scroll-auto"
            ],
            resizable: true
        });
    }

    /** @inheritDoc */
    getData() {
        const data = super.getData();
        data.system = this.actor.system;

        data.environmentOptions = this.environmentOptions;
        data.serviceOptions = this.serviceOptions;

        return data;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(".toggle-group").each((index, group) => {
            const toggleItems = $(group).find(".toggle-item");

            toggleItems.on("click", (event) => {
                // Remove selection from all items in the current group
                toggleItems.removeClass("selected");

                // Add selection to the clicked item
                const clickedItem = $(event.currentTarget);
                clickedItem.addClass("selected");

                // Get the selected value (e.g., the data-value attribute)
                const selectedValue = clickedItem.data("value");

                // Example: Do something with the selected value (e.g., save it to the actor's data)
                if ($(group).hasClass('environment-group')) {
                    this.selectedEnvironment = selectedValue;
                } else if ($(group).hasClass('service-group')) {
                    this.selectedService = selectedValue;
                }
            });
        });
    }
}