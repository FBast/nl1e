import {Pl1eTrade} from "./trade.mjs";
import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eItem} from "../documents/item.mjs";

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
     * Handle clickable rolls.
     * @param {Event} event The originating click event
     * @param {Actor} actor the rolling actor
     */
    static onRoll(event, actor) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle item rolls.
        if (dataset.rollType) {
            if (dataset.rollType === 'item') {
                const itemId = element.closest('.item').dataset.itemId;
                const item = actor.items.get(itemId);
                if (item) return item.roll();
            }
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[ability] ${dataset.label}` : '';
            let roll = new Roll(dataset.roll, actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor: actor}),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
            });
            return roll;
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

        let item = game.items.find(item => item.uuid === itemUuid);
        if (item) item.sheet.render(true);
    }

    /**
     * Toggle an ability
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor which own the item
     */
    static async onItemToggle(event, actor) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);

        const options = {
            actor: actor
        };
        const main = $(event.currentTarget).data("main");
        if (main) options["main"] = main;

        await item.toggle(options);
    }

    /**
     * Buy item
     * @param {Event} event The originating click event
     * @param {Actor} actor the merchant of the item
     */
    static async onItemBuy(event, actor) {
        const itemId = $(event.currentTarget).data("item-id");
        const item = actor.items.get(itemId);
        if (game.user.character === null) return;
        await Pl1eTrade.buyItem(item, game.user.character, actor);
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
     * Handle deletion of item
     * @param {Event} event The originating click event
     * @param {Actor|Item} document the document where the item is deleted
     */
    static async onItemDelete(event, document) {
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const itemUuid = $(event.currentTarget).closest(".item").data("item-uuid");

        // Remove subItems from actor
        if (document instanceof Actor && itemId) {
            const parentItem = document.items.get(itemId);
            for (let item of document.items) {
                if (parentItem === item || item.system.childId === undefined) continue;
                if (parentItem.system.parentId !== item.system.childId) continue;
                item.delete();
            }
            await parentItem.delete();
        }
        // Remove refItem from item
        else if (document instanceof Pl1eItem) {
            let index = -1;
            if (itemId) index = document.system.refItemsId.indexOf(itemId);
            else if (itemUuid) index = document.system.refItemsUuid.indexOf(itemUuid);
            if (index > -1) {
                document.system.refItems.splice(index, 1);
                document.system.refItemsUuid.splice(index, 1);
                document.system.refItemsId.splice(index, 1);
                await document.update({
                    "system.refItems": document.system.refItems,
                    "system.refItemsUuid": document.system.refItemsUuid,
                    "system.refItemsId": document.system.refItemsId
                });
            }
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
                let id = $(resource).data("id");
                if (!resources.includes(id)) continue;
                resource.classList.add('highlight-green');
            }
        }
        // characteristics
        if (characteristics !== undefined) {
            for (let characteristic of document.getElementsByClassName('characteristic-label')) {
                let id = $(characteristic).data("id");
                if (!characteristics.includes(id)) continue;
                characteristic.classList.add('highlight-green');
            }
        }
        // skills
        if (skills !== undefined) {
            for (let skill of document.getElementsByClassName('skill-label')) {
                let id = $(skill).data("id");
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
     * Add a dynamic attribute to the item
     * @param {Event} event The originating click event
     * @param {Pl1eItem} item the item where the attribute is added
     */
    static async onAttributeAdd(event, item) {
        event.preventDefault();
        event.stopPropagation();
        let attributeId = $(event.currentTarget).data("attribute");

        const itemData = {
            name: "Increase",
            type: "increase"
        }

        const attributeItem = await Item.create(itemData);

        await item.addSubItem(attributeItem);
    }

    /**
     * Disable an attribute with apply
     * @param {Event} event The originating click event
     * @param {Item} item the item where the attribute is removed
     */
    static async onAttributeRemove(event, item) {
        event.preventDefault();
        event.stopPropagation();
        let attributeId = $(event.currentTarget).data("attribute");
        await item.update({
            ["system.dynamicAttributes.-=" + attributeId]: null
        });
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
    static async onItemClick(event) {
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

}