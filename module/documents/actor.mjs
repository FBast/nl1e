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
    }

    /** @override */
    prepareBaseData() {
        const system = this.system;
        const actorResources = system.resources;
        const actorCharacteristics = system.characteristics;
        const actorAttributes = system.attributes;

        // Handle actorCharacteristics scores.
        for (let [id, characteristic] of Object.entries(actorCharacteristics)) {
            characteristic.id = id;
            characteristic.label = game.i18n.localize(CONFIG.PL1E.characteristics[id]) ?? id;
            characteristic.mod = characteristic.mods.filter(value => value < 0).reduce((a, b) => a + b, 0)
                + Math.max(...characteristic.mods.filter(value => value > 0), 0);
            characteristic.value = characteristic.base + characteristic.mod;
        }
        // Handle actorResources scores.
        for (let [id, resource] of Object.entries(actorResources)) {
            resource.id = id;
            resource.label = game.i18n.localize(CONFIG.PL1E.resources[id]) ?? id;
            for(let characteristic of resource.weights.characteristics) {
                resource.max += actorCharacteristics[characteristic].value;
            }
            resource.max = resource.max * 5 + parseInt(actorAttributes.sizeMod);
        }
    }

    /** @override */
    prepareEmbeddedDocuments() {
        const system = this.system;

        // Iterate items to apply system on actor
        for (let item of this.items) {
            if (item.system.isEquipped !== undefined && !item.system.isEquipped) continue;
            for (let [id, attribute] of Object.entries(item.system.attributes)) {
                if (!attribute.apply || attribute.path === undefined) continue;
                if (attribute.type === 'set') {
                    foundry.utils.setProperty(system, attribute.path, attribute.value);
                }
                else if (attribute.type === 'add') {
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
        this._prepareCommonData(systemData);
        // this._prepareCharacterData(systemData);
        // this._prepareNpcData(systemData);
        // this._prepareMerchantData(systemData);
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
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;

        // Handle actorAttributes scores.
        actorAttributes.initiative = actorAttributes.speed + actorCharacteristics.agility.value + actorCharacteristics.perception.value + actorCharacteristics.cunning.value + actorCharacteristics.wisdom.value;
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
        // Handle actorSkills scores.
        for (let [id, skill] of Object.entries(actorSkills)) {
            skill.id = id;
            skill.label = game.i18n.localize(CONFIG.PL1E.skills[id]) ?? id;
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

        // Make modifications to data here. For example:
        // const systemData = actorData.system;
        // systemData.xp = (systemData.cr * systemData.cr) * 100;
    }

    /**
     * Prepare NPC type specific data.
     */
    _prepareMerchantData(systemData) {
        if (this.type !== 'merchant') return;

        // Make modifications to data here. For example:
        // const systemData = actorData.system;
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