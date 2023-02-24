import {Pl1eTrade} from "./trade.mjs";
import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eItem} from "../documents/item.mjs";
import {PL1E} from "./config.mjs";

export class Pl1eEvent {

    /**
     * Apply listeners to chat messages.
     * @param {html} html  Rendered chat message.
     */
    static chatListeners(html) {
        html.on("click", ".card-buttons button", this.onChatCardAction.bind(this));
        // html.on("click", ".item-name", this._onChatCardToggleContent.bind(this));
    }

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
     * Open item sheet
     * @param event The originating click event
     * @param {Actor|Item} document the document of the item
     */
    static onItemEdit(event, document) {
        const itemId = $(event.currentTarget).data("item-id");
        if (document instanceof Actor) {
            const item = document.items.get(itemId);
            item.sheet.render(true);
        }
        if (document instanceof Item) {
            const item = document.getEmbedItem(itemId);
            if (item) {
                item.sheet.render(true);
            }
        }
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
        const itemId = $(event.currentTarget).data("item-id");
        if (document instanceof Actor) {
            const parentItem = document.items.get(itemId);
            for (let item of document.items) {
                if (parentItem === item || item.system.childId === undefined) continue;
                if (parentItem.system.parentId !== item.system.childId) continue;
                item.delete();
            }
            await parentItem.delete();
        }
        if (document instanceof Item) {
            const item = document.getEmbedItem(itemId);
            if (!item) return;
            for (let [key, value] of document.system.subItemsMap) {
                if (value === item) continue;
                if (value.system.childId === undefined) continue;
                if (value.system.childId !== item.system.parentId) continue;
                await document.deleteEmbedItem(value._id);
            }
            await document.deleteEmbedItem(itemId);
        }
    }

    /**
     * Toggle an ability
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor where the ability is toggle
     */
    static async onToggleAbility(event, actor) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);

        if (!item.system.isMemorized && actor.system.attributes.slots - item.system.attributes.level.value < 0) return;

        // Toggle ability
        await item.update({
            ["system.isMemorized"]: !item.system.isMemorized
        });
    }

    /**
     * Use an ability
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor where the ability is used
     */
    static async onUseAbility(event, actor) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);

        await item.use();
    }

    /**
     * Handle toggling the state of an Owned Weapon within the Actor.
     * @param {Event} event The triggering click event.
     * @param {Actor} actor the actor where the weapon is toggle
     */
    static async onToggleWeapon(event, actor) {
        event.preventDefault();
        const main = $(event.currentTarget).data("main");
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);
        await item.toggleWeapon(main, actor);
    }

    /**
     * Handle toggling the state of an Owned Wearable within the Actor.
     * @param {Event} event The triggering click event.
     * @param {Actor} actor the actor where the wearable is toggle
     */
    static async onToggleWearable(event, actor) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);
        await item.toggleWearable(actor);
    }



    /**
     * Handle use of an Owned Consumable within the Actor.
     * @param {Event} event The triggering click event.
     * @param {Actor} actor the actor where the consumable is used
     */
    static async onUseConsumable(event, actor) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);
        await item.useConsumable(actor);
    }

    /**
     * Handle reload of an Owned Consumable within the Actor.
     * @param {Event} event The triggering click event.
     * @param {Actor} actor the actor where the consumable is reloaded
     */
    static async onReloadConsumable(event, actor) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);

        // Reset removed uses
        await item.update({
            ["system.removedUses"]: 0
        });
    }

    /**
     * Handle characteristics changes
     * @param {Event} event The originating click event
     * @param {ActorSheet} actorSheet the actor sheet to modify
     */
    static async onCharacteristicChange(event, actorSheet) {
        event.preventDefault();
        event.stopPropagation();

        const characteristic = $(event.currentTarget).data("characteristic");
        let value = $(event.currentTarget).data("value");
        if (!value || !characteristic) return;

        let remaining = actorSheet.actor.system.attributes.remainingCharacteristics;
        if (remaining === 0 && value > 0) return;

        let oldValue = actorSheet.actor.system.characteristics[characteristic].base;
        let newValue = oldValue + value;

        if (newValue < 2 || newValue > 5) return;

        await actorSheet.actor.update({
            ["system.characteristics." + characteristic + ".base"]: newValue,
            ["system.attributes.remainingCharacteristics"]: remaining - value
        });

        actorSheet.render(false);
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
            let oldValue = document.system.money[currency].value;
            await document.update({
                ["system.money." + currency + ".value"]: oldValue + value
            });
        }
        if (document instanceof Item) {
            let oldValue = document.system.price[currency].value;
            await document.update({
                ["system.price." + currency + ".value"]: oldValue + value
            });
        }
    }

    /**
     * Handle currency conversion
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor to modify
     */
    static async onCurrencyConvert(event, actor) {
        event.preventDefault();
        event.stopPropagation();
        let units = Pl1eHelpers.currencyToUnits(actor.system.money);
        await actor.update({
            ["system.money"]: Pl1eHelpers.unitsToCurrency(units)
        });
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     * @param {ActorSheet} actorSheet the actor sheet to modify
     */
    static async onRankChange(event, actorSheet) {
        event.preventDefault();
        event.stopPropagation();
        const skill = $(event.currentTarget).data("skill");
        if (!skill) return;
        let oldValue = actorSheet.actor.system.skills[skill].rank;
        let maxRank = actorSheet.actor.system.attributes.maxRank;
        let newValue = oldValue + 1;
        if (newValue > maxRank || actorSheet.actor.system.attributes.ranks - newValue < 0) {
            if (actorSheet.actor.system.attributes.creationMod) newValue = 1;
            else return;
        }
        await actorSheet.actor.update({
            ["system.skills." + skill + ".rank"]: newValue
        });
        actorSheet.render(false);
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
     * Enable an attribute with apply
     * @param {Event} event The originating click event
     * @param {Item} item the item where the attribute is added
     */
    static async onAttributeAdd(event, item) {
        event.preventDefault();
        event.stopPropagation();
        let attribute = $(event.currentTarget).data("attribute");
        const dynamicAttribute = PL1E.optionalAttributesValues[attribute];
        await item.update({
            ["system.optionalAttributes." + randomID()]: dynamicAttribute
        });
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
            ["system.optionalAttributes.-=" + attributeId]: null
        });
    }

    /**
     * Handle execution of a chat card action via a click event on one of the card buttons
     * @param {Event} event       The originating click event
     * @returns {Promise}         A promise which resolves once the handler workflow is complete
     * @private
     */
    static async onChatCardAction(event) {
        event.preventDefault();

        // Extract card data
        const button = event.currentTarget;
        button.disabled = true;
        let action = $(event.currentTarget).data("action");
        let itemId = $(event.currentTarget).data("item-id");

        const item = await fromUuid<Pl1eItem>(itemId);
        await item.actionAbility(action);

        // Re-enable the button
        button.disabled = false;
    }

    static async

}