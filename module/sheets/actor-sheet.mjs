import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import {PL1E} from "../helpers/config.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class Pl1eActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pl1e", "sheet", "actor"],
            template: "systems/pl1e/templates/actor/actor-sheet.hbs",
            width: 700,
            height: 820,
            scrollY: [
                ".stats",
                ".features",
                ".items",
                ".effects"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}]
        });
    }

    /** @override */
    get template() {
        return `systems/pl1e/templates/actor/actor-${this.actor.type}-sheet.hbs`;
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        // Retrieve the data structure from the base sheet. You can inspect or log
        // the context variable to see the structure, but some key properties for
        // sheets are the actor object, the data object, whether or not it's
        // editable, the items array, and the effects array.
        const context = super.getData();

        // Use a safe clone of the actor data for further operations.
        const actorData = this.actor.toObject(false);

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = actorData.system;
        context.flags = actorData.flags;
        context.items = actorData.items;

        // Prepare character data and items.
        if (actorData.type === 'character') {
            this._prepareItems(context);
        }

        // Prepare NPC data and items.
        if (actorData.type === 'npc') {
            this._prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.actor.effects);

        // Add the config data
        context.config = PL1E;

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Render the item sheet for viewing/editing prior to the editable check.
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // -------------------------------------------------------------
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Add Inventory Item
        html.find('.item-create').click(this._onItemCreate.bind(this));

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const parentItem = this.actor.items.get(li.data("itemId"));
            for (let item of this.actor.items) {
                if (parentItem === item || item.system.childId === undefined) continue;
                if (parentItem.system.parentId !== item.system.childId) continue;
                item.delete();
            }
            parentItem.delete();
            li.slideUp(200, () => this.render(false));
        });

        // Active Effect management
        html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

        // Rollable characteristic.
        html.find('.rollable').click(this._onRoll.bind(this));

        // Custom objects
        html.find('.characteristic-control').click(this._onCharacteristicChange.bind(this));
        html.find('.currency-control').click(this._onCurrencyChange.bind(this));

        // Items management
        html.find(".weapon-toggle").click(this._onToggleWeapon.bind(this));
        html.find(".wearable-toggle").click(this._onToggleWearable.bind(this));
        html.find(".consumable-toggle").click(this._onUseConsumable.bind(this));
        html.find(".consumable-reload").click(this._onReloadConsumable.bind(this));

        // Highlights indications
        html.find('.resource-label,.characteristic-label,.skill-label').mouseenter(this._onCreateHighlights.bind(this));
        html.find('.resource-label,.characteristic-label,.skill-label').mouseleave(this._onRemoveHighlights.bind(this));

        // Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            html.find('li.item').each((i, li) => {
                if (li.classList.contains("inventory-header")) return;
                li.setAttribute("draggable", true);
                li.addEventListener("dragstart", handler, false);
            });
        }
    }

    /**
     * Handle sub items to be added as other items
     * @param event
     * @param data
     * @returns {Promise<unknown>}
     * @private
     */
    async _onDropItem(event, data) {
        if ( !this.actor.isOwner ) return false;
        const item = await Item.implementation.fromDropData(data);
        const itemData = item.toObject();
        const newItem = await this._onDropItemCreate(item);
        if (itemData.system.subItemsMap !== undefined && itemData.system.subItemsMap.length > 0) {
            let linkedId = randomID();
            await newItem[0].update({'system.parentId': linkedId});
            for (let subItem of itemData.system.subItemsMap) {
                const newSubItem = await this._onDropItemCreate(subItem);
                await newSubItem[0].update({'system.childId': linkedId});
            }
        }
        // Create the owned item
        return newItem;
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event   The originating click event
     * @private
     */
    async _onItemCreate(event) {
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
        return await Item.create(itemData, {parent: this.actor});
    }

    /**
     * Handle toggling the state of an Owned Weapon within the Actor.
     * @param {Event} event The triggering click event.
     * @privateItem
     */
    async _onToggleWeapon(event) {
        event.preventDefault();
        const main = $(event.currentTarget).data("main");
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
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
        for (let otherItem of this.actor.items) {
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
     * @privateItem
     */
    async _onToggleWearable(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        const slot = item.system.attributes.slot.value;
        if (!['clothes', 'armor', 'ring', 'amulet'].includes(slot)) return;
        // Toggle item slot
        await item.update({
            ["system.isEquipped"]: !foundry.utils.getProperty(item, "system.isEquipped"),
        });
        // If unequipped then return
        if (!item.system.isEquipped) return;
        let ringCount = 1;
        // Unequip other items
        for (let otherItem of this.actor.items) {
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
     * @privateItem
     */
    async _onUseConsumable(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        const attributes = PL1E.attributes;

        // Removed one use
        await item.update({
            ["system.removedUses"]: foundry.utils.getProperty(item, "system.removedUses") + 1,
        });

        // Launch consumable effect
        for (let [id, attribute] of Object.entries(item.system.attributes)) {
            if (!attribute.apply || attributes[id]["path"] === undefined) continue;
            if (attributes[id]["operator"] === 'set') {
                foundry.utils.setProperty(this.actor.system, attributes[id]["path"], attribute.value);
            }
            else if (attributes[id]["operator"] === 'push') {
                let currentValue = foundry.utils.getProperty(this.actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(attribute.value);
                foundry.utils.setProperty(this.actor.system, attributes[id]["path"], currentValue);
            }
            else if (attributes[id]["operator"] === 'add') {
                let currentValue = foundry.utils.getProperty(this.actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = 0;
                await this.actor.update({
                    ["system." + attributes[id]["path"]]: currentValue + attribute.value
                });
            }
        }

        // The item have no more uses and is not reloadable
        if (item.system.removedUses >= item.system.attributes.uses.value && !item.system.attributes.reloadable.value) {
            item.delete();
        }
    }

    /**
     * Handle reload of an Owned Consumable within the Actor.
     * @param {Event} event The triggering click event.
     * @privateItem
     */
    async _onReloadConsumable(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);

        // Reset removed uses
        await item.update({
            ["system.removedUses"]: 0
        });
    }

    /**
     * Handle characteristics changes
     * @param {Event} event
     * @private
     */
    _onCharacteristicChange(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget);
        const characteristic = element.data("characteristic");
        let value = element.data("value");
        if (!value || !characteristic) return;

        let remaining = foundry.utils.getProperty(this.actor.system.attributes, "remainingCharacteristics");
        if (remaining === 0 && value > 0) return;

        let oldValue = foundry.utils.getProperty(this.actor.system.characteristics, characteristic + ".base");
        let newValue = oldValue + value;
        if (newValue > 5 || newValue < 2) return;

        foundry.utils.setProperty(this.actor.system.characteristics, characteristic + ".base", newValue);
        foundry.utils.setProperty(this.actor.system.attributes, "remainingCharacteristics", remaining - value);

        this.render(false);
    }

    /**
     * Handle currency changes
     * @param {Event} event
     * @private
     */
    _onCurrencyChange(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget);
        const currency = element.data("currency");
        let value = element.data("value");
        if (!value || !currency) return;

        let oldValue = foundry.utils.getProperty(this.actor.system.currencies, currency);
        foundry.utils.setProperty(this.actor.system, currency, oldValue + value);

        this.render(false);
    }

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        // Handle item rolls.
        if (dataset.rollType) {
            if (dataset.rollType == 'item') {
                const itemId = element.closest('.item').dataset.itemId;
                const item = this.actor.items.get(itemId);
                if (item) return item.roll();
            }
        }

        // Handle rolls that supply the formula directly.
        if (dataset.roll) {
            let label = dataset.label ? `[ability] ${dataset.label}` : '';
            let roll = new Roll(dataset.roll, this.actor.getRollData());
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({actor: this.actor}),
                flavor: label,
                rollMode: game.settings.get('core', 'rollMode'),
            });
            return roll;
        }
    }

    /**
     * Create highlights
     * @param event
     * @private
     */
    _onCreateHighlights(event) {
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
                resource.classList.add('highlight');
            }
        }
        // characteristics
        if (characteristics !== undefined) {
            for (let characteristic of document.getElementsByClassName('characteristic-label')) {
                let id = $(characteristic).data("id");
                if (!characteristics.includes(id)) continue;
                characteristic.classList.add('highlight');
            }
        }
        // skills
        if (skills !== undefined) {
            for (let skill of document.getElementsByClassName('skill-label')) {
                let id = $(skill).data("id");
                if (!skills.includes(id)) continue;
                skill.classList.add('highlight');
            }
        }
    }

    /**
     * Remove highlights
     * @param event
     * @private
     */
    _onRemoveHighlights(event) {
        event.preventDefault();
        event.stopPropagation();
        for (let characteristic of document.getElementsByClassName('characteristic-label')) {
            characteristic.classList.remove('highlight')
        }
        for (let resource of document.getElementsByClassName('resource-label')) {
            resource.classList.remove('highlight')
        }
        for (let skill of document.getElementsByClassName('skill-label')) {
            skill.classList.remove('highlight')
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} context The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareItems(context) {
        // Initialize containers.
        const weapons = [];
        const wearables = [];
        const consumables = [];
        const commons = [];
        const gear = [];
        const features = [];
        const abilities = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        // Iterate through items, allocating to containers
        for (let item of context.items) {
            item.img = item.img || DEFAULT_TOKEN;
            // Append to item categories
            if (item.type === 'weapon') {
                weapons.push(item);
            }
            else if (item.type === 'wearable') {
                wearables.push(item);
            }
            else if (item.type === 'consumable') {
                consumables.push(item);
            }
            else if (item.type === 'common') {
                commons.push(item);
            }
            // Append to gear.
            if (['weapon','wearable','consumable','common'].includes(item.type)) {
                gear.push(item);
            }
            // Append to features.
            else if (item.type === 'feature') {
                features.push(item);
            }
            // Append to abilities.
            else if (item.type === 'ability') {
                if (item.system.level !== undefined) {
                    abilities[item.system.level].push(item);
                }
            }
        }

        // Assign and return
        context.weapons = weapons;
        context.wearables = wearables;
        context.consumables = consumables;
        context.commons = commons;
        context.gear = gear;
        context.features = features;
        context.abilities = abilities;
    }

}
