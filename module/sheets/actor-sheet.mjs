import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

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
            width: 800,
            height: 850,
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

        // Prepare character data and items.
        if (actorData.type == 'character') {
            this._prepareItems(context);
            this._prepareCharacterData(context);
        }

        // Prepare NPC data and items.
        if (actorData.type == 'npc') {
            this._prepareItems(context);
        }

        // Add roll data for TinyMCE editors.
        context.rollData = context.actor.getRollData();

        // Prepare active effects
        context.effects = prepareActiveEffectCategories(this.actor.effects);

        return context;
    }

    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} context The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData(context) {
        let secondCharacteristic;
        let firstCharacteristic;
        const resources = context.system.resources;
        const characteristics = context.system.characteristics;
        const defenses = context.system.defenses;
        const resistances = context.system.resistances;
        const skills = context.system.skills;
        const attributes = context.system.attributes;
        // Handle attributes scores.
        attributes.initiative = attributes.speed + characteristics.agility.value + characteristics.perception.value + characteristics.cunning.value + characteristics.wisdom.value;
        attributes.sizeLabel = CONFIG.PL1E.sizes[attributes.size];
        attributes.sizeMod = CONFIG.PL1E.sizeMods[attributes.size];
        attributes.sizeToken = CONFIG.PL1E.sizeTokens[attributes.size];
        // Handle resources scores.
        for (let [id, resource] of Object.entries(resources)) {
            firstCharacteristic = characteristics[resource.firstCharacteristic];
            secondCharacteristic = characteristics[resource.secondCharacteristic];
            resource.max = (firstCharacteristic.value + secondCharacteristic.value) * 5 + parseInt(attributes.sizeMod);
        }
        // Handle characteristics scores.
        for (let [id, characteristic] of Object.entries(characteristics)) {
            characteristic.label = game.i18n.localize(CONFIG.PL1E.characteristics[id]) ?? id;
            characteristic.value = characteristic.base + characteristic.mod;
        }
        // Handle defenses scores.
        for (let [id, defense] of Object.entries(defenses)) {
            defense.label = game.i18n.localize(CONFIG.PL1E.defenses[id]) ?? id;
            firstCharacteristic = characteristics[defense.firstCharacteristic];
            secondCharacteristic = characteristics[defense.secondCharacteristic];
            var attributeBonus = attributes[defense.attributeBonus];
            defense.number = Math.floor((firstCharacteristic.value + secondCharacteristic.value) / defense.divider) + parseInt(attributeBonus);
        }
        // Handle resistances scores.
        for (let [id, resistance] of Object.entries(resistances)) {
            resistance.label = game.i18n.localize(CONFIG.PL1E.resistances[id]) ?? id;
            firstCharacteristic = characteristics[resistance.firstCharacteristic];
            secondCharacteristic = characteristics[resistance.secondCharacteristic];
            resistance.number = Math.floor((firstCharacteristic.value + secondCharacteristic.value) / resistance.divider);
        }
        // Handle skills scores.
        for (let [id, skill] of Object.entries(skills)) {
            skill.label = game.i18n.localize(CONFIG.PL1E.skills[id]) ?? id;
            firstCharacteristic = characteristics[skill.firstCharacteristic];
            secondCharacteristic = characteristics[skill.secondCharacteristic];
            skill.number = Math.floor((firstCharacteristic.value + secondCharacteristic.value) / 2);
            skill.dice = 2 + skill.mastery * 2;
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
        const resources = context.system.resources;
        const characteristics = context.system.characteristics;
        const defenses = context.system.defenses;
        const resistances = context.system.resistances;
        const skills = context.system.skills;
        const attributes = context.system.attributes;

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
        for (let i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;
            // Append to gear.
            if (i.type === 'item') {
                gear.push(i);
            }
            // Append to features.
            else if (i.type === 'feature') {
                features.push(i);
                if (i.system.attributes.size.apply) {
                    attributes.size = i.system.attributes.size.value;
                }
                if (i.system.attributes.speed.apply) {
                    attributes.speed = i.system.attributes.speed.value;
                }
                if (i.system.attributes.strengthMod.apply) {
                    characteristics.strength.mod = i.system.attributes.strengthMod.value;
                }
                if (i.system.attributes.agilityMod.apply) {
                    characteristics.agility.mod = i.system.attributes.agilityMod.value;
                }
                if (i.system.attributes.perceptionMod.apply) {
                    characteristics.perception.mod = i.system.attributes.perceptionMod.value;
                }
                if (i.system.attributes.constitutionMod.apply) {
                    characteristics.constitution.mod = i.system.attributes.constitutionMod.value;
                }
                if (i.system.attributes.intellectMod.apply) {
                    characteristics.intellect.mod = i.system.attributes.intellectMod.value;
                }
                if (i.system.attributes.cunningMod.apply) {
                    characteristics.cunning.mod = i.system.attributes.cunningMod.value;
                }
                if (i.system.attributes.wisdomMod.apply) {
                    characteristics.wisdom.mod = i.system.attributes.wisdomMod.value;
                }
                if (i.system.attributes.willMod.apply) {
                    characteristics.will.mod = i.system.attributes.willMod.value;
                }
            }
            // Append to abilities.
            else if (i.type === 'ability') {
                if (i.system.level != undefined) {
                    abilities[i.system.level].push(i);
                }
            }
        }

        // Assign and return
        context.gear = gear;
        context.features = features;
        context.abilities = abilities;
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
                if (item.system.linkId === undefined || parentItem.system.linkId !== item.system.linkId) continue;
                item.delete();
            }
            li.slideUp(200, () => this.render(false));
        });

        // Active Effect management
        html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

        // Rollable characteristic.
        html.find('.rollable').click(this._onRoll.bind(this));

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

        const linkId = randomID();
        const newItem = await this._onDropItemCreate(item);
        for (let subItem of itemData.system.subItemsMap) {
            const newSubItem = await this._onDropItemCreate(subItem);
            await newSubItem[0].update({'system.linkId': linkId});
        }
        await newItem[0].update({'system.linkId': linkId})
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

}
