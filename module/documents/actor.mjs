import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {PL1E} from "../helpers/config.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Pl1eActor extends Actor {

    /**
     * Seek for any token which represent this actor
     * @returns {Token}
     */
    get bestToken() {
        // The token associated with the actor
        let token = this.token
        // The token associated with the sheet
        token ??= this.sheet.token;
        // The active tokens linked to this actor
        if (!token && this.prototypeToken.actorLink && this.getActiveTokens().length > 0) {
            if (this.getActiveTokens().length > 1)
                ui.notifications.warn(game.i18n.localize("PL1E.MultipleLinkedTokens"));
            token = this.getActiveTokens()[0];
        }
        if (!token) ui.notifications.error(game.i18n.localize("PL1E.CannotFindAnyToken"));
        return token;
    }

    //region Data management

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

    }

    /** @override */
    async prepareEmbeddedDocuments() {
        // Iterate items to apply system on actor
        for (let item of this.items) {
            if (!['weapon', 'wearable', 'feature'].includes(item.type)) continue;
            if (item.type === 'weapon' && !item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
            if (item.type === 'wearable' && !item.system.isEquipped) continue;
            for (let [id, optionalAttribute] of Object.entries(item.system.optionalAttributes)) {
                if (optionalAttribute.targetGroup !== 'self') continue;
                await this.applyOptionalAttribute(optionalAttribute, true, false);
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

        this._prepareCommonDataBefore(systemData);
        this._prepareCharacterData(systemData);
        this._prepareNpcData(systemData);
        this._prepareMerchantData(systemData);
        this._prepareCommonDataAfter(systemData);
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
     * Prepare common actor data before specific process
     * @param systemData
     * @private
     */
    _prepareCommonDataBefore(systemData) {
        const actorMisc = systemData.misc ;
        // Handle actorAttributes scores.
        actorMisc.sizeMultiplier = CONFIG.PL1E.sizeMultipliers[actorMisc.size];
        actorMisc.sizeToken = CONFIG.PL1E.sizeTokens[actorMisc.size];
        if (systemData.experienceTemplate !== undefined)
            actorMisc.experience = CONFIG.PL1E.experienceTemplatesValues[actorMisc.experienceTemplate];
        actorMisc.slots = Math.floor(actorMisc.experience / 3);
        for (let otherItem of this.items) {
            if (otherItem.type !== 'ability' || !otherItem.system.isMemorized) continue;
            actorMisc.slots -= otherItem.system.attributes.level.value;
        }
        actorMisc.ranks = actorMisc.experience;
        actorMisc.maxRank = Math.min(1 + Math.floor(actorMisc.experience / 10), 5);
    }

    /**
     * Prepare Character type specific data
     * @param systemData
     * @private
     */
    _prepareCharacterData(systemData) {
        if (this.type !== 'character') return;
    }

    /**
     * Prepare NPC type specific data.
     * @param systemData
     * @private
     */
    _prepareNpcData(systemData) {
        if (this.type !== 'npc') return;
        const actorMisc = systemData.misc;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;
        // Handle characteristics
        let templateValues = CONFIG.PL1E.NPCTemplates[systemData.NPCTemplate];
        for (let [id, characteristic] of Object.entries(templateValues.characteristics)) {
            actorCharacteristics[id].base = characteristic;
        }
        // Handle skills
        let ranks = 0;
        let maxRank = Math.min(1 + Math.floor(actorMisc.experience / 10), 5);
        let keepLooping = true;
        while (keepLooping) {
            keepLooping = false;
            for (let [id, skill] of Object.entries(templateValues.skills)) {
                let newRank = actorSkills[skill].rank + 1;
                if (newRank > maxRank) continue;
                if (ranks + newRank <= actorMisc.ranks) {
                    actorSkills[skill].rank = newRank;
                    ranks += newRank;
                    keepLooping = true;
                }
            }
        }
    }

    /**
     * Prepare NPC type specific data.
     * @param systemData
     * @private
     */
    _prepareMerchantData(systemData) {
        if (this.type !== 'merchant') return;
        // Add merchant prices
        systemData.merchantPrices = {};
        for (let item of this.items) {
            let value = Pl1eHelpers.currencyToUnits(item.system.price);
            value += Math.round(value * (systemData.buyMultiplicator / 100));
            systemData.merchantPrices[item._id] = Pl1eHelpers.unitsToCurrency(value);
        }
    }

    /**
     * Prepare common actor data after specific process
     * @param systemData
     * @private
     */
    _prepareCommonDataAfter(systemData) {
        const actorResources = systemData.resources;
        const actorMisc = systemData.misc;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;
        // Handle actorCharacteristics scores.
        for (let [id, characteristic] of Object.entries(actorCharacteristics)) {
            characteristic.mod = characteristic.mods.filter(value => value < 0).reduce((a, b) => a + b, 0)
                + Math.max(...characteristic.mods.filter(value => value > 0), 0);
            characteristic.value = characteristic.base + characteristic.mod;
        }
        actorMisc.initiative = actorMisc.speed + actorCharacteristics.agility.value +
            actorCharacteristics.perception.value + actorCharacteristics.cunning.value + actorCharacteristics.wisdom.value;
        // Handle actorResources scores.
        for (let [id, resource] of Object.entries(actorResources)) {
            for(let characteristic of resource.weights.characteristics) {
                resource.max += actorCharacteristics[characteristic].value;
            }
            resource.max *= resource.multiplier * actorMisc.sizeMultiplier;
        }
        // Handle actorSkills scores.
        for (let [id, skill] of Object.entries(actorSkills)) {
            let characteristicsSum = 0;
            for (let characteristic of skill.weights.characteristics) {
                characteristicsSum += actorCharacteristics[characteristic].value;
            }
            let attributesSum = 0;
            if (skill.weights.actorMisc !== undefined) {
                for (let misc of skill.weights.actorMisc) {
                    attributesSum += actorMisc[misc];
                }
            }
            skill.numberMod = attributesSum + actorMisc.bonuses;
            skill.number = Math.floor(characteristicsSum / skill.divider);
            skill.number = Math.clamped(skill.number + skill.numberMod, 1, 10);
            skill.diceMod = actorMisc.advantages;
            skill.dice = Math.clamped((1 + skill.rank + skill.diceMod) * 2, 4, 12);
            if (!skill.fixedRank) actorMisc.ranks -= (skill.rank * (skill.rank + 1) / 2) - 1;
        }
    }

    /**
     * Prepare character roll data.
     * @param data
     * @private
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
     * @param data
     * @private
     */
    _getNpcRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

    /**
     * Prepare Merchant roll data.
     * @param data
     * @private
     */
    _getMerchantRollData(data) {
        if (this.type !== 'npc') return;

        // Process additional NPC data here.
    }

    //endregion

    async rollSkill(skill) {
        let formula = skill.number + "d" + skill.dice + "xo" + skill.dice + "cs>=4";
        let roll = new Roll(formula, this.getRollData());
        roll = await roll.toMessage({
            speaker: ChatMessage.getSpeaker({actor: this}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: '[' + game.i18n.localize("PL1E.Skill") + '] ' + game.i18n.localize(skill.label),
            rollMode: game.settings.get('core', 'rollMode'),
        });
        return roll.rolls[0].result;
    }

    async applyOptionalAttribute(optionalAttribute, reduction, persist) {
        const system = this.system;
        const subTarget = PL1E.attributeSubTargets[optionalAttribute.subTarget];

        if (subTarget.path === undefined) return;

        // Add reduction to value
        if (reduction && optionalAttribute.reduction !== 'none') {
            const reduction = foundry.utils.getProperty(system, PL1E.reductionsPath[optionalAttribute.reduction]);
            optionalAttribute.value = Math.min(optionalAttribute.value + reduction, 0);
        }
        let newValue;
        switch (optionalAttribute.function) {
            case 'set':
                newValue = optionalAttribute.value;
                break;
            case 'add':
                newValue = foundry.utils.getProperty(system, subTarget.path);
                newValue += optionalAttribute.value;
                break;
            case 'remove':
                newValue = foundry.utils.getProperty(system, subTarget.path);
                newValue -= optionalAttribute.value;
                break;
            case 'push':
                let currentValue = foundry.utils.getProperty(system, subTarget.path);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(optionalAttribute.value);
                newValue = currentValue;
                break;
            default:
                console.error("PL1E | Unknown optionalAttribute function : " + optionalAttribute.function)
        }

        if (persist) {
            await this.update({["system." + subTarget.path]: newValue})
        }
        else {
            foundry.utils.setProperty(system, subTarget.path, newValue);
        }
    }

}