import { Pl1eHelpers as pl1eHelpers, Pl1eHelpers } from "../helpers/helpers.mjs";

export class RestForm extends FormApplication {

    constructor(actor, options = {}) {
        super(actor, options);

        /** @type {Pl1eActor} */
        this.actor = actor;
        this.skills = deepClone(this.actor.system.skills);
        this.skills = Object.fromEntries(Object.entries(this.skills).filter(([key]) => !Pl1eHelpers.getConfig("skills", key, "fixedRank")));
        this.maxRank = this.actor.system.general.maxRank;
        this.ranks = this.actor.system.general.ranks;

        this.environments = Pl1eHelpers.getConfig("environments");
        this.beds = Pl1eHelpers.getConfig("beds");
        this.meals = pl1eHelpers.getConfig("meals");

        // Initialise les sélections avec des options si disponibles
        this.selectedEnvironment = options.selectedEnvironment || null;
        this.selectedBed = options.selectedBed || null;
        this.selectedMeal = options.selectedMeal || null;

        // Initialise les effets
        this.effects = [];
    }

    /** @inheritDoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e", "form", "rest"],
            template: "systems/pl1e/templates/rest/rest-form.hbs",
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "training" }],
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
        data.environments = this.environments;
        data.beds = this.beds;
        data.meals = this.meals;

        // Passe les sélections actuelles au template
        data.selectedEnvironment = this.selectedEnvironment;
        data.selectedBed = this.selectedBed;
        data.selectedMeal = this.selectedMeal;

        // Met à jour les effets basés sur les sélections actuelles
        this.updateEffects();
        data.effects = this.effects;

        return data;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        const handleToggleGroup = (groupClass, stateProperty) => {
            html.find(groupClass).each((index, group) => {
                const toggleItems = $(group).find('.toggle-item');

                toggleItems.on("click", async (event) => {
                    // Remove selection from all items within this group
                    toggleItems.removeClass("selected");

                    // Add selection to the clicked item
                    const clickedItem = $(event.currentTarget);
                    clickedItem.addClass("selected");

                    // Get the selected value and update the state property
                    this[stateProperty] = clickedItem.data("value");

                    // Render à nouveau pour mettre à jour le visuel avec les nouvelles sélections
                    this.render();
                });
            });
        };

        handleToggleGroup('.environment-toggle', 'selectedEnvironment');
        handleToggleGroup('.bed-toggle', 'selectedBed');
        handleToggleGroup('.meal-toggle', 'selectedMeal');
    }

    updateEffects() {
        // Retrieve effects based on current selections
        const environmentEffects = this.selectedEnvironment ? this.environments[this.selectedEnvironment]?.effects : {};
        const bedEffects = this.selectedBed ? this.beds[this.selectedBed]?.effects : {};
        const mealEffects = this.selectedMeal ? this.meals[this.selectedMeal]?.effects : {};

        // Initialize an empty object to store combined effects
        const combinedEffects = {};

        // Function to add effects from each source (environment, bed, meal)
        const addEffects = (effects) => {
            for (const [key, value] of Object.entries(effects)) {
                if (typeof value === 'number') {
                    // If it's a number, sum it with the existing value
                    combinedEffects[key] = (combinedEffects[key] || 0) + value;
                } else {
                    // Otherwise, simply replace the value
                    combinedEffects[key] = value;
                }
            }
        };

        // Add effects from environment, bed, and meal
        addEffects(environmentEffects);
        addEffects(bedEffects);
        addEffects(mealEffects);

        // Convert the combined effects into an array for display
        this.effects = Object.entries(combinedEffects).map(([key, value]) => {
            return {
                label: `PL1E.${key}Label`, // Assuming localization is set up for each effect
                icon: this.getIconForEffect(key),
                value: value
            };
        });
    }

    // Helper function to map effect keys to icons
    getIconForEffect(effect) {
        const iconMap = {
            health: "heart",
            mana: "tint",
            endurance: "running",
            satiety: "utensils",
            tranquility: "exclamation-triangle",
            // Add more mappings as needed
        };
        return iconMap[effect] || "question";
    }
}