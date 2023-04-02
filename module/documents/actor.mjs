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
        // Try to get the token associated with the sheet
        let token = this.sheet.token;

        // If there is no sheet token, try to get the token associated with the actor
        if (!token) token = this.token;

        // If there is still no token, and actor link is enabled, try to get the first linked token
        if (!token && this.prototypeToken.actorLink && this.getActiveTokens().length > 0) {
            if (this.getActiveTokens().length > 1) {
                ui.notifications.warn(game.i18n.localize("PL1E.MultipleLinkedTokens"));
            }
            token = this.getActiveTokens()[0];
        }

        // If we have a token, try to find it in the canvas tokens
        if (token) {
            const canvasToken = canvas.tokens.placeables.find(t => t.document.uuid === token.uuid);
            if (!canvasToken) {
                ui.notifications.error(game.i18n.localize("PL1E.CannotFindTokenOnCanvas"));
            } else {
                return canvasToken;
            }
        }

        // If we still don't have a token, show an error message and return null
        ui.notifications.error(game.i18n.localize("PL1E.CannotFindAnyToken"));
        return null;
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
                await this.applyAttribute(optionalAttribute, false);
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
        const actorGeneral = systemData.general ;
        const actorMisc = systemData.misc;
        // Handle actorAttributes scores.
        actorGeneral.sizeMultiplier = CONFIG.PL1E.sizes[actorMisc.size].multiplier;
        actorGeneral.sizeToken = CONFIG.PL1E.sizes[actorMisc.size].token;
    }

    /**
     * Prepare Character type specific data
     * @param systemData
     * @private
     */
    _prepareCharacterData(systemData) {
        if (this.type !== 'character') return;
        const actorGeneral = systemData.general ;

        // Handle experience
        actorGeneral.slots = Math.floor(actorGeneral.experience / 3);
        for (let otherItem of this.items) {
            if (otherItem.type !== 'ability' || !otherItem.system.isMemorized) continue;
            actorGeneral.slots -= otherItem.system.attributes.level.value;
        }
        actorGeneral.ranks = actorGeneral.experience;
        actorGeneral.maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);
    }

    /**
     * Prepare NPC type specific data.
     * @param systemData
     * @private
     */
    _prepareNpcData(systemData) {
        if (this.type !== 'npc') return;
        const actorGeneral = systemData.general;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;

        // Handle experience
        actorGeneral.experience = CONFIG.PL1E.experienceTemplates[actorGeneral.experienceTemplate].value;
        actorGeneral.slots = Math.floor(actorGeneral.experience / 3);
        for (let otherItem of this.items) {
            if (otherItem.type !== 'ability' || !otherItem.system.isMemorized) continue;
            actorGeneral.slots -= otherItem.system.attributes.level.value;
        }
        actorGeneral.ranks = actorGeneral.experience;
        actorGeneral.maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);

        // Handle characteristics repartition
        let npcTemplateConfig = CONFIG.PL1E.NPCTemplates[actorGeneral.NPCTemplate];
        for (let [id, characteristic] of Object.entries(npcTemplateConfig.characteristics)) {
            actorCharacteristics[id].base = characteristic;
        }

        // Handle skills repartition
        let ranks = 0;
        let maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);
        let keepLooping = true;
        while (keepLooping) {
            keepLooping = false;
            for (let [id, skill] of Object.entries(npcTemplateConfig.skills)) {
                let newRank = actorSkills[skill].rank + 1;
                if (newRank > maxRank) continue;
                if (ranks + newRank <= actorGeneral.ranks) {
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
            let value = Pl1eHelpers.moneyToUnits(item.system.price);
            value += Math.round(value * (systemData.general.buyModifier / 100));
            systemData.merchantPrices[item._id] = Pl1eHelpers.unitsToMoney(value);
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
        const actorGeneral = systemData.general;
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
            const resourceConfig = CONFIG.PL1E.resources[id];
            for(let characteristic of resourceConfig.weights.characteristics) {
                resource.max += actorCharacteristics[characteristic].value;
            }
            resource.max *= resourceConfig.multiplier * actorGeneral.sizeMultiplier;
        }
        // Handle actorSkills scores.
        for (let [id, skill] of Object.entries(actorSkills)) {
            const skillConfig = CONFIG.PL1E.skills[id];
            let characteristicsSum = 0;
            for (let characteristic of skillConfig.weights.characteristics) {
                characteristicsSum += actorCharacteristics[characteristic].value;
            }
            let attributesSum = 0;
            if (skillConfig.weights.actorMisc !== undefined) {
                for (let misc of skillConfig.weights.actorMisc) {
                    attributesSum += actorMisc[misc];
                }
            }
            skill.numberMod = attributesSum + actorGeneral.bonuses;
            skill.number = Math.floor(characteristicsSum / skillConfig.divider);
            skill.number = Math.clamped(skill.number + skill.numberMod, 1, 10);
            skill.diceMod = actorGeneral.advantages;
            skill.dice = Math.clamped((1 + skill.rank + skill.diceMod) * 2, 4, 12);
            if (!skillConfig.fixedRank) actorGeneral.ranks -= (skill.rank * (skill.rank + 1) / 2) - 1;
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
        let formula = skill.number + "d" + skill.dice;
        formula += this.type === "character" ? "xo" + skill.dice : "";
        formula += "cs>=4";
        let roll = new Roll(formula, this.getRollData());
        await roll.evaluate({async: true});
        return {
            formula: roll.formula,
            total: roll.total,
            dice: roll.dice,
        };
    }

    async applyAttribute(attribute, persist) {
        if (attribute.name === undefined) return;
        const data = CONFIG.PL1E.attributeDataGroups[attribute.data];

        let newValue = foundry.utils.getProperty(this, data.path);
        switch (attribute.name) {
            case "override":
                newValue = attribute.value;
                break;
            case "increase":
            case "decrease":
            case "transfer":
                if (newValue instanceof Array)
                    newValue.push(attribute.value);
                else
                    newValue += attribute.value;
                break;
            case "effect":
                await ActiveEffect.create({
                    label: "My Effect",
                    icon: "icons/svg/fire.svg",
                    changes: [
                        {
                            key: data.path,
                            mode: 2, // ADD | SUBTRACT | MULTIPLY | DIVIDE | SET
                            value: attribute.value
                        }
                    ],
                    duration: {
                        rounds: 1,
                        seconds: 6
                    },
                    flags: {
                        "pl1e": {
                            customFlag: true
                        }
                    }
                }, {parent: this, temporary: true});
                break;
            // case 'push':
            //     let currentValue = foundry.utils.getProperty(this, data.path);
            //     if (currentValue === undefined) currentValue = [];
            //     currentValue.push(attribute.value);
            //     newValue = currentValue;
            //     break;
            default:
                console.error("PL1E | Unknown attribute name : " + attribute.name)
        }

        // Make changes
        if (persist)
            await this.update({[data.path]: newValue})
        else
            foundry.utils.setProperty(this, data.path, newValue);
    }

}