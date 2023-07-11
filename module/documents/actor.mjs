import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Pl1eActor extends Actor {

    get sourceId() {
        return this.getFlag("pl1e", "sourceId");
    }

    /**
     * Seek for any token which represent this actor
     * @returns {Token | null}
     */
    get bestToken() {
        // Try to get the token associated with the sheet
        let token = this.sheet.token;

        // If there is no sheet token, try to get the token associated with the actor
        if (!token) token = this.token;

        // If there is still no token, and actor link is enabled, try to get the first linked token
        if (!token && this.prototypeToken.actorLink && this.getActiveTokens().length > 0) {
            token = this.getActiveTokens()[0].document;
        }

        // If we have a token, try to find it in the canvas tokens
        if (token) {
            token = canvas.tokens.placeables.find(t => t.document.uuid === token.uuid);
        }

        return token;
    }

    //region Data management

    /** @inheritDoc */
    async _preCreate(data, options, userId) {
        await super._preCreate(data, options, userId);

        const updateData = {};
        if (data.img === undefined) {
            const img = CONFIG.PL1E.defaultIcons[data.type];
            if (img) updateData["img"] = img;
        }
        if (data.name.includes("New Actor")) {
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (name) updateData["name"] = name;
        }
        if (data.type === "character") {
            updateData["prototypeToken.actorLink"] = true;
        }

        await this.updateSource( updateData );
    }

    /** @inheritDoc */
    async _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);

    }

    /** @inheritDoc */
    async _preDelete(options, user) {
        // If the actor is the last then update refs
        for (const item of this.items) {
            await this.removeItem(item);
        }

        return super._preDelete(options, user);
    }

    /** @inheritDoc
     * Prepare data for the actor. Calling the super version of this executes
     * the following, in order: data reset (to clear active effects),
     * prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
     * prepareDerivedData().
     */
    async prepareData() {
        super.prepareData();

    }

    /** @inheritDoc */
    async prepareBaseData() {
        super.prepareBaseData();

    }

    /** @inheritDoc */
    async prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();

        // Apply passive values
        for (const item of this.items) {
            for (const [id, aspect] of Object.entries(item.system.passiveAspects)) {
                if (aspect.createEffect || !item.isEnabled) continue;
                Pl1eAspect.applyPassiveValue(aspect, id, this);
            }
        }
    }

    /**
     * @inheritDoc
     * Augment the basic actor data with additional dynamic data. Typically,
     * you'll want to handle most of your calculated/derived data in this step.
     * Data calculated in this step should generally not exist in template.json
     * (such as ability modifiers rather than ability scores) and should be
     * available both inside and outside of character sheets (such as if an actor
     * is queried and has a roll executed directly from it).
     */
    prepareDerivedData() {
        super.prepareDerivedData();

        const systemData = this.system;
        const actorResources = systemData.resources;
        const actorMisc = systemData.misc;
        const actorGeneral = systemData.general;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;

        // Selection based values
        actorMisc.sizeMultiplier = CONFIG.PL1E.sizes[actorMisc.size].multiplier;
        actorMisc.tokenSize = CONFIG.PL1E.sizes[actorMisc.size].token;
        actorMisc.movement = CONFIG.PL1E.speeds[actorMisc.speed].movement;
        actorMisc.baseInitiative = CONFIG.PL1E.speeds[actorMisc.speed].baseInitiative;

        // Handle actorCharacteristics scores.
        for (let [id, characteristic] of Object.entries(actorCharacteristics)) {
            characteristic.mod = characteristic.mods.filter(value => value < 0).reduce((a, b) => a + b, 0)
                + Math.max(...characteristic.mods.filter(value => value > 0), 0);
            characteristic.value = characteristic.base + characteristic.mod;
        }

        // Handle actorResources scores.
        for (let [id, resource] of Object.entries(actorResources)) {
            const resourceConfig = CONFIG.PL1E.resources[id];
            for(let characteristic of resourceConfig.weights.characteristics) {
                resource.max += actorCharacteristics[characteristic].value;
            }
            resource.max *= resourceConfig.multiplier * actorMisc.sizeMultiplier;
            if (resource.value > resource.max) resource.value = resource.max;
        }

        // Handle actorSkills scores.
        for (let [id, skill] of Object.entries(actorSkills)) {
            const skillConfig = CONFIG.PL1E.skills[id];
            let characteristicsSum = 0;
            for (let characteristic of skillConfig.weights.characteristics) {
                characteristicsSum += actorCharacteristics[characteristic].value;
            }
            let attributesSum = 0;
            if (skillConfig.weights.misc !== undefined) {
                for (let misc of skillConfig.weights.misc) {
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

        // Calculate initiative
        actorMisc.initiative = actorMisc.baseInitiative + actorCharacteristics.agility.value +
            actorCharacteristics.perception.value + actorCharacteristics.cunning.value + actorCharacteristics.wisdom.value;
    }

    /** @inheritDoc */
    getRollData() {
        const data = super.getRollData();

        return data;
    }

    /**
     * Roll a skill and return the roll
     * @param {string} skillName
     * @returns {Promise<Roll>}
     */
    async rollSkill(skillName) {
        const skill = this.system.skills[skillName];
        let formula = skill.number + "d" + skill.dice;
        formula += this.type === "character" ? "xo" + skill.dice : "";
        formula += "cs>=4";
        let roll = new Roll(formula, this.getRollData());
        roll.skillName = skillName;
        return roll.evaluate({async: true});
    }

    /**
     * Roll a skill based on rollBestSkill value and return the roll
     * @param {string[]} skillNames
     * @param {Object} options
     * @returns {Promise<Roll>}
     */
    async rollSkills(skillNames, options = {}) {
        // Check if character has item which can parry projectiles
        let parryProjectiles = false;
        for (const item of this.items) {
            if (item.isEnabled && item.system.attributes.parryProjectiles) {
                parryProjectiles = true;
                break;
            }
        }
        if (skillNames.length > 1) {
            if (this.system.general.rollBestSkill) {
                let skillAvg = Number.NEGATIVE_INFINITY;
                let bestSkillName = undefined;
                for (let skillName of skillNames) {
                    const skill = this.system.skills[skillName];
                    if (skillName === "parry" && options.rangedAttack && !parryProjectiles) continue;
                    const currentSkillAvg = (skill.dice + 1) / 2 * skill.number;
                    if (skillAvg < currentSkillAvg) {
                        skillAvg = currentSkillAvg;
                        bestSkillName = skillName;
                    }
                }
                return await this.rollSkill(bestSkillName);
            }
            else {
                throw new Error("PL1E | not implemented yet");
            }
        }
        else {
            return await this.rollSkill(skillNames[0]);
        }
    }

    /**
     * Add an item and all child items as embedded documents
     * @param {Pl1eItem} item
     * @param {string} childId
     * @returns {Promise<Pl1eItem>}
     */
    async addItem(item, childId = undefined) {
        let newItem = await this.createEmbeddedDocuments("Item", [item]);
        newItem = newItem[0];

        // Flag the new item
        if (childId) await newItem.setFlag("pl1e", "childId", childId);
        const parentId = randomID();
        await newItem.setFlag("pl1e", "parentId", parentId);
        await newItem.setFlag("core", "sourceId", item.uuid);

        // Add new item children
        if (newItem.system.refItems && newItem.system.refItems.length > 0) {
            for (let id of newItem.system.refItems) {
                const refItem = await Pl1eHelpers.getDocument("Item", id);
                await this.addItem(refItem, parentId);
            }
        }
    }

    /**
     * Delete an item and all child items as embedded documents
     * @param {Pl1eItem} item
     * @returns {Promise<void>}
     */
    async removeItem(item) {
        if (item === undefined) throw new Error("Cannot find item to remove");

        // Remove item children
        for (const otherItem of this.items) {
            if (item.parentId === otherItem.childId) await this.removeItem(otherItem);
        }

        await this.deleteEmbeddedDocuments("Item", [item._id]);
    }

}