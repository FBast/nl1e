/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Pl1eActor extends Actor {

    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
    }

    /**
     * @override
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        const actorData = this;
        const systemData = actorData.system;
        const flags = actorData.flags.pl1e || {};

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this.#_prepareCharacterData(actorData);
        this.#_prepareNpcData(actorData);
    }

    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = super.getRollData();

        // Prepare character roll data.
        this.#_getCharacterRollData(data);
        this.#_getNpcRollData(data);

        return data;
    }

    /**
     * Prepare Character type specific data
     */
    #_prepareCharacterData(actorData) {
        if (actorData.type !== 'character') return;
        // Make modifications to data here. For example:
        const systemData = actorData.system;
        const resources = systemData.resources;
        const characteristics = systemData.characteristics;
        const defenses = systemData.defenses;
        const resistances = systemData.resistances;
        const skills = systemData.skills;
        const attributes = systemData.attributes;
        // Handle attributes scores.
        attributes.initiative = attributes.speed + characteristics.agility.value + characteristics.perception.value + characteristics.cunning.value + characteristics.wisdom.value;
        attributes.sizeLabel = CONFIG.PL1E.sizes[attributes.size];
        attributes.sizeMod = CONFIG.PL1E.sizeMods[attributes.size];
        attributes.sizeToken = CONFIG.PL1E.sizeTokens[attributes.size];
        // Handle resources scores.
        let firstCharacteristic;
        let secondCharacteristic;
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
     * Prepare NPC type specific data.
     */
    #_prepareNpcData(actorData) {
        if (actorData.type !== 'npc') return;

        // Make modifications to data here. For example:
        const systemData = actorData.system;
        systemData.xp = (systemData.cr * systemData.cr) * 100;
    }

    /**
     * Prepare character roll data.
     */
    #_getCharacterRollData(data) {
        if (this.type !== 'character') return;

        // Copy the characteristic scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (data.characteristics) {
            for (let [k, v] of Object.entries(data.characteristics)) {
                data[k] = foundry.utils.deepClone(v);
            }
        }

        // Add level for easier access, or fall back to 0.
        if (data.attributes.level) {
            data.lvl = data.attributes.level.value ?? 0;
        }
    }

    /**
     * Prepare NPC roll data.
     */
    #_getNpcRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

}