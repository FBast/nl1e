export function PL1ESheetMixin(Base) {
    return class extends Base {
        constructor(...args) {
            super(...args);
            this.persistedState = {}; // Stores UI state (tooltips, etc.)
        }

        /** @override */
        activateListeners(html) {
            super.activateListeners(html);

            // Register a hook that listens for when this sheet re-renders
            const sheetType = this.constructor.name;
            Hooks.on(`render${sheetType}`, (app, html) => {
                if (app.id === this.id) { // Ensure we're restoring state only for this sheet
                    this._restoreSheetState($(html));
                }
            });
        }

        /**
         * Override render() to store tooltips before rendering.
         * This ensures tooltips stay open after `update()`.
         * @override
         */
        async render(force = false, options = {}) {
            this._storeSheetState(); // Save tooltip state before rendering
            await super.render(force, options); // Let Foundry re-render
        }

        /**
         * Hook into Foundry's update system for manual form updates.
         * Ensures that tooltips remain open when saving a form.
         * @override
         */
        async _updateObject(event, formData) {
            this._storeSheetState(); // Save tooltip state before updating
            await super._updateObject(event, formData); // Let Foundry update
        }

        /**
         * Store the current UI state before rendering.
         */
        _storeSheetState() {
            this.persistedState.openTooltips = new Set();

            // Store all currently expanded tooltips
            this.element.find(".item-tooltip.expanded").each((_, el) => {
                const itemId = $(el).closest(".item").data("item-id");
                if (itemId) this.persistedState.openTooltips.add(itemId);
            });

            console.log("Stored tooltips:", this.persistedState.openTooltips); // Debugging
        }

        /**
         * Restore the UI state after rendering.
         * @param {JQuery} html - The updated sheet element
         */
        _restoreSheetState(html) {
            html.find(".item").each((_, el) => {
                const itemId = $(el).data("item-id");
                if (this.persistedState.openTooltips.has(itemId)) {
                    let tooltip = $(el).find(".item-tooltip");

                    console.log("Restoring tooltip:", tooltip); // Debugging

                    tooltip.addClass("expanded")
                        .css({ display: "block" })
                        .slideDown(200); // Smooth transition
                }
            });
        }
    };
}