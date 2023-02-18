import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {AbilityTemplate} from "../helpers/abilityTemplate.mjs";
import {PL1E} from "../helpers/config.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class Pl1eItem extends Item {

    templatesArray = [];

    //region Accessors

    get hasRecovery() {
        let itemAttributes = this.system.attributes;
        return itemAttributes.healthRecovery.apply || itemAttributes.staminaRecovery.apply || itemAttributes.manaRecovery.apply;
    }

    get hasDamage() {
        let itemAttributes = this.system.attributes;
        return itemAttributes.slashing.apply || itemAttributes.crushing.apply || itemAttributes.piercing.apply
        || itemAttributes.burn.apply || itemAttributes.cold.apply || itemAttributes.shock.apply || itemAttributes.acid.apply;
    }

    //endregion

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
        // Merge config data
        system.price = Pl1eHelpers.mergeDeep(system.price, CONFIG.PL1E.currency);
        system.attributes = Pl1eHelpers.mergeDeep(system.attributes, CONFIG.PL1E.attributes);
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

        if (save) {
            await this.saveEmbedItems();
        }
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
                return this.useConsumable();
            case 'wearable':
                return await this.toggleWearable(this.parent);
            case 'weapon':
                return await this.toggleWeapon(true, this.parent)
            case 'ability':
                return await this.useAbility(this.parent);
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

    async useAbility(actor) {
        if (!this._isContextValid(actor)) return;
        const itemAttributes = this.system.attributes;

        // Target selection template
        await actor.sheet?.minimize();
        for (let i = 0; i < itemAttributes.targetNumber.value; i++) {
            this.templatesArray.push(await AbilityTemplate.fromItem(this)?.drawPreview());
        }
        await actor.sheet?.maximize();

        // Destroy templates after fetching target with df-template
        // for (const templates of templatesArray) {
        //     for (const template of templates) {
        //         await template.delete();
        //     }
        // }

        // Launch main roll
        let mainRoll;
        if (itemAttributes.mainRoll.apply) {
            const mainSkill = actor.system.skills[itemAttributes.mainRoll.value];
            mainRoll = await actor.rollSkill(mainSkill);
            mainRoll['stats'] = this._calculateStats(mainRoll.result);
        }

        // Launch opposite roll
        let oppositeRolls = [];
        if (itemAttributes.oppositeRoll.apply) {
            let targets = game.user.targets;
            if (targets < 1) return ui.notifications.info(game.i18n.localize("MACRO.NoTarget"));
            if (itemAttributes.targetNumber.apply) {
                const targetNumber = itemAttributes.targetNumber.value;
                if (targets.size > targetNumber)
                    return ui.notifications.info(game.i18n.localize("MACRO.TooMuchTarget") + " (" + targetNumber + " MAX)");
                targets = game.user.targets;
            }
            else if (targets.size > 1)
                return ui.notifications.info(game.i18n.localize("MACRO.TooMuchTarget") + " (1 MAX)" )
            for (let target of targets) {
                const defenseSkill = target.actor.system.skills[itemAttributes.oppositeRoll.value];
                const defenseRoll = await target.actor.rollSkill(defenseSkill);
                defenseRoll['stats'] = this._calculateStats(defenseRoll.result, target.actor);
                oppositeRolls.push(defenseRoll);
            }
        }

        // Render the chat card template
        const token = this.actor.token;
        const templateData = {
            actor: this.actor.toObject(false),
            tokenId: token?.uuid || null,
            item: this.toObject(false),
            itemId: this.uuid,
            labels: this.labels,
            simpleRoll: oppositeRolls.length <= 0,
            mainRoll: mainRoll,
            oppositeRolls: oppositeRolls,
            hasRecovery: this.hasRecovery,
            hasDamage: this.hasDamage
        };
        const html = await renderTemplate("systems/pl1e/templates/chat/item-card.hbs", templateData);
        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: html,
            // flavor: this.system.description || this.name,
            speaker: ChatMessage.getSpeaker({actor: this.actor, token}),
            flags: {"core.canPopout": true}
        };
        // If the Item was destroyed in the process of displaying its card - embed the item data in the chat message
        if ( (this.type === "consumable") && !this.actor.items.has(this.id) ) {
            chatData.flags["pl1e.itemData"] = templateData.item;
        }
        await ChatMessage.create(chatData);
    }

    /**
    * Check if the ability context is valid
    * @private
    */
    _isContextValid(actor) {
        let isValid = true;
        const itemAttributes = this.system.attributes;
        // If is not in battle
        // if (!actor.token.inCombat) {
        //     ui.notifications.warn(game.i18n.localize("MACRO.NotInBattle"));
        //     isValid = false;
        // }
        // If is not memorized
        if (!this.system.isMemorized) {
            ui.notifications.warn(game.i18n.localize("MACRO.NotMemorizedWarn"));
            isValid = false;
        }
        // If cost is not affordable
        if (itemAttributes.healthCost.apply && itemAttributes.healthCost.value > actor.system.resources.health.value) {
            ui.notifications.info(game.i18n.localize("MACRO.NotEnoughHealthWarn"));
            isValid = false;
        }
        if (itemAttributes.staminaCost.apply && itemAttributes.staminaCost.value > actor.system.resources.stamina.value) {
            ui.notifications.info(game.i18n.localize("MACRO.NotEnoughStaminaWarn"));
            isValid = false;
        }
        if (itemAttributes.manaCost.apply && itemAttributes.manaCost.value > actor.system.resources.mana.value) {
            ui.notifications.info(game.i18n.localize("MACRO.NotEnoughManaWarn"));
            isValid = false;
        }
        return isValid;
    }

    _calculateStats(rollResult, targetActor = undefined) {
        const itemAttributes = this.system.attributes;
        const actorAttributes = this.actor.system.attributes;
        const targetActorAttributes = targetActor?.system.attributes;
        let stats = {
            slashing: 0,
            crushing: 0,
            piercing: 0,
            burn: 0,
            cold: 0,
            shock: 0,
            acid: 0,
            healthRecovery: 0,
            staminaRecovery: 0,
            manaRecovery: 0,
            healthVampirism: 0,
            staminaVampirism: 0,
            manaVampirism: 0,
        };
        // Only applied when target actor is set
        if (targetActor !== undefined) {
            // Damages
            if (itemAttributes.slashing.apply)
                stats.slashing += itemAttributes.slashing.value * rollResult - targetActorAttributes.slashingReduction;
            if (itemAttributes.crushing.apply)
                stats.crushing += itemAttributes.crushing.value * rollResult - targetActorAttributes.crushingReduction;
            if (actorAttributes.piercing.apply)
                stats.piercing += itemAttributes.piercing.value * rollResult - targetActorAttributes.piercingReduction;
            if (itemAttributes.burn.apply)
                stats.burn += itemAttributes.burn.value * rollResult - targetActorAttributes.burnReduction;
            if (itemAttributes.cold.apply)
                stats.cold += itemAttributes.cold.value * rollResult - targetActorAttributes.coldReduction;
            if (actorAttributes.shock.apply)
                stats.shock += itemAttributes.shock.value * rollResult - targetActorAttributes.shockReduction;
            if (actorAttributes.acid.apply)
                stats.acid += itemAttributes.acid.value * rollResult - targetActorAttributes.acidReduction;
            // Weapon damages

            // Vampirism
            // if (itemAttributes.healthVampirism.apply)
            //     stats.healthVampirism = itemAttributes.healthVampirism.value * rollResult;
            // if (itemAttributes.staminaVampirism.apply)
            //     stats.staminaVampirism = itemAttributes.staminaVampirism.value * rollResult;
            // if (itemAttributes.manaVampirism.apply)
            //     stats.manaVampirism = itemAttributes.manaVampirism.value * rollResult;
        }
        // Recovery
        if (itemAttributes.healthRecovery.apply)
            stats.healthRecovery = itemAttributes.healthRecovery.value * rollResult;
        if (itemAttributes.staminaRecovery.apply)
            stats.staminaRecovery = itemAttributes.staminaRecovery.value * rollResult;
        if (itemAttributes.manaRecovery.apply)
            stats.manaRecovery = itemAttributes.manaRecovery.value * rollResult;
        // Filter stats
        const asArray = Object.entries(stats);
        const filtered = asArray.filter(([key, value]) => value > 0);
        return Object.fromEntries(filtered);
    }

    //endregion

}
