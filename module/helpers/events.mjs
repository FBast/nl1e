import {TradePL1E} from "./trade.mjs";
import {PL1E} from "./config.mjs";

export class EventPL1E {

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
        await TradePL1E.buyItem(item, game.user.character, actor);
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
     * Handle toggling the state of an Owned Weapon within the Actor.
     * @param {Event} event The triggering click event.
     * @param {Actor} actor the actor where the weapon is toggle
     */
    static async onToggleWeapon(event, actor) {
        event.preventDefault();
        const main = $(event.currentTarget).data("main");
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = actor.items.get(itemId);
        const hands = item.system.attributes.hands.value;

        // Toggle item hands
        if (hands === 2) {
            await item.update({
                ["system.isEquippedMain"]: !foundry.utils.getProperty(item, "system.isEquippedMain"),
                ["system.isEquippedSecondary"]: !foundry.utils.getProperty(item, "system.isEquippedSecondary")
            });
        } else if (main) {
            // Switch hand case
            if (!item.system.isEquippedMain && item.system.isEquippedSecondary) {
                await item.update({["system.isEquippedSecondary"]: false});
            }
            await item.update({["system.isEquippedMain"]: !foundry.utils.getProperty(item, "system.isEquippedMain")})
        } else {
            // Switch hand case
            if (!item.system.isEquippedSecondary && item.system.isEquippedMain) {
                await item.update({["system.isEquippedMain"]: false});
            }
            await item.update({["system.isEquippedSecondary"]: !foundry.utils.getProperty(item, "system.isEquippedSecondary")});
        }
        // Unequip other items
        for (let otherItem of actor.items) {
            // Ignore if otherItem is not a weapon
            if (otherItem.type !== 'weapon') continue;
            // Ignore if otherItem is item
            if (otherItem === item) continue;
            // If other item is equipped on main and this item is equipped on main
            if (otherItem.system.isEquippedMain && item.system.isEquippedMain) {
                // If other item is equipped on two hands
                if (otherItem.system.attributes.hands.value === 2) {
                    await otherItem.update({
                        ["system.isEquippedMain"]: false,
                        ["system.isEquippedSecondary"]: false
                    });
                }
                // Else other item only equip main hand
                else {
                    await otherItem.update({
                        ["system.isEquippedMain"]: false
                    });
                }
            }
            // If other item is equipped on secondary and this item is equipped on secondary
            if (otherItem.system.isEquippedSecondary && item.system.isEquippedSecondary) {
                // If other item is equipped on two hands
                if (otherItem.system.attributes.hands.value === 2) {
                    await otherItem.update({
                        ["system.isEquippedMain"]: false,
                        ["system.isEquippedSecondary"]: false
                    });
                }
                // Else other item only equip secondary hand
                else {
                    await otherItem.update({
                        ["system.isEquippedSecondary"]: false
                    });
                }
            }
        }
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
        const slot = item.system.attributes.slot.value;
        // Ignore if not using a slot
        if (!['clothes', 'armor', 'ring', 'amulet'].includes(slot)) return;
        // Toggle item slot
        await item.update({
            ["system.isEquipped"]: !foundry.utils.getProperty(item, "system.isEquipped"),
        });
        // If unequipped then return
        if (!item.system.isEquipped) return;
        let ringCount = 1;
        // Unequip other items
        for (let otherItem of actor.items) {
            // Ignore if otherItem is not a wearable
            if (otherItem.type !== 'wearable') continue;
            // Ignore if otherItem is item
            if (otherItem === item) continue;
            // Count same items slot
            if (otherItem.system.isEquipped && otherItem.system.attributes.slot.value === slot) {
                // Unequipped immediately if clothes, armor or amulet
                if (['clothes', 'armor', 'amulet'].includes(slot)) {
                    await otherItem.update({
                        ["system.isEquipped"]: false
                    });
                }
                // Count equipped rings if ring
                else if (['ring'].includes(slot)) {
                    if (ringCount >= 2) {
                        await otherItem.update({
                            ["system.isEquipped"]: false
                        });
                    }
                    else {
                        ringCount++;
                    }
                }
            }
        }
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
        const attributes = PL1E.attributes;

        // Removed one use
        await item.update({
            ["system.removedUses"]: foundry.utils.getProperty(item, "system.removedUses") + 1,
        });

        // Launch consumable effect
        for (let [id, attribute] of Object.entries(item.system.attributes)) {
            if (!attribute.apply || attributes[id]["path"] === undefined) continue;
            if (attributes[id]["operator"] === 'set') {
                foundry.utils.setProperty(actor.system, attributes[id]["path"], attribute.value);
            }
            else if (attributes[id]["operator"] === 'push') {
                let currentValue = foundry.utils.getProperty(actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(attribute.value);
                foundry.utils.setProperty(actor.system, attributes[id]["path"], currentValue);
            }
            else if (attributes[id]["operator"] === 'add') {
                let currentValue = foundry.utils.getProperty(actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = 0;
                await actor.update({
                    ["system." + attributes[id]["path"]]: currentValue + attribute.value
                });
            }
        }

        // The item have no more uses and is not reloadable
        if (item.system.removedUses >= item.system.attributes.uses.value && !item.system.attributes.reloadable.value) {
            await item.delete();
        }
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

        const element = $(event.currentTarget);
        const characteristic = element.data("characteristic");
        let value = element.data("value");
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
        const element = $(event.currentTarget);
        const currency = element.data("currency");
        let value = element.data("value");
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
     * Handle rank changes
     * @param {Event} event The originating click event
     * @param {ActorSheet} actor the actor sheet to modify
     */
    static async onRankChange(event, actorSheet) {
        event.preventDefault();
        event.stopPropagation();
        const element = $(event.currentTarget);
        const skill = element.data("skill");
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

}