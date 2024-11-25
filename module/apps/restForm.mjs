import { Pl1eHelpers as pl1eHelpers, Pl1eHelpers } from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";

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

        this.environments = Pl1eHelpers.getConfig("environments");
        this.beds = Pl1eHelpers.getConfig("beds");
        this.meals = pl1eHelpers.getConfig("meals");

        // Initialize selections with options or defaults
        this.selectedEnvironment = options.selectedEnvironment || Object.keys(this.beds).find(key => key === "normal");
        this.selectedBed = options.selectedBed || Object.keys(this.beds).find(key => key === "none");
        this.selectedMeal = options.selectedMeal || Object.keys(this.meals).find(key => key === "none");
        this.selectedBedItem = null;
        this.selectedMealItems = [];

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
        data.environments = this.environments;
        data.beds = this.beds;
        data.meals = this.meals;

        data.selectedEnvironment = this.selectedEnvironment;
        data.selectedBed = this.selectedBed;
        data.selectedMeal = this.selectedMeal;
        data.selectedBedItem = this.selectedBedItem;
        data.selectedMealItems = this.selectedMealItems;

        // Update effects based on current selections
        this.updateEffects();
        data.effects = this.effects;

        return data;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        const handleToggleGroup = (groupClass, stateProperty, relatedItemProperty = null) => {
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
                    if (relatedItemProperty) this[relatedItemProperty] = Array.isArray(this[relatedItemProperty]) ? [] : null;

                    // Re-render to update the UI with the new selections
                    this.render();
                });
            });
        };

        // Handle toggles for bed and meal groups
        handleToggleGroup(".environment-toggle", "selectedEnvironment");
        handleToggleGroup(".bed-toggle", "selectedBed", "selectedBedItem");
        handleToggleGroup(".meal-toggle", "selectedMeal", "selectedMealItems");

        // Handle item selection
        html.find(".item-select").on("click", ev => this._onItemSelect(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.actor));
        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
    }

    updateEffects() {
        // Retrieve items if IDs are set
        const mealItems = this.selectedMealItems.map(itemId => this.actor.items.get(itemId));
        const bedItem = this.selectedBedItem ? this.actor.items.get(this.selectedBedItem) : null;

        // Access attributes from selectedMeal and selectedBed
        const environment = this.selectedEnvironment ? this.environments[this.selectedEnvironment] : null;
        const meal = this.selectedMeal ? this.meals[this.selectedMeal] : null;
        const bed = this.selectedBed ? this.beds[this.selectedBed] : null;

        // Calculate effects for health, mana, and stamina
        const effects = ["health", "mana", "stamina"].map(attr => {
            const value =
                (environment?.effects[attr] || 0) + // From environment
                (meal?.effects[attr] || 0) + // From selectedMeal
                mealItems.reduce((sum, item) => sum + (item?.system.attributes[`${attr}Rest`] || 0), 0) +
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
            const isAlreadySelected = this.selectedMealItems.includes(itemId);

            if (isAlreadySelected) {
                // Remove the item if it's already selected
                this.selectedMealItems = this.selectedMealItems.filter(id => id !== itemId);
            } else {
                // Add the new item, and remove the first if exceeding 3 items
                this.selectedMealItems.push(itemId);
                if (this.selectedMealItems.length > 3) {
                    this.selectedMealItems.shift();
                }
            }

            // Clear selectedMeal if items are selected
            this.selectedMeal = this.selectedMealItems.length ?
                Object.keys(this.meals).find(key => key === "none") : this.selectedMeal;
        } else if (itemType === "bed") {
            const sameBedItem = this.selectedBedItem === itemId;
            this.selectedBedItem = sameBedItem ? null : itemId;
            this.selectedBed = sameBedItem ? this.selectedBed : Object.keys(this.beds).find(key => key === "none");
        }

        // Re-render to reflect changes
        this.render();
    }
}