import {Pl1eItem} from "./item.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";
import {ItemSelector} from "../../apps/itemSelector.mjs";

export class Pl1eAbility extends Pl1eItem {

    /** @inheritDoc */
    async _canActivate(characterData) {
        if (!await super._canActivate(characterData)) return false;
        const itemAttributes = characterData.attributes;

        if (this._getLinkableItems(characterData).length === 0) {
            ui.notifications.info(game.i18n.localize("PL1E.NoLinkedItemMatch"));
            return false;
        }
        if (itemAttributes.healthCost > 0 && itemAttributes.healthCost > characterData.actor.system.resources.health.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughHealth"));
            return false;
        }
        if (itemAttributes.staminaCost > 0 && itemAttributes.staminaCost > characterData.actor.system.resources.stamina.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughStamina"));
            return false;
        }
        if (itemAttributes.manaCost > 0 && itemAttributes.manaCost > characterData.actor.system.resources.mana.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughMana"));
            return false;
        }
        if (itemAttributes.healthCost > 0 && itemAttributes.healthCost > characterData.actor.system.resources.health.value) {
            ui.notifications.info(game.i18n.localize("PL1E.NotEnoughUses"));
            return false;
        }

        // Get weapons using the same mastery
        const relatedItems = this._getLinkableItems(characterData);
        if (relatedItems.length === 0) {
            return true;
        }
        else if (relatedItems.length === 1) {
            characterData.linkedItem = relatedItems[0];
            characterData.linkedItemId = relatedItems[0].id;
        }
        else {
            characterData.linkedItem = await ItemSelector.createAndRender(this.actor, relatedItems);
            if (characterData.linkedItem === null) return false;
            characterData.linkedItemId = characterData.linkedItem.id;
        }

        return true;
    }

    /** @inheritDoc */
    async _linkItem(characterData) {
        const attributes = characterData.attributes;
        const linkedItemAttributes = characterData.linkedItem.system.attributes;

        switch (attributes.weaponMode) {
            case "melee":
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentRange, 'reach', 'range');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentRoll, 'meleeRoll', 'roll');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentOppositeRoll, 'meleeOppositeRoll', 'oppositeRoll');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentActivationMacro, 'meleeActivationMacro', 'activationMacro');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentPreLaunchMacro, 'meleePreLaunchMacro', 'preLaunchMacro');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentPostLaunchMacro, 'meleePostLaunchMacro', 'postLaunchMacro');
                break;
            case "range":
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentRange, 'range');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentRoll, 'rangeRoll', 'roll');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentOppositeRoll, 'rangeOppositeRoll', 'oppositeRoll');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentActivationMacro, 'rangeActivationMacro', 'activationMacro');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentPreLaunchMacro, 'rangePreLaunchMacro', 'preLaunchMacro');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentPostLaunchMacro, 'rangePostLaunchMacro', 'postLaunchMacro');
                break;
            case "magic":
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentRoll, 'magicRoll', 'roll');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentOppositeRoll, 'magicOppositeRoll', 'oppositeRoll');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentActivationMacro, 'magicActivationMacro', 'activationMacro');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentPreLaunchMacro, 'magicPreLaunchMacro', 'preLaunchMacro');
                Pl1eHelpers.assignIfDefined(linkedItemAttributes, attributes, attributes.useParentPostLaunchMacro, 'magicPostLaunchMacro', 'postLaunchMacro');
                break;
        }

        // Use the parent active aspects when launching the ability
        if (attributes.launchParentActiveAspects) {
            Pl1eHelpers.mergeDeep(characterData.activeAspects, await characterData.linkedItem.getCombinedActiveAspects());
        }
    }

    /**
     * Return the linkable items for this ability
     * @param {CharacterData} characterData
     * @returns {Pl1eItem[]}
     */
    _getLinkableItems(characterData) {
        const relatedItems = [];
        for (/** @type {Pl1eItem} **/ const item of characterData.item.sameItems) {
            const parentItem = item.linkableParentItem;
            // If no parent then skip
            if (!parentItem) continue;
            // Need major action that is already used
            if (characterData.attributes.isMajorAction && parentItem.system.majorActionUsed) continue;
            // Weapon mode is melee but parent does not use melee
            if (characterData.attributes.weaponMode === "melee" && parentItem.system.attributes.meleeUse !== undefined
                && !parentItem.system.attributes.meleeUse) continue;
            // Weapon mode is range but parent does not use ranged
            if (characterData.attributes.weaponMode === "range" && parentItem.system.attributes.rangedUse !== undefined
                && !parentItem.system.attributes.rangedUse) continue;
            // Weapon mode is magic but parent does not use magic
            if (characterData.attributes.weaponMode === "magic" && parentItem.system.attributes.magicUse !== undefined
                && !parentItem.system.attributes.magicUse) continue;
            // Parent usages are not enough
            if (parentItem.system.attributes.uses !== undefined && parentItem.system.attributes.uses > 0
                && parentItem.system.removedUses !== undefined && characterData.attributes.linkedUsageCost > 0
                && parentItem.system.attributes.uses - parentItem.system.removedUses - characterData.attributes.linkedUsageCost < 0) continue;
            // The parent is a valid linkable item
            relatedItems.push(parentItem);
        }
        return relatedItems;
    }

}