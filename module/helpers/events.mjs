import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eItem} from "../documents/item.mjs";
import {Pl1eActor} from "../documents/actor.mjs";
import {Pl1eChat} from "./chat.mjs";

export class Pl1eEvent {

    /**
     * Handle clickable rolls.
     * @param {Event} event The originating click event
     * @param {Actor} actor the rolling actor
     */
    static async onSkillRoll(event, actor) {
        event.preventDefault();

        const skillId = $(event.currentTarget).closest(".skill").data("skillId");
        await Pl1eChat.skillRoll(actor, skillId);
    }

    /**
     * Open token sheet
     * @param event The originating click event
     */
    static async onTokenEdit(event) {
        const tokenId = $(event.currentTarget).data("token-id");
        const token = await Pl1eHelpers.getDocument("Token", tokenId);

        if (token === undefined) throw new Error("PL1E | no token found");

        token.actor.sheet.renderOnTop();
    }

    /**
     * Open actor sheet
     * @param event The originating click event
     */
    static async onActorEdit(event) {
        const actorId = $(event.currentTarget).closest(".item").data("actor-id");
        const actor = await Pl1eHelpers.getDocument("Actor", actorId);

        actor.sheet.renderOnTop();
    }

    /**
     * Open item sheet
     * @param event The originating click event
     * @param {Actor|Item} document the document of the item
     */
    static async onItemEdit(event, document) {
        let itemId = $(event.currentTarget).closest(".item").data("item-id");
        if (itemId === undefined) itemId = $(event.currentTarget).data("item-id");
        if (itemId === undefined) throw new Error("PL1E | no itemId found");

        if (document === undefined) {
            const tokenId = $(event.currentTarget).data("token-id");
            const token = await Pl1eHelpers.getDocument("Token", tokenId);
            if (token !== undefined) document = token.actor;
        }
        if (document === undefined) throw new Error("PL1E | no document found");

        let item;
        if (document instanceof Pl1eActor)
            item = document.items.get(itemId);
        else if (document instanceof Pl1eItem) {
            item = await Pl1eHelpers.getDocument("Item", itemId);
        }

        item.sheet.renderOnTop();
    }

    /**
     * Toggle an ability
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor which own the item
     */
    static async onItemToggle(event, actor) {
        event.preventDefault();
        const itemId = $(event.currentTarget).closest(".item").data("item-id");

        /** @type {Pl1eItem} */
        const item = actor.items.get(itemId);
        let options = {};
        const main = $(event.currentTarget).data("main");
        if (main) options["main"] = main;

        await item.toggle(options);
    }

    /**
     * Buy item
     * @param {Event} event The originating click event
     * @param {Pl1eActor} actor the merchant of the item
     */
    static async onItemBuy(event, actor) {
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = actor.items.get(itemId);

        if (!Pl1eHelpers.isGMConnected()) {
            ui.notifications.warn(game.i18n.localize("PL1E.NoGMConnected"));
            return;
        }

        // Player transfer item to a not owned actor
        CONFIG.PL1E.socket.executeAsGM('sendItem', {
            sourceActorId: actor._id,
            targetActorId: game.user.character._id,
            itemId: item._id
        });
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor where the item is created
     */
    static async onItemCreate(event, actor) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system["type"];

        // Finally, create the item!
        return await Item.create(itemData, {parent: actor});
    }

    /**
     * Handle remove of item
     * @param {Event} event The originating click event
     * @param {Actor|Item} document the document where the item is removed
     */
    static async onItemRemove(event, document) {
        const itemId = $(event.currentTarget).closest(".item").data("item-id");

        // Remove embedded items from actor
        if (document instanceof Pl1eActor && itemId) {
            const item = document.items.get(itemId);
            await document.removeItem(item);
        }
        // Remove refItem from item
        else if (document instanceof Pl1eItem && itemId) {
            const item = await Pl1eHelpers.getDocument("Item", itemId);
            if (item) await document.removeRefItem(item);
        }

        document.sheet.render(document.sheet.rendered);
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
     * Handle money conversion
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor to modify
     */
    static async onMoneyConvert(event, actor) {
        event.preventDefault();
        event.stopPropagation();
        let units = Pl1eHelpers.moneyToUnits(actor.system.money);
        await actor.update({
            ["system.money"]: Pl1eHelpers.unitsToMoney(units)
        });
    }

    /**
     * Create highlights
     * @param {Event} event The originating mouseenter event
     *
     */
    static onCreateHighlights(event) {
        event.preventDefault();
        event.stopPropagation();
        let resources = $(event.currentTarget).data("resources");
        let characteristics = $(event.currentTarget).data("characteristics");
        let skills = $(event.currentTarget).data("skills");
        // resources
        if (resources !== undefined) {
            for (let resource of document.getElementsByClassName('resource-label')) {
                let id = $(resource).closest(".resource").data("resource-id");
                if (!resources.includes(id)) continue;
                resource.classList.add('highlight-green');
            }
        }
        // characteristics
        if (characteristics !== undefined) {
            for (let characteristic of document.getElementsByClassName('characteristic-label')) {
                let id = $(characteristic).closest(".characteristic").data("characteristic-id");
                if (!characteristics.includes(id)) continue;
                characteristic.classList.add('highlight-green');
            }
        }
        // skills
        if (skills !== undefined) {
            for (let skill of document.getElementsByClassName('skill-label')) {
                let id = $(skill).closest(".skill").data("skill-id");
                if (!skills.includes(id)) continue;
                skill.classList.add('highlight-green');
            }
        }
    }

    /**
     * Remove highlights
     * @param {Event} event The originating mouseexit event
     */
    static onRemoveHighlights(event) {
        event.preventDefault();
        event.stopPropagation();
        for (let characteristic of document.getElementsByClassName('characteristic-label')) {
            characteristic.classList.remove('highlight-green')
        }
        for (let resource of document.getElementsByClassName('resource-label')) {
            resource.classList.remove('highlight-green')
        }
        for (let skill of document.getElementsByClassName('skill-label')) {
            skill.classList.remove('highlight-green')
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
        let actorId = $(event.currentTarget).data("token-id");

        const token = await Pl1eHelpers.getDocument("Token", actorId);
        const item = token.actor.items.get(itemId);

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
        const itemId = item.data("item-id");
        const tooltipState = $(tooltip).hasClass('expanded') ? 'open' : 'closed';
        localStorage.setItem(`tooltipState_${itemId}`, tooltipState);
    }

}