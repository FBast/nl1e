import {AbilityTemplate} from "../helpers/abilityTemplate.mjs";
import {PL1E} from "../helpers/config.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Pl1eItem extends Item {

    get isOriginal() {
        const sourceId = this.getFlag('core', 'sourceId');
        return !sourceId || sourceId === this.uuid;
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
        if (data.name.includes("New Item")) {
            const name = game.i18n.localize(CONFIG.PL1E.defaultNames[data.type]);
            if (name) updateData['name'] = name;
        }
        await this.updateSource(updateData);
    }

    /**
     * Augment the basic Item data model with additional dynamic data.
     */
    prepareData() {
        // As with the actor class, items are documents that can have their data
        // preparation methods overridden (such as prepareBaseData()).
        super.prepareData();

        // Prepare Embed items
        if (!(this.system.subItemsMap instanceof Map)) {
            const itemsData = Array.isArray(this.system.subItemsMap) ? this.system.subItemsMap : [];
            this.system.subItemsMap = new Map();

            itemsData.forEach((item) => {
                this.addEmbedItem(item, { save: false, newId: false });
            });
        }
    }

    /** @override */
    prepareBaseData() {
        const system = this.system;
        // Activate conditionnal attributes
        for (let [key, attribute] of Object.entries(system.attributes)) {
            if (['header', 'fixed'].includes(attribute.category) && attribute.conditions === undefined)
                attribute.apply = true;
            if (attribute.conditions !== undefined) {
                for (const andCondition of attribute.conditions.split('||')) {
                    let isValid = true;
                    for (const condition of andCondition.split('&&')) {
                        if (condition.includes('!==')) {
                            const attributeCondition = condition.split('!==')[0];
                            let attributeValue = condition.split('!==')[1];
                            if (attributeValue === 'true') attributeValue = true;
                            if (attributeValue === 'false') attributeValue = false;
                            if (/^\d+$/.test(attributeValue)) attributeValue = +attributeValue;
                            if (system.attributes[attributeCondition].value === attributeValue) isValid = false;
                        }
                        else if(condition.includes('===')) {
                            const attributeCondition = condition.split('===')[0];
                            let attributeValue = condition.split('===')[1];
                            if (attributeValue === 'true') attributeValue = true;
                            if (attributeValue === 'false') attributeValue = false;
                            if (system.attributes[attributeCondition].value !== attributeValue) isValid = false;
                        }
                    }
                    attribute.apply = isValid;
                    if (attribute.apply) break;
                }
                if (!attribute.apply && attribute.fallback !== undefined)
                    attribute.value = attribute.fallback;
            }
        }
    }

    /**
     * Prepare a data object which is passed to any Roll formulas which are created related to this Item
     * @private
     */
    getRollData() {
        // If present, return the actor's roll data.
        if (!this.actor) return null;
        const rollData = this.actor.getRollData();
        // Grab the item's system data as well.
        rollData.item = foundry.utils.deepClone(this.system);
        return rollData;
    }

    //endregion

    //region Embedded items

    /**
     * A reference to the Collection of embedded Item instances in the document, indexed by _id.
     * @returns {Collection<BaseItem>}
     */
    get subItemsMap() {
        return this.system.subItemsMap || new Map();
    }

    /**
     * Shortcut for this.items.get
     * @param id
     * @return {Pl1eItem|null}
     */
    getEmbedItem(id) {
        return this.subItemsMap?.get(id) || null;
    }

    /**
     * Add a Embed Item
     * @param {Pl1eItem} item Object to add
     * @param {string} childId link id between parent and children
     * @param {boolean} save   if we save in db or not (used internally)
     * @param {boolean} newId  if we change the id
     * @return {Promise<string>}
     */
    async addEmbedItem(item, { childId = undefined, save = true, newId = true } = {}) {
        if (!item) return;

        if (!(item instanceof Item) && item?.name && item?.type) {
            // Data -> Item
            item = new Pl1eItem(item);
        }

        // New id
        if (newId || !item._id) {
            // Bypass the readonly for "_id"
            const tmpData = item.toJSON();
            tmpData._id = foundry.utils.randomID();
            item = new Pl1eItem(tmpData);
        }

        // Copy the parent permission to the sub item
        // In v10 actor's items inherit the ownership from the actor, but theirs ownership do not reflect that.
        // So we must take actor's ownership for sub-item
        item.ownership = this.actor?.ownership ?? this.ownership;

        // Add child id if defined
        if (childId !== undefined) item.system.childId = childId;

        // If this item has sub items
        if (item.system.subItemsMap !== undefined && item.system.subItemsMap.size > 0 && childId === undefined) {
            let linkId = randomID();
            item.system.parentId = linkId;
            for (let [key, subItem] of item.system.subItemsMap) {
                await this.addEmbedItem(subItem, { childId : linkId });
            }
        }

        // Object
        this.system.subItemsMap.set(item._id, item);

        if (save) await this.saveEmbedItems();

        return item._id;
    }

    /**
     * Save all the Embed Items
     * @return {Promise<void>}
     */
    async saveEmbedItems() {
        await this.update({
            "system.subItemsMap": Array.from(this.system.subItemsMap).map(([id, item]) => item.toObject(false)),
        });
        this.sheet.render(false);
    }

    /**
     * Delete the Embed Item and clear the actor bonus if any
     * @param id Item id
     * @param {boolean} save   if we save in db or not (used internally)
     * @return {Promise<void>}
     */
    async deleteEmbedItem(id, { save = true} = {}) {
        if (!this.system.subItemsMap.has(id)) {
            return;
        }

        // Remove the embed item
        this.system.subItemsMap.delete(id);

        if (save) {
            await this.saveEmbedItems();
        }
    }

    //endregion

    //region Item interactions

    /**
     * Handle clickable rolls.
     * @param {Event} event   The originating click event
     * @private
     */
    async roll() {
        const item = this;

        // Initialize chat data.
        const speaker = ChatMessage.getSpeaker({actor: this.actor});
        const rollMode = game.settings.get('core', 'rollMode');
        const label = `[${item.type}] ${item.name}`;

        // If there's no roll data, send a chat message.
        if (!this.system.formula) {
            ChatMessage.create({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
                content: item.system.description ?? ''
            });
        }
        // Otherwise, create a roll and send a chat message from it.
        else {
            // Retrieve roll data.
            const rollData = this.getRollData();

            // Invoke the roll and submit it to chat.
            const roll = new Roll(rollData.item.formula, rollData);
            // If you need to store the value first, uncomment the next line.
            // let result = await roll.roll({async: true});
            roll.toMessage({
                speaker: speaker,
                rollMode: rollMode,
                flavor: label,
            });
            return roll;
        }
    }

    /**
     * Trigger an item usage, optionally creating a chat message with followup actions.
     * @returns {Promise<ChatMessage|object|void>} Chat message if options.createMessage is true, message data if it is
     *                                             false, and nothing if the roll wasn't performed.
     */
    async use() {
        switch (this.type) {
            case 'consumable':
                await this.useConsumable(this.parent);
                break;
            case 'wearable':
                await this.toggleWearable(this.parent);
                break;
            case 'weapon':
                await this.toggleWeapon(true, this.parent)
                break;
            case 'ability':
                await this.useAbility(this.parent);
                break;
        }
    }

    /**
     * Handle toggling the state of an Owned Weapon within the Actor.
     * @param {boolean} main if the hand is the main hand
     * @param {Actor} actor the actor where the weapon is toggle
     * @constructor
     */
    async toggleWeapon(main, actor) {
        const hands = this.system.attributes.hands.value;
        // Toggle item hands
        if (hands === 2) {
            await this.update({
                ["system.isEquippedMain"]: !foundry.utils.getProperty(this, "system.isEquippedMain"),
                ["system.isEquippedSecondary"]: !foundry.utils.getProperty(this, "system.isEquippedSecondary")
            });
        }
        else if (main) {
            // Switch hand case
            if (!this.system.isEquippedMain && this.system.isEquippedSecondary) {
                await this.update({["system.isEquippedSecondary"]: false});
            }
            await this.update({["system.isEquippedMain"]: !foundry.utils.getProperty(this, "system.isEquippedMain")})
        }
        else {
            // Switch hand case
            if (!this.system.isEquippedSecondary && this.system.isEquippedMain) {
                await this.update({["system.isEquippedMain"]: false});
            }
            await this.update({["system.isEquippedSecondary"]: !foundry.utils.getProperty(this, "system.isEquippedSecondary")});
        }
        // Unequip other items
        for (let otherItem of actor.items) {
            // Ignore if otherItem is not a weapon
            if (otherItem.type !== 'weapon') continue;
            // Ignore if otherItem is item
            if (otherItem === this) continue;
            // If other item is equipped on main and this item is equipped on main
            if (otherItem.system.isEquippedMain && this.system.isEquippedMain) {
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
            if (otherItem.system.isEquippedSecondary && this.system.isEquippedSecondary) {
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
        actor.sheet.render(false);
    }

    async toggleWearable(actor) {
        const slot = this.system.attributes.slot.value;
        // Ignore if not using a slot
        if (!['clothes', 'armor', 'ring', 'amulet'].includes(slot)) return;
        // Toggle item slot
        await this.update({
            ["system.isEquipped"]: !foundry.utils.getProperty(this, "system.isEquipped"),
        });
        // If unequipped then return
        if (!this.system.isEquipped) return;
        let ringCount = 1;
        // Unequip other items
        for (let otherItem of actor.items) {
            // Ignore if otherItem is not a wearable
            if (otherItem.type !== 'wearable') continue;
            // Ignore if otherItem is item
            if (otherItem === this) continue;
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
                    } else {
                        ringCount++;
                    }
                }
            }
        }
        actor.sheet.render(false);
    }

    async useConsumable(actor) {
        const attributes = PL1E.attributes;
        // Removed one use
        await this.update({
            ["system.removedUses"]: foundry.utils.getProperty(this, "system.removedUses") + 1,
        });
        // Launch consumable effect
        for (let [id, attribute] of Object.entries(this.system.attributes)) {
            if (!attribute.apply || attributes[id]["path"] === undefined) continue;
            if (attributes[id]["operator"] === 'set') {
                foundry.utils.setProperty(actor.system, attributes[id]["path"], attribute.value);
            } else if (attributes[id]["operator"] === 'push') {
                let currentValue = foundry.utils.getProperty(actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = [];
                currentValue.push(attribute.value);
                foundry.utils.setProperty(actor.system, attributes[id]["path"], currentValue);
            } else if (attributes[id]["operator"] === 'add') {
                let currentValue = foundry.utils.getProperty(actor.system, attributes[id]["path"]);
                if (currentValue === undefined) currentValue = 0;
                await actor.update({
                    ["system." + attributes[id]["path"]]: currentValue + attribute.value
                });
            }
        }
        // The item have no more uses and is not reloadable
        if (this.system.removedUses >= this.system.attributes.uses.value && !this.system.attributes.reloadable.value) {
            await this.delete();
        }
    }

    /**
     * Internal type used to manage ability data
     *
     * @typedef {object} AbilityData
     * @property {Pl1eActor} actor The actor using the ability
     * @property {string} tokenId The token of the actor which originate the ability
     * @property {Pl1eItem} item The ability itself
     * @property {string} itemId The ability uuid
     * @property {any} launcherData Data of the actor
     * @property {any[]} targetsData Data of the targets
     * @property {AbilityTemplate[]} templates  An array of the measure templates
     */

    /**
     * @type {AbilityData}
     */
    abilityData;

    async useAbility(actor) {
        if (!actor.bestToken === null) return;
        if (!this._isContextValid(actor)) return;

        // Copy attributes
        const attributes = JSON.parse(JSON.stringify(this.system.attributes));
        const optionalAttributes = JSON.parse(JSON.stringify(this.system.optionalAttributes));

        // Get linked attributes
        let linkedItem;
        if (attributes.abilityLink.value === 'mastery') {
            const relatedMastery = attributes.mastery.value;
            const relatedItems = actor.items.filter(value => value.type === 'weapon'
                && value.system.attributes.mastery.value === relatedMastery);
            if (relatedItems.length > 1) {
                ui.notifications.warn(game.i18n.localize("PL1E.MultipleRelatedMastery"));
                return;
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoRelatedMastery"));
                return;
            }
            linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(attributes, linkedItem.system.attributes);
            Pl1eHelpers.mergeDeep(optionalAttributes, linkedItem.system.optionalAttributes);
        }
        if (attributes.abilityLink.value === 'parent') {
            let relatedItems = [];
            for (const item of actor.items) {
                if (!item.system.isEquippedMain && !item.system.isEquippedSecondary) continue;
                if (item.system.subItemsMap === undefined) continue;
                for (let [key, subItem] of item.system.subItemsMap) {
                    const subItemFlag = subItem.getFlag('core', 'sourceId');
                    const itemFlag = this.getFlag('core', 'sourceId');
                    if (subItemFlag !== itemFlag) continue;
                    relatedItems.push(item);
                }
            }
            if (relatedItems.length === 0) {
                ui.notifications.warn(game.i18n.localize("PL1E.NoEquippedParent"));
                return;
            }
            linkedItem = relatedItems[0];
            Pl1eHelpers.mergeDeep(attributes, linkedItem.system.attributes);
            Pl1eHelpers.mergeDeep(optionalAttributes, linkedItem.system.optionalAttributes);
        }

        // Target selection template
        const templates = [];
        if (attributes.areaNumber.value !== 0) {
            await actor.sheet?.minimize();
            for (let i = 0; i < attributes.areaNumber.value; i++) {
                const template = await AbilityTemplate.fromItem(this, attributes, optionalAttributes);
                templates.push(template);
                await template?.drawPreview();
            }
            await actor.sheet?.maximize();
        }

        // Return if no area defined
        if (attributes.areaNumber.value > 0 && templates.length === 0) return;

        // Launcher Data
        const token = this.actor.bestToken;
        this.abilityData = {
            templates: templates,
            launcherData: {
                actor: this.actor,
                tokenId: token?.uuid || null,
                item: this,
                itemId: this.uuid,
                attributes: attributes,
                optionalAttributes: optionalAttributes,
                linkedItem: linkedItem
            }
        };

        // Roll Data
        if (attributes.skillRoll.value !== 'none') {
            const mainSkill = actor.system.skills[attributes.skillRoll.value];
            this.abilityData.launcherData.result = await actor.rollSkill(mainSkill);
        }

        // Render the chat card template
        const html = await renderTemplate("systems/pl1e/templates/chat/item-card.hbs", this.abilityData);

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            flavor: '[' + game.i18n.localize("PL1E.Ability") + '] ' + this.name,
            content: html,
            speaker: ChatMessage.getSpeaker({actor: this.actor}),
            flags: {"core.canPopout": true}
        };

        await ChatMessage.create(chatData);
    }

    /**
     * Handle multiples ability resolutions
     * @param action
     */
    async actionAbility(action) {
        const abilityData = this.abilityData;

        // Handle different actions
        switch (action) {
            case "resolve":
                await this._resolveAbility();
                break;
            case "counter":
                await this._counterAbility();
                break;
            case "cancel":
                await this._cancelAbility();
                break;
        }

        // Destroy templates after fetching target with df-template
        for (const template of abilityData.templates) {
            await template.releaseTemplate();
        }

        // Reset abilityData
        this.abilityData = {};
    }

    async _resolveAbility() {
        // Target Data
        let targetTokens = game.user.targets;

        for (let targetToken of targetTokens) {
            // Make a shallow copy of the ability data for this target
            let abilityData = {...this.abilityData};

            // Copy attributes
            const launcherData = abilityData.launcherData;
            const attributes = abilityData.launcherData.attributes;
            const optionalAttributes = abilityData.launcherData.optionalAttributes;

            // Opposite roll if exist
            let result = 0;
            if (attributes.oppositeRolls.value !== 'none') {
                const skill = targetToken.actor.system.skills[attributes.oppositeRolls.value];
                result = await targetToken.actor.rollSkill(skill);
            }
            let totalResult = abilityData.launcherData.result - result;

            // Iterate over optional attributes
            let calculatedAttributes = [];
            for (let [id, optionalAttribute] of Object.entries(optionalAttributes)) {
                if (optionalAttribute.targetGroup === 'self' && targetToken.actor !== launcherData.actor) continue;
                if (optionalAttribute.targetGroup === 'allies' && targetToken.document.disposition !== launcherData.actor.bestToken.disposition) continue;
                if (optionalAttribute.targetGroup === 'opponents' && targetToken.document.disposition === launcherData.actor.bestToken.disposition) continue;
                // Copy attribute
                let calculatedAttribute = JSON.parse(JSON.stringify(optionalAttribute));
                // Number type
                if (calculatedAttribute.type === 'number') {
                    if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
                        calculatedAttribute.value *= totalResult > 0 ? totalResult : 0;
                    }
                    if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
                        calculatedAttribute.value = totalResult > 0 ? calculatedAttribute.value : 0;
                    }
                    if (calculatedAttribute.reduction !== undefined && calculatedAttribute.reduction !== 'raw') {
                        let reduction = foundry.utils.getProperty(targetToken.actor.system, CONFIG.PL1E.reductionsPath[calculatedAttribute.reduction]);
                        calculatedAttribute.value = Math.min(calculatedAttribute.value + reduction, 0);
                    }
                }
                calculatedAttributes.push(calculatedAttribute);
            }

            abilityData.targetData = {
                actor: targetToken.actor,
                tokenId: targetToken?.uuid || null,
                result: result,
                totalResult: totalResult,
                attributes: calculatedAttributes
            };

            const html = await renderTemplate("systems/pl1e/templates/chat/opposite-card.hbs", abilityData);

            // Create the ChatMessage data object
            const chatData = {
                user: game.user.id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: html,
                // flavor: this.system.description || this.name,
                speaker: ChatMessage.getSpeaker({actor: targetToken.actor, targetToken}),
                flags: {"core.canPopout": true}
            };

            await ChatMessage.create(chatData);

            // Apply effects
            for (const attribute of abilityData.targetData.attributes) {
                await abilityData.targetData.actor.applyAttribute(attribute, false, true);
            }
            abilityData.targetData.actor.sheet.render(false);
        }
    }

    async _counterAbility() {

    }

    async _cancelAbility() {

    }

    /**
    * Check if the ability context is valid
    * @private
    */
    _isContextValid(actor) {
        let isValid = true;
        const itemAttributes = this.system.attributes;
        // If is not in battle
        if (!actor.bestToken.inCombat) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotInBattle"));
            isValid = false;
        }
        // If is not memorized
        if (!this.system.isMemorized) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotMemorized"));
            isValid = false;
        }
        // If cost is not affordable
        if (itemAttributes.staminaCost.apply && itemAttributes.staminaCost.value > actor.system.resources.stamina.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughStamina"));
            isValid = false;
        }
        if (itemAttributes.manaCost.apply && itemAttributes.manaCost.value > actor.system.resources.mana.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughMana"));
            isValid = false;
        }
        return isValid;
    }

    //endregion

}
