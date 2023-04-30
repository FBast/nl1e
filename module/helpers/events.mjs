import {Pl1eItem} from "../documents/item.mjs";
import {Pl1eActor} from "../documents/actor.mjs";

export class Pl1eEvent {

    /**
     * Manage Active Effect instances through the Actor Sheet via effect control buttons.
     * @param {MouseEvent} event      The left-click event on the effect control
     * @param {Actor|Item} owner      The owning document which manages this effect
     */
    static onManageActiveEffect(event, owner) {
        event.preventDefault();
        const a = event.currentTarget;
        const li = a.closest("li");
        const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
        switch (a.dataset.action) {
            case "create":
                return owner.createEmbeddedDocuments("ActiveEffect", [{
                    label: "New Effect",
                    icon: "icons/svg/aura.svg",
                    origin: owner.uuid,
                    "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
                    disabled: li.dataset.effectType === "inactive"
                }]);
            case "edit":
                return effect.sheet.render(true);
            case "delete":
                return effect.delete();
            case "toggle":
                return effect.update({disabled: !effect.disabled});
        }
    }

    /**
     * Open actor sheet
     * @param event The originating click event
     */
    static async onActorEdit(event) {
        const tokenId = $(event.currentTarget).data("token-id");
        const tokenDocument = await fromUuid(tokenId);

        if (tokenDocument) tokenDocument.actor.sheet.render(true);
    }

    /**
     * Open item sheet
     * @param event The originating click event
     * @param {Actor|Item} document the document of the item
     */
    static async onItemEdit(event, document) {
        const itemUuid = $(event.currentTarget).closest(".item").data("item-uuid");
        const itemId = $(event.currentTarget).closest(".item").data("item-id");

        let item;
        if (itemId && document instanceof Pl1eActor)
            item = document.items.get(itemId);
        else if (itemUuid) {
            item = game.items.find(item => item.uuid === itemUuid);
        }
        if (item) item.sheet.render(true);
    }

    /**
     * Handle currency changes
     * @param {Event} event The originating click event
     * @param {Actor|Item} document the document to modify
     */
    static async onCurrencyChange(event, document) {
        event.preventDefault();
        event.stopPropagation();
        const currency = $(event.currentTarget).data("currency");
        let value = $(event.currentTarget).data("value");
        if (!value || !currency) return;
        if (document instanceof Actor) {
            let oldValue = document.system.money[currency];
            await document.update({
                ["system.money." + currency]: oldValue + value
            });
        }
        if (document instanceof Item) {
            let oldValue = document.system.price[currency];
            await document.update({
                ["system.price." + currency]: oldValue + value
            });
        }
    }

    /**
     * Handle execution of a chat card action via a click event on one of the card buttons
     * @param {Event} event       The originating click event
     * @returns {Promise}         A promise which resolves once the handler workflow is complete
     */
    static async onChatCardAction(event) {
        event.preventDefault();

        // Extract card data
        let action = $(event.currentTarget).data("action");
        let itemId = $(event.currentTarget).data("item-id");

        /**
         * @type {Pl1eItem}
         */
        const item = await fromUuid(itemId);

        const options = {
            action: action
        }
        await item.apply(options);

        // Remove all buttons
        const cardButtons = $(event.currentTarget).closest(".card-buttons");
        cardButtons.remove();
    }

    /**
     * Handle clicking of dice tooltip buttons
     * @param {Event} event
     */
    static async onItemTooltip(event) {
        event.preventDefault();
        event.stopPropagation();

        const item = $(event.currentTarget).closest(".item");

        // Check if tooltip associated
        const tooltip = item.find(".item-tooltip");
        if (tooltip === undefined) return;

        $(tooltip).slideToggle(200);
        $(tooltip).toggleClass('expanded');

        // Store open/closed state in localStorage
        const itemId = item.attr("data-item-id");
        const tooltipState = $(tooltip).hasClass('expanded') ? 'open' : 'closed';
        localStorage.setItem(`tooltipState_${itemId}`, tooltipState);
    }

    static onHandleTooltipState(app, html, data) {
        const tooltips = html.find('.item-tooltip');
        tooltips.each(function() {
            const tooltip = $(this);
            const item = $(tooltip).closest(".item");

            // Check if tooltip associated
            if (tooltip === undefined) return;

            // Check if the tooltip state is in local storage
            const itemId = item.attr("data-item-id");
            const tooltipState = localStorage.getItem(`tooltipState_${itemId}`);

            // If the tooltip state is in local storage, show/hide the tooltip accordingly
            if (tooltipState !== null && tooltipState === "open") {
                $(tooltip).show();
                $(tooltip).toggleClass('expanded');
            }
        });
    }

}