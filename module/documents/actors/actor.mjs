import {Pl1eAspect} from "../../helpers/aspect.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {Pl1eActiveEffect} from "../effect.mjs";
import {PL1E} from "../../pl1e.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class Pl1eActor extends Actor {

    get sourceId() {
        return this.getFlag("pl1e", "sourceId");
    }

    get isDead() {
        return this.system.resources.health.value <= -this.system.misc.deathDoor;
    }

    get IsUnconscious() {
        return !this.isDead && this.system.resources.health.value <= -this.system.misc.unconsciousDoor;
    }

    /**
     * Seek for any token which represent this actor
     * @returns {TokenDocument | null}
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

        return token;
    }

    //region Data management

    /** @inheritDoc */
    static async create(docData, options = {}) {
        // Replace default image
        if (docData.img === undefined) {
            docData.img = `systems/pl1e/assets/icons/${docData.type}.svg`;
        }

        // Keep id if coming from compendium
        if (options.fromCompendium) options["keepId"] = true;

        // Some tweak on actors prototypeToken
        docData.prototypeToken = docData.prototypeToken || {};
        const dispositions = {
            "character": 1,
            "npc": -1,
            "merchant": 0
        }
        foundry.utils.mergeObject(
            docData.prototypeToken,
            {
                actorLink: docData.type === "character",
                vision: true,
                disposition: dispositions[docData.type],
                texture: {
                    src: `systems/pl1e/assets/icons/${docData.type}.svg`
                }
            },
            { overwrite: false }
        );

        const createdActor = await super.create(docData, options);

        if (!options.fromCompendium && createdActor.sourceId) {
            await createdActor.unsetFlag("core", "sourceId");
        }

        return createdActor;
    }

    /** @inheritDoc */
    async _onUpdate(changed, options, user) {
        await super._onUpdate(changed, options, user);

        // Update actor abilities effects based on level
        if (changed.system?.general?.experience) {
            // In case of the level changed then apply or remove effects for enabled or disabled abilities
            for (/** @type {Pl1eItem} */ const item of this.items.filter(item => item.type === "ability")) {
                for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                    if (!aspect.createEffect) continue;
                    if (item.isEnabled) {
                        await Pl1eAspect.applyPassiveEffect(aspect, id, this, item);
                    }
                    else {
                        await Pl1eAspect.removePassiveEffect(aspect, id, this);
                    }
                }
            }
        }

        // Add effect based on conditions
        await Pl1eActiveEffect.toggleStatusEffect(this, "dead", this.isDead);
        await Pl1eActiveEffect.toggleStatusEffect(this, "unconscious", this.IsUnconscious);
    }

    /** @inheritDoc */
    async _preUpdate(changed, options, user) {
        // Apply passive aspects macros
        for (/** @type {Pl1eItem} */ const item of this.items) {
            for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                if (!item.isEnabled) continue;
                if (aspect.name === "macro" && aspect.data !== "none" && aspect.dataGroup === "actorPreUpdate") {
                    await Pl1eAspect.applyPassiveMacro(aspect, id, {
                        actor: this,
                        changed: changed,
                        options: options,
                        user: user
                    });
                }
            }
        }

        // Apply active effect macro
        for (/** @type {Pl1eActiveEffect} */ const effect of this.effects) {
            const macroId = effect.getFlag("pl1e", "actorPreUpdateMacroId");
            if (macroId) {
                const macro = await Pl1eHelpers.getDocument("Macro", macroId);
                if (macro) macro.execute({
                    actor: this,
                    changed: changed,
                    options: options,
                    user: user
                });
            }
        }

        // Add scrolling text for resource changes
        const token = this.bestToken;
        if (token && changed.system?.resources) {
            const position = {
                x: token.x + token.width * token.parent.grid.size / 2,
                y: token.y + token.height * token.parent.grid.size / 2
            }

            const flattenSystem = Pl1eHelpers.flatten(changed.system.resources);
            for (const [key, value] of Object.entries(flattenSystem)) {
                this._displayResourceScrollingText(key, value, position);
            }
        }

        return super._preUpdate(changed, options, user);
    }

    /**
     * Generate a scrolling text above the character token
     * @param key
     * @param value
     * @param position
     * @private
     */
    _displayResourceScrollingText(key, value, position) {
        const splitKey = key.split(".");
        const resourceProperty = getProperty(this.system.resources, splitKey[0]);
        const diffValue = value - resourceProperty.value;
        const keyConfig = Pl1eHelpers.getConfig("resources", splitKey[0]);
        const text = `${diffValue} ${game.i18n.localize(keyConfig.label)}`;
        const minSize = game.settings.get("pl1e", "scrollingTextMinFont");
        const maxSize = game.settings.get("pl1e", "scrollingTextMaxFont");
        const duration = game.settings.get("pl1e", "scrollingTextDuration");
        if (keyConfig && diffValue !== 0) {
            const options = {
                duration: duration * 1000,
                fontSize: Math.clamped(Math.abs(diffValue) / resourceProperty.max * maxSize, minSize, maxSize),
                fill: diffValue > 0 ? "#00FF00" : "#FF0000",
            }
            canvas.interface.createScrollingText(position, text, options);
        }
    }

    /** @inheritDoc */
    async _preDelete(options, user) {
        // If the actor is the last then update refs
        for (const item of this.items) {
            await this.removeItem(item);
        }

        return super._preDelete(options, user);
    }

    /** @inheritDoc */
    async _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        // Apply passives effects
        if (embeddedName === "Item") {
            for (/** @type {Pl1eItem} */ const item of documents) {
                for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                    if (!item.isEnabled) continue;
                    if (!aspect.createEffect) continue;
                    await Pl1eAspect.applyPassiveEffect(aspect, id, this, item);
                }
            }
        }

        // Apply special token effects
        if (embeddedName === "ActiveEffect") {
            for (/** @type {Pl1eActiveEffect} */ const activeEffect of documents) {
                await activeEffect.applyTokenEffect(this);
            }
        }

        super._onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId);
    }

    /** @inheritDoc */
    async _onDeleteEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        // Remove passives effects
        if (embeddedName === "Item") {
            for (/** @type {Pl1eItem} */ const item of documents) {
                for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                    if (!item.isEnabled) continue;
                    if (!aspect.createEffect) continue;
                    await Pl1eAspect.removePassiveEffect(aspect, id, this);
                }
            }
        }

        // Remove special token effects
        if (embeddedName === "ActiveEffect") {
            for (/** @type {Pl1eActiveEffect} */ const activeEffect of documents) {
                await activeEffect.removeTokenEffect(this);
            }
        }

        super._onDeleteEmbeddedDocuments(embeddedName, documents, result, options, userId);
    }

    _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
        super._onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId);
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
        const systemData = this.system;
        const actorMisc = systemData.misc;
        const actorGeneral = systemData.general;

        // Selection based values
        actorMisc.sizeMultiplier = Pl1eHelpers.getConfig("sizes", actorMisc.size, "multiplier");
        actorMisc.tokenSize = Pl1eHelpers.getConfig("sizes", actorMisc.size, "token");
        actorMisc.movement = Pl1eHelpers.getConfig("speeds", actorMisc.speed, "movement");
        actorMisc.baseInitiative = Pl1eHelpers.getConfig("speeds", actorMisc.speed, "baseInitiative");

        actorGeneral.level = Pl1eHelpers.XPToLevel(this, actorGeneral.experience);
        actorGeneral.experienceNeeded = Pl1eHelpers.levelToXP(this, actorGeneral.level + 1);
        const experienceReached = Pl1eHelpers.levelToXP(this, actorGeneral.level);
        actorGeneral.levelProgression = 100 * (actorGeneral.experience - experienceReached) /
            (actorGeneral.experienceNeeded - experienceReached);
        actorGeneral.ranks = actorGeneral.experience;
        actorGeneral.maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);
    }

    /** @inheritDoc */
    async prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();

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
    async prepareDerivedData() {
        super.prepareDerivedData();

        const systemData = this.system;
        const actorResources = systemData.resources;
        const actorMisc = systemData.misc;
        const actorGeneral = systemData.general;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;

        // Apply passive values
        for (/** @type {Pl1eItem} */ const item of this.items) {
            for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                if (aspect.createEffect || !item.isEnabled) continue;
                Pl1eAspect.applyPassiveValue(aspect, id, this);
            }
        }

        // Handle actorCharacteristics scores.
        for (let [id, characteristic] of Object.entries(actorCharacteristics)) {
            characteristic.mod = characteristic.mods.filter(value => value < 0).reduce((a, b) => a + b, 0)
                + Math.max(...characteristic.mods.filter(value => value > 0), 0);
            characteristic.value = characteristic.base + characteristic.mod;
        }

        // Handle actorResources scores.
        for (let [id, resource] of Object.entries(actorResources)) {
            const resourceConfig = Pl1eHelpers.getConfig("resources", id);
            resource.max = 0;
            for (let characteristic of resourceConfig.weights.characteristics) {
                resource.max += actorCharacteristics[characteristic].value;
            }
            resource.max *= resourceConfig.multiplier * actorMisc.sizeMultiplier;
            if (resource.value > resource.max) resource.value = resource.max;
        }

        // Handle actorSkills scores.
        for (let [id, skill] of Object.entries(actorSkills)) {
            const skillConfig = Pl1eHelpers.getConfig("skills", id);
            if (!skillConfig) continue;

            let characteristicsSum = 0;
            for (let characteristic of skillConfig.weights.characteristics) {
                characteristicsSum += actorCharacteristics[characteristic].value;
            }
            let attributesSum = 0;
            for (let misc of skillConfig.weights.misc) {
                attributesSum += actorMisc[misc];
            }
            skill.number = Math.floor(characteristicsSum / skillConfig.divider);
            skill.number = Math.clamped(skill.number + skill.numberMod + attributesSum, 1, 10);
            skill.diceMod += actorGeneral.advantages;
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
        let formula = skill.usable ? skill.number + "d" + skill.dice : "0d0";
        formula += skill.explosion ? "xo" + skill.dice : "";
        formula += "cs>=4";
        formula += skill.implosion ? "df=1" : "";
        let roll = new Roll(formula, this.getRollData());
        roll.skillName = skillName;
        return  roll.evaluate({async: true});
    }

    /**
     * Roll a skill based on rollBestSkill value and return the roll
     * @param {string[]} skillNames
     * @returns {Promise<Roll>}
     */
    async rollSkills(skillNames) {
        if (skillNames.length > 1) {
            if (this.system.general.rollBestSkill) {
                let skillAvg = Number.NEGATIVE_INFINITY;
                let bestSkillName = undefined;
                for (let skillName of skillNames) {
                    const skill = this.system.skills[skillName];
                    const currentSkillAvg = skill.usable ? (skill.dice + 1) / 2 * skill.number : 0;
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
     * @returns {Promise<void>}
     */
    async addItem(item, childId = undefined) {
        const gatherItemData = async (item, childId, behavior = "regular", data = []) => {
            const itemCopy = item.toObject()
            const parentId = randomID();
            itemCopy.flags = {
                pl1e: {
                    childId: childId || null,  // If childId might be undefined or falsy
                    parentId: parentId,
                    behavior: behavior
                },
                core: {
                    sourceId: item.uuid
                }
            };
            data.push(itemCopy);

            // Add item children
            for (const refItem of await item.getRefItems()) {
                // Add item child if actor should
                const itemChildren = Pl1eHelpers.getConfig("actorTypes", this.type, "itemChildren");
                if (!itemChildren.includes(refItem.item.type)) continue;

                await gatherItemData(refItem.item, parentId, refItem.behavior, data)
            }
            return data;
        }

        const itemsData = await gatherItemData(item, childId);
        await this.createEmbeddedDocuments("Item", itemsData);
    }

    /**
     * Delete an item and all child items as embedded documents
     * @param {Pl1eItem} item
     * @returns {Promise<void>}
     */
    async removeItem(item) {
        if (!item) return;

        // Function to recursively gather item IDs
        const gatherItemIds = (item, ids = []) => {
            ids.push(item.id); // Add the current item's ID
            item.childItems.forEach(child => gatherItemIds(child, ids)); // Recurse for children
            return ids;
        }

        // Gather IDs for the item and its children
        const itemIds = gatherItemIds(item);

        // Delete all items in a single call
        await this.deleteEmbeddedDocuments("Item", itemIds);
    }


    /**
     * Add a new ref RollTable
     * @param {RollTable} rollTable
     * @returns {Promise<void>}
     */
    async addRefRollTable(rollTable) {
        this.system.refRollTables.push(rollTable._id);
        await this.update({
            "system.refRollTables": this.system.refRollTables
        });
    }

    /**
     * Remove a ref RollTable
     * @param {RollTable} rollTable)
     * @returns {Promise<void>}
     */
    async removeRefRollTable(rollTable) {
        this.system.refRollTables.splice(this.system.refRollTables.indexOf(rollTable._id), 1);
        await this.update({
            "system.refRollTables": this.system.refRollTables
        });
    }

}