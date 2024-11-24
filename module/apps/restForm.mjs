import { Pl1eHelpers as pl1eHelpers, Pl1eHelpers } from "../helpers/helpers.mjs";

export class RestForm extends FormApplication {
    constructor(actor, options = {}) {
        super(actor, options);

        /** @type {Pl1eActor} */
        this.actor = actor;
        this.skills = deepClone(this.actor.system.skills);
        this.skills = Object.fromEntries(
            Object.entries(this.skills).filter(([key]) => !Pl1eHelpers.getConfig("skills", key, "fixedRank"))
        );
        this.maxRank = this.actor.system.general.maxRank;
        this.ranks = this.actor.system.general.ranks;

        this.beds = Pl1eHelpers.getConfig("beds");
        this.meals = pl1eHelpers.getConfig("meals");

        // Initialize selections with options or defaults
        this.selectedBed = options.selectedBed || Object.keys(this.beds).find(key => key === "none") || null;
        this.selectedMeal = options.selectedMeal || Object.keys(this.meals).find(key => key === "none") || null;
        this.selectedBedItem = null;
        this.selectedMealItem = null;

        // Initialize effects
        this.effects = [];
    }

    /** @inheritDoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e", "form", "rest"],
            template: "systems/pl1e/templates/rest/rest-form.hbs",
            scrollY: [".scroll-auto"],
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "training" }],
            resizable: true,
        });
    }

    /** @inheritDoc */
    async getData() {
        const data = super.getData();
        data.system = this.actor.system;
        data.actor = this.actor;

        const actorSheetData = await this.actor.sheet.getData();
        data.commons = actorSheetData.commons;
        data.beds = this.beds;
        data.meals = this.meals;

        // Pass current selections to the template
        data.selectedBed = this.selectedBed;
        data.selectedMeal = this.selectedMeal;
        data.selectedBedItem = this.selectedBedItem;
        data.selectedMealItem = this.selectedMealItem;

        // Update effects based on current selections
        this.updateEffects();
        data.effects = this.effects;

        return data;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        const handleToggleGroup = (groupClass, stateProperty, relatedItemProperty) => {
            html.find(groupClass).each((index, group) => {
                const toggleItems = $(group).find(".toggle-item");

                toggleItems.on("click", async event => {
                    // Remove selection from all items within this group
                    toggleItems.removeClass("selected");

                    // Add selection to the clicked item
                    const clickedItem = $(event.currentTarget);
                    clickedItem.addClass("selected");

                    // Update the state property with the selected value
                    this[stateProperty] = clickedItem.data("value");

                    // Reset the related item property to null
                    this[relatedItemProperty] = null;

                    // Re-render to update the UI with the new selections
                    this.render();
                });
            });
        };

        // Handle toggles for bed and meal groups
        handleToggleGroup(".bed-toggle", "selectedBed", "selectedBedItem");
        handleToggleGroup(".meal-toggle", "selectedMeal", "selectedMealItem");

        // Handle item selection
        html.find(".item-select").on("click", ev => this._onItemSelect(ev));
    }

    updateEffects() {
        // Retrieve items if IDs are set
        const mealItem = this.selectedMealItem ? this.actor.items.get(this.selectedMealItem) : null;
        const bedItem = this.selectedBedItem ? this.actor.items.get(this.selectedBedItem) : null;

        // Access attributes from selectedMeal and selectedBed
        const meal = this.selectedMeal ? this.meals[this.selectedMeal] : null;
        const bed = this.selectedBed ? this.beds[this.selectedBed] : null;

        // Calculate effects for health, mana, and stamina
        const effects = ["health", "mana", "stamina"].map(attr => {
            const value =
                (meal?.effects[attr] || 0) + // From selectedMeal
                (mealItem?.system.attributes[`${attr}Rest`] || 0) + // From selectedMealItem
                (bed?.effects[attr] || 0) + // From selectedBed
                (bedItem?.system.attributes[`${attr}Rest`] || 0); // From selectedBedItem

            const config = Pl1eHelpers.getConfig("resources", attr);
            return {
                label: config.label,
                value: value,
                icon: config.icon,
            };
        });

        // Store calculated effects
        this.effects = effects;
    }

    _onItemSelect(ev) {
        const clickedElement = $(ev.currentTarget);
        const itemId = clickedElement.closest(".item").data("item-id");
        const item = this.actor.items.get(itemId); // Retrieve the selected item
        const itemType = item.system.attributes.commonType; // Determine the item's type (food/bed)

        if (itemType === "food") {
            const sameMealItem = this.selectedMealItem === itemId;
            this.selectedMealItem = sameMealItem ? null : itemId;
            this.selectedMeal = sameMealItem ? this.selectedMeal : Object.keys(this.meals).find(key => key === "none") || null;
        } else if (itemType === "bed") {
            const sameBedItem = this.selectedBedItem === itemId;
            this.selectedBedItem = sameBedItem ? null : itemId;
            this.selectedBed = sameBedItem ? this.selectedBed : Object.keys(this.beds).find(key => key === "none") || null;
        }

        // Re-render to reflect changes
        this.render();
    }
}