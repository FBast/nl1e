import {Pl1eHelpers as pl1eHelpers, Pl1eHelpers} from "../helpers/helpers.mjs";
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
        this.rest = Pl1eHelpers.getConfig("rest");
        this.meals = pl1eHelpers.getConfig("meals");

        // Initialize selections with options or defaults
        this.selectedEnvironment = options.selectedEnvironment || Object.keys(this.rest).find(key => key === "normal");
        this.selectedRest = options.selectedRest || Object.keys(this.rest).find(key => key === "none");
        this.selectedMeal = options.selectedMeal || Object.keys(this.meals).find(key => key === "none");
        this.selectedRestItems = [];
        this.selectedMealItems = [];

        // Initialize effects
        this.effects = [];

        // Bind the renderActorSheet hook
        this._bindRenderActorHook();
    }

    /** Bind to the renderActorSheet hook */
    _bindRenderActorHook() {
        Hooks.on("renderActorSheet", (app, html, data) => {
            if (app.actor === this.actor) {
                this.render();
            }
        });
    }

    /** Cleanup hooks when the form is closed */
    async close(options) {
        Hooks.off("renderActorSheet", this._bindRenderActorHook);
        return super.close(options);
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
        data.rest = this.rest;
        data.meals = this.meals;

        data.selectedEnvironment = this.selectedEnvironment;
        data.selectedRest = this.selectedRest;
        data.selectedMeal = this.selectedMeal;
        data.selectedRestItems = this.selectedRestItems;
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
                    const value = clickedItem.data("value");
                    this[stateProperty] = value;

                    // Reset the related item property to null
                    if (relatedItemProperty && value !== "none")
                        this[relatedItemProperty] = Array.isArray(this[relatedItemProperty]) ? [] : null;

                    // Re-render to update the UI with the new selections
                    this.render();
                });
            });
        };

        // Handle toggles for bed and meal groups
        handleToggleGroup(".environment-toggle", "selectedEnvironment");
        handleToggleGroup(".rest-toggle", "selectedRest", "selectedRestItems");
        handleToggleGroup(".meal-toggle", "selectedMeal", "selectedMealItems");

        // Handle item selection
        html.find(".item-select").on("click", ev => this._onItemSelect(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.actor));
        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find('.confirm-rest').on('click', async ev => this._onConfirmRest(ev));
        html.find('.cancel-rest').on('click', async ev => await this.close());
    }

    updateEffects() {
        const baseEffects = {
            "health": 0,
            "stamina": -10,
            "mana": -10
        };

        // Retrieve items if IDs are set
        const mealItems = this.selectedMealItems.map(itemId => this.actor.items.get(itemId));
        const restItems = this.selectedRestItems.map(itemId => this.actor.items.get(itemId));

        // Access attributes from selectedMeal and selectedRest
        const environment = this.selectedEnvironment ? this.environments[this.selectedEnvironment] : null;
        const meal = this.selectedMeal ? this.meals[this.selectedMeal] : null;
        const rest = this.selectedRest ? this.rest[this.selectedRest] : null;

        // Calculate effects for health, stamina, and mana
        const effects = ["health", "stamina", "mana"].map(attr => {
            const max = this.actor.system.resources[attr]?.max || 0;
            const value = this.actor.system.resources[attr]?.value || 0;

            // Modifier is the total change to be applied
            const modifier =
                (baseEffects[attr]) +
                (environment?.effects[attr] || 0) +
                (meal?.effects[attr] || 0) +
                mealItems.reduce((sum, item) => sum + (item?.system.attributes[`${attr}Rest`] || 0), 0) +
                (rest?.effects[attr] || 0) +
                restItems.reduce((sum, item) => sum + (item?.system.attributes[`${attr}Rest`] || 0), 0);

            // Calculate adjusted prediction values
            const predictedValue = Math.min(max, Math.max(0, value + modifier)); // Value after applying modifier
            const normalPercentage = max > 0 ? (value / max) * 100 : 0; // Width of the current bar
            const predictionPercentage = max > 0 ? (Math.abs(predictedValue - value) / max) * 100 : 0; // Width of the prediction bar
            const predictionStart = modifier > 0
                ? normalPercentage // For positive modifiers, start at current value
                : Math.max(0, (predictedValue / max) * 100); // For negative modifiers, adjust start position

            const config = Pl1eHelpers.getConfig("resources", attr);

            return {
                label: config.label,
                modifier: modifier, // The raw value being added or subtracted
                icon: config.icon,
                value: value, // Current value
                max: max, // Maximum value
                percentage: normalPercentage, // Width of the current bar
                attr: attr,
                prediction: predictedValue, // Predicted future value
                predictionStart: predictionStart, // Start position of the prediction bar
                predictionPercentage: predictionPercentage // Width of the prediction bar
            };
        });

        // Store calculated effects
        this.effects = effects;
    }

    _onItemSelect(ev) {
        const clickedElement = $(ev.currentTarget);
        const itemId = clickedElement.closest(".item").data("item-id");
        const item = this.actor.items.get(itemId); // Retrieve the selected item
        const itemType = item.system.attributes.commonType; // Determine the item's type (food/rest)

        if (itemType === "food") {
            const isAlreadySelected = this.selectedMealItems.includes(itemId);

            if (isAlreadySelected) {
                // Remove the item if it's already selected
                this.selectedMealItems = this.selectedMealItems.filter(id => id !== itemId);
            } else {
                // Add the new item, and remove the first if exceeding 3 items
                if (this.selectedMealItems.length > 2) {
                    this.selectedMealItems.pop();
                }
                this.selectedMealItems.push(itemId);
            }

            // Clear selectedMeal if items are selected
            this.selectedMeal = this.selectedMealItems.length ?
                Object.keys(this.meals).find(key => key === "none") : this.selectedMeal;
        }
        else if (itemType === "rest") {
            const isAlreadySelected = this.selectedRestItems.includes(itemId);

            if (isAlreadySelected) {
                // Remove the item if it's already selected
                this.selectedRestItems = this.selectedRestItems.filter(id => id !== itemId);
            } else {
                // Add the new item, and remove the first if exceeding 3 items
                this.selectedRestItems.push(itemId);
            }

            // Clear selectedMeal if items are selected
            this.selectedRest = this.selectedRestItems.length ?
                Object.keys(this.rest).find(key => key === "none") : this.selectedRest;
        }

        // Re-render to reflect changes
        this.render();
    }

    /**
     * Confirm the rest
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onConfirmRest(event) {
        event.preventDefault();

        const updates = {};

        // Iterate over the calculated effects and apply modifiers
        for (const effect of this.effects) {
            updates[`system.resources.${effect.attr}.value`] = effect.prediction;
        }

        // Apply all resource updates in a single call
        await this.actor.update(updates);

        // Remove used meal items from the actor's inventory
        if (this.selectedMealItems.length > 0) {
            for (const mealItemId of this.selectedMealItems) {
                const mealItem = this.actor.items.get(mealItemId);
                if (mealItem) await mealItem.delete();
            }

            // Clear the selectedMealItems after processing
            this.selectedMealItems = [];
        }

        // Close the form after confirming the rest
        await this.close();
    }
}