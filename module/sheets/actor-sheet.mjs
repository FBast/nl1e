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
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
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
      this._prepareTraits(context);
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
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    const resources = context.system.resources;
    const characteristics = context.system.characteristics;
    const defenses = context.system.defenses;
    const resistances = context.system.resistances;
    const skills = context.system.skills;
    const attributes = context.system.attributes;
    // Handle attributes scores.
    attributes.initiative = attributes.speed + characteristics.agility.value + characteristics.perception.value + characteristics.cunning.value + characteristics.wisdom.value;
    attributes.sizeMod = CONFIG.PL1E.sizeMods[attributes.size];
    // Handle resources scores.
    for (let [id, resource] of Object.entries(resources)) {
      var firstCharacteristic = characteristics[resource.firstCharacteristic];
      var secondCharacteristic = characteristics[resource.secondCharacteristic];
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
      var firstCharacteristic = characteristics[defense.firstCharacteristic];
      var secondCharacteristic = characteristics[defense.secondCharacteristic];
      var attributeBonus = attributes[defense.attributeBonus];
      defense.number = Math.floor((firstCharacteristic.value + secondCharacteristic.value) / defense.divider) + parseInt(attributeBonus);
    }
    // Handle resistances scores.
    for (let [id, resistance] of Object.entries(resistances)) {
      resistance.label = game.i18n.localize(CONFIG.PL1E.resistances[id]) ?? id;
      var firstCharacteristic = characteristics[resistance.firstCharacteristic];
      var secondCharacteristic = characteristics[resistance.secondCharacteristic];
      resistance.number = Math.floor((firstCharacteristic.value + secondCharacteristic.value) / resistance.divider);
    }
    // Handle skills scores.
    for (let [id, skill] of Object.entries(skills)) {
      skill.label = game.i18n.localize(CONFIG.PL1E.skills[id]) ?? id;
      var firstCharacteristic = characteristics[skill.firstCharacteristic];
      var secondCharacteristic = characteristics[skill.secondCharacteristic];
      skill.number = Math.floor((firstCharacteristic.value + secondCharacteristic.value) / 2);
      skill.dice = 2 + skill.mastery * 2;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const abilities = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
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
        if (i.system.size.apply) {
          context.system.attributes.size = i.system.size.value;
        }
        if (i.system.speed.apply) {
          context.system.attributes.speed = i.system.speed.value;
        }
        if (i.system.speed.strengthMod.apply) {
          context.system.characteristics.strength.mod = i.system.strengthMod.value;
        }
        if (i.system.speed.agilityMod.apply) {
          context.system.characteristics.agility.mod = i.system.agilityMod.value;
        }
        if (i.system.speed.perceptionMod.apply) {
          context.system.characteristics.perception.mod = i.system.perceptionMod.value;
        }
        if (i.system.speed.constitutionMod.apply) {
          context.system.characteristics.constitution.mod = i.system.constitutionMod.value;
        }
        if (i.system.speed.intellectMod.apply) {
          context.system.characteristics.intellect.mod = i.system.intellectMod.value;
        }
        if (i.system.speed.cunningMod.apply) {
          context.system.characteristics.cunning.mod = i.system.cunningMod.value;
        }
        if (i.system.speed.wisdomMod.apply) {
          context.system.characteristics.wisdom.mod = i.system.wisdomMod.value;
        }
        if (i.system.speed.willMod.apply) {
          context.system.characteristics.will.mod = i.system.willMod.value;
        }
        features.push(i);
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
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
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
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  /**
   * Prepare the data structure for traits data like languages, resistances & vulnerabilities, and proficiencies.
   * @param {object} traits   The raw traits data object from the actor data. *Will be mutated.*
   * @private
   */
    _prepareTraits(context) {
      const traits = context.system.traits;
      const map = {
        /*dr: CONFIG.DND5E.damageResistanceTypes,
        di: CONFIG.DND5E.damageResistanceTypes,
        dv: CONFIG.DND5E.damageResistanceTypes,
        ci: CONFIG.DND5E.conditionTypes,*/
        languages: CONFIG.PL1E.languages
      };
      const config = CONFIG.PL1E;
      for ( const [key, choices] of Object.entries(map) ) {
        const trait = traits[key];
        if ( !trait ) continue;
        let values = (trait.value ?? []) instanceof Array ? trait.value : [trait.value];
  
        // Split physical damage types from others if bypasses is set
        /*const physical = [];
        if ( trait.bypasses?.length ) {
          values = values.filter(t => {
            if ( !config.physicalDamageTypes[t] ) return true;
            physical.push(t);
            return false;
          });
        }*/
  
        // Fill out trait values
        trait.selected = values.reduce((obj, t) => {
          obj[t] = choices[t];
          return obj;
        }, {});
  
        // Display bypassed damage types
        /*if ( physical.length ) {
          const damageTypesFormatter = new Intl.ListFormat(game.i18n.lang, { style: "long", type: "conjunction" });
          const bypassFormatter = new Intl.ListFormat(game.i18n.lang, { style: "long", type: "disjunction" });
          trait.selected.physical = game.i18n.format("DND5E.DamagePhysicalBypasses", {
            damageTypes: damageTypesFormatter.format(physical.map(t => choices[t])),
            bypassTypes: bypassFormatter.format(trait.bypasses.map(t => config.physicalWeaponProperties[t]))
          });
        }*/
  
        // Add custom entry
        if ( trait.custom ) trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
        trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
      }
  
      // Populate and localize proficiencies
      /*for ( const t of ["armor", "weapon", "tool"] ) {
        const trait = traits[`${t}Prof`];
        if ( !trait ) continue;
        Actor5e.prepareProficiencies(trait, t);
        trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
      }*/
    }

}
