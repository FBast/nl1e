import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class RestForm extends FormApplication {

    constructor(actor, options = {}) {
        super(actor, options);

        this.interiorOptions = [
            { value: 1, img: 'systems/pl1e/assets/rest/interiorNoDoor.jpg', tooltip: 'PL1E.InteriorNoDoor' },
            { value: 2, img: 'systems/pl1e/assets/rest/interiorNoBed.jpg', tooltip: 'PL1E.InteriorNoBed' },
            { value: 3, img: 'systems/pl1e/assets/rest/interiorPoor.jpg', tooltip: 'PL1E.InteriorPoor' },
            { value: 4, img: 'systems/pl1e/assets/rest/interiorGood.jpg', tooltip: 'PL1E.InteriorGood' },
            { value: 5, img: 'systems/pl1e/assets/rest/interiorLuxurious.jpg', tooltip: 'PL1E.InteriorLuxurious' }
        ];

        this.exteriorOptions = [
            { value: 1, img: 'systems/pl1e/assets/rest/exteriorHostile.jpg', tooltip: 'PL1E.ExteriorInhospitable' },
            { value: 2, img: 'systems/pl1e/assets/rest/exteriorCalm.jpg', tooltip: 'PL1E.ExteriorHostile' },
            { value: 3, img: 'systems/pl1e/assets/rest/exteriorCalm.jpg', tooltip: 'PL1E.ExteriorNormal' },
            { value: 4, img: 'systems/pl1e/assets/rest/exteriorCalm.jpg', tooltip: 'PL1E.ExteriorGood' },
            { value: 5, img: 'systems/pl1e/assets/rest/exteriorCalm.jpg', tooltip: 'PL1E.ExteriorPeaceful' }
        ];

        this.serviceOptions = [
            { value: 1, img: 'systems/pl1e/assets/rest/mealNothing.jpg', tooltip: 'PL1E.NoMeal' },
            { value: 2, img: 'systems/pl1e/assets/rest/mealFrugal.jpg', tooltip: 'PL1E.MealFrugal' },
            { value: 3, img: 'systems/pl1e/assets/rest/mealNormal.jpg', tooltip: 'PL1E.MealNormal' },
            { value: 4, img: 'systems/pl1e/assets/rest/mealGood.jpg', tooltip: 'PL1E.MealGood' },
            { value: 5, img: 'systems/pl1e/assets/rest/mealLuxurious.jpg', tooltip: 'PL1E.MealLuxurious' }
        ];

        /** @type {Pl1eActor} */
        this.actor = actor;
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
            classes: ["pl1e", "form", "rest"],
            template: "systems/pl1e/templates/rest/rest-form.hbs",
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "training"}],
            resizable: true
        });
    }

    /** @inheritDoc */
    async getData() {
        const data = super.getData();
        data.system = this.actor.system;
        data.actor = this.actor;

        const actorSheetData = await this.actor.sheet.getData();
        data.commons = actorSheetData.commons;

        data.interiorOptions = this.interiorOptions;
        data.exteriorOptions = this.exteriorOptions;
        data.serviceOptions = this.serviceOptions;

        return data;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        // Combine both toggle groups into one logical group
        const toggleItems = html.find('.toggle-item');

        toggleItems.on("click", (event) => {
            // Remove 'selected' class from all toggle items in both groups
            toggleItems.removeClass("selected");

            // Add 'selected' class to the clicked item
            const clickedItem = $(event.currentTarget);
            clickedItem.addClass("selected");

            // Get the selected value (e.g., the data-value attribute)
            const selectedValue = clickedItem.data("value");

            // Example: Do something with the selected value (e.g., save it to the actor's data)
            if (clickedItem.closest('.environment-toggle').length) {
                this.selectedEnvironment = selectedValue;
            } else if (clickedItem.closest('.service-toggle').length) {
                this.selectedService = selectedValue;
            }
        });
    }
}