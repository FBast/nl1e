import {HelpersPl1e} from "../helpers/helpers.js";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Pl1eActor extends Actor {

    /** @override */
    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);
        const updateData = {};
        if (data.img === undefined) {
            const img = CONFIG.PL1E.defaultIcons[data.type];
            if (img) updateData['img'] = img;
        }
        if (data.name.includes("New Actor")) {
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (name) updateData['name'] = name;
        }
        await this.updateSource( updateData );
    }

    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
        randomID()
    }

    /** @override */
    prepareBaseData() {
        const system = this.system;
        // Merge config data
        system.resources = HelpersPl1e.mergeDeep(system.resources, CONFIG.PL1E.resources);
        system.characteristics = HelpersPl1e.mergeDeep(system.characteristics, CONFIG.PL1E.characteristics);
        system.skills = HelpersPl1e.mergeDeep(system.skills, CONFIG.PL1E.skills);
        system.currencies = HelpersPl1e.mergeDeep(system.currencies, CONFIG.PL1E.currencies);
    }

    /** @override */
    prepareEmbeddedDocuments() {
        const system = this.system;
        // Iterate items to apply system on actor
        for (let item of this.items) {
            if (!['weapon', 'wearable', 'feature'].includes(item.type)) continue;
            if (item.type === 'weapon' && !item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
            if (item.type === 'wearable' && !item.system.isEquipped) continue;
            for (let [id, attribute] of Object.entries(item.system.attributes)) {
                if (!attribute.apply || attribute.path === undefined) continue;
                if (attribute.operator === 'set') {
                    foundry.utils.setProperty(system, attribute.path, attribute.value);
                }
                else if (attribute.operator === 'push') {
                    let currentValue = foundry.utils.getProperty(system, attribute.path);
                    if (currentValue === undefined) currentValue = [];
                    currentValue.push(attribute.value);
                    foundry.utils.setProperty(system, attribute.path, currentValue);
                }
            }
        }
        super.prepareEmbeddedDocuments();
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
        const systemData = this.system;
        const flags = this.flags.pl1e || {};

        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        // this._prepareCharacterData(systemData);
        this._prepareNpcData(systemData);
        // this._prepareMerchantData(systemData);
        this._prepareCommonData(systemData);
    }

    /**
     * Override getRollData() that's supplied to rolls.
     */
    getRollData() {
        const data = super.getRollData();

        // Prepare character roll data.
        // this._getCharacterRollData(data);
        // this._getNpcRollData(data);
        // this._getMerchantRollData(data);

        return data;
    }

    /**
     * Prepare common actor data
     * @param systemData
     */
    _prepareCommonData(systemData) {
        const actorAttributes = systemData.attributes;
        const actorResources = systemData.resources;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;
        // Handle actorAttributes scores.
        actorAttributes.sizeMod = CONFIG.PL1E.sizeMods[actorAttributes.size];
        actorAttributes.sizeToken = CONFIG.PL1E.sizeTokens[actorAttributes.size];
        actorAttributes.movementPenalty = actorAttributes.movementPenalties.reduce((a, b) => a + b, 0);
        actorAttributes.slashingReduction = actorAttributes.slashingReductions.reduce((a, b) => a + b, 0);
        actorAttributes.crushingReduction = actorAttributes.crushingReductions.reduce((a, b) => a + b, 0);
        actorAttributes.piercingReduction = actorAttributes.piercingReductions.reduce((a, b) => a + b, 0);
        actorAttributes.fireReduction = actorAttributes.fireReductions.reduce((a, b) => a + b, 0);
        actorAttributes.coldReduction = actorAttributes.coldReductions.reduce((a, b) => a + b, 0);
        actorAttributes.acidReduction = actorAttributes.acidReductions.reduce((a, b) => a + b, 0);
        actorAttributes.shockReduction = actorAttributes.shockReductions.reduce((a, b) => a + b, 0);
        actorAttributes.slots = Math.floor(actorAttributes.experience / 3);
        for (let otherItem of this.items) {
            if (otherItem.type !== 'ability' || !otherItem.system.isMemorized) continue;
            actorAttributes.slots -= otherItem.system.attributes.level.value;
        }
        actorAttributes.ranks = actorAttributes.experience;
        actorAttributes.maxRank = Math.min(1 + Math.floor(actorAttributes.experience / 10), 5);
        // Handle actorCharacteristics scores.
        for (let [id, characteristic] of Object.entries(actorCharacteristics)) {
            characteristic.mod = characteristic.mods.filter(value => value < 0).reduce((a, b) => a + b, 0)
                + Math.max(...characteristic.mods.filter(value => value > 0), 0);
            characteristic.value = characteristic.base + characteristic.mod;
        }
        actorAttributes.initiative = actorAttributes.speed + actorCharacteristics.agility.value +
            actorCharacteristics.perception.value + actorCharacteristics.cunning.value + actorCharacteristics.wisdom.value;
        // Handle actorResources scores.
        for (let [id, resource] of Object.entries(actorResources)) {
            for(let characteristic of resource.weights.characteristics) {
                resource.max += actorCharacteristics[characteristic].value;
            }
            resource.max = resource.max * 5 + parseInt(actorAttributes.sizeMod);
        }
        // Handle actorSkills scores.
        for (let [id, skill] of Object.entries(actorSkills)) {
            let characteristicsSum = 0;
            for (let characteristic of skill.weights.characteristics) {
                characteristicsSum += actorCharacteristics[characteristic].value;
            }
            let attributesSum = 0;
            if (skill.weights.attributes !== undefined) {
                for (let attribute of skill.weights.attributes) {
                    attributesSum += actorAttributes[attribute];
                }
            }
            skill.numberMod = attributesSum + actorAttributes.bonuses;
            skill.number = Math.floor(characteristicsSum / skill.divider);
            skill.number = Math.clamped(skill.number + skill.numberMod, 1, 10);
            skill.diceMod = actorAttributes.advantages;
            skill.dice = Math.clamped((1 + skill.rank + skill.diceMod) * 2, 4, 12);
            if (!skill.fixedRank) actorAttributes.ranks -= (skill.rank * (skill.rank + 1) / 2) - 1;
        }
    }

    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(systemData) {
        if (this.type !== 'character') return;
    }

    /**
     * Prepare NPC type specific data.
     */
    _prepareNpcData(systemData) {
        if (this.type !== 'npc') return;
        const actorAttributes = systemData.attributes;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;
        // Handle actorCharacteristics bases.
        let characteristicsTemplatesValues = CONFIG.PL1E.characteristicsTemplatesValues[actorAttributes.characteristicsTemplate];
        for (let [id, characteristic] of Object.entries(characteristicsTemplatesValues)) {
            actorCharacteristics[id].base = characteristic;
        }
        // Handle actorSkills ranks.
        let skillsTemplatesValues = CONFIG.PL1E.skillsTemplatesValues[actorAttributes.skillsTemplate];
        for (let [id, skill] of Object.entries(skillsTemplatesValues)) {
            actorSkills[skill].rank++;
        }
    }

    /**
     * Prepare NPC type specific data.
     */
    _prepareMerchantData(systemData) {
        if (this.type !== 'merchant') return;
    }

    /**
     * Prepare character roll data.
     */
    _getCharacterRollData(data) {
        if (this.type !== 'character') return;

        // Copy the characteristic scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        // if (data.characteristics) {
        //     for (let [k, v] of Object.entries(data.characteristics)) {
        //         data[k] = foundry.utils.deepClone(v);
        //     }
        // }

        // Add level for easier access, or fall back to 0.
        // if (data.attributes.level) {
        //     data.lvl = data.attributes.level.value ?? 0;
        // }
    }

    /**
     * Prepare NPC roll data.
     */
    _getNpcRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

    /**
     * Prepare Merchant roll data.
     */
    _getMerchantRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

}