/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([

        // Actor parts
        "systems/pl1e/templates/actor/parts/config-parameters.hbs",
        "systems/pl1e/templates/actor/parts/config-roll-tables.hbs",
        "systems/pl1e/templates/actor/parts/abilities.hbs",
        "systems/pl1e/templates/actor/parts/features-background.hbs",
        "systems/pl1e/templates/actor/parts/features-background-row.hbs",
        "systems/pl1e/templates/actor/parts/effects.hbs",
        "systems/pl1e/templates/actor/parts/features-features.hbs",
        "systems/pl1e/templates/actor/parts/features-features-row.hbs",
        "systems/pl1e/templates/actor/parts/inventory-commons.hbs",
        "systems/pl1e/templates/actor/parts/inventory-consumables.hbs",
        "systems/pl1e/templates/actor/parts/inventory-modules.hbs",
        "systems/pl1e/templates/actor/parts/inventory-money.hbs",
        "systems/pl1e/templates/actor/parts/inventory-weapons.hbs",
        "systems/pl1e/templates/actor/parts/inventory-wearables.hbs",
        "systems/pl1e/templates/actor/parts/stats-characteristics.hbs",
        "systems/pl1e/templates/actor/parts/stats-skills.hbs",
        "systems/pl1e/templates/actor/parts/stats-favorites.hbs",

        // Item parts
        "systems/pl1e/templates/item/parts/ability-attributes.hbs",
        "systems/pl1e/templates/item/parts/class-attributes.hbs",
        "systems/pl1e/templates/item/parts/common-attributes.hbs",
        "systems/pl1e/templates/item/parts/consumable-attributes.hbs",
        "systems/pl1e/templates/item/parts/culture-attributes.hbs",
        "systems/pl1e/templates/item/parts/feature-attributes.hbs",
        "systems/pl1e/templates/item/parts/item-description.hbs",
        "systems/pl1e/templates/item/parts/item-linked.hbs",
        "systems/pl1e/templates/item/parts/item-linked.hbs",
        "systems/pl1e/templates/item/parts/mastery-attributes.hbs",
        "systems/pl1e/templates/item/parts/module-attributes.hbs",
        "systems/pl1e/templates/item/parts/race-attributes.hbs",
        "systems/pl1e/templates/item/parts/weapon-attributes.hbs",
        "systems/pl1e/templates/item/parts/wearable-attributes.hbs",

        // Item parts
        "systems/pl1e/templates/item/components/active-aspect-invocation.hbs",
        "systems/pl1e/templates/item/components/active-aspect-macro.hbs",
        "systems/pl1e/templates/item/components/active-aspect-modify.hbs",
        "systems/pl1e/templates/item/components/active-aspect-movement.hbs",
        "systems/pl1e/templates/item/components/active-aspect-status.hbs",
        "systems/pl1e/templates/item/components/active-aspect-transfer.hbs",
        "systems/pl1e/templates/item/components/icons-ability.hbs",
        "systems/pl1e/templates/item/components/icons-class.hbs",
        "systems/pl1e/templates/item/components/icons-common.hbs",
        "systems/pl1e/templates/item/components/icons-consumable.hbs",
        "systems/pl1e/templates/item/components/icons-culture.hbs",
        "systems/pl1e/templates/item/components/icons-feature.hbs",
        "systems/pl1e/templates/item/components/icons-mastery.hbs",
        "systems/pl1e/templates/item/components/icons-module.hbs",
        "systems/pl1e/templates/item/components/icons-race.hbs",
        "systems/pl1e/templates/item/components/icons-weapon.hbs",
        "systems/pl1e/templates/item/components/icons-wearable.hbs",
        "systems/pl1e/templates/item/components/item-aspects-actives.hbs",
        "systems/pl1e/templates/item/components/item-aspects-passives.hbs",
        "systems/pl1e/templates/item/components/passive-aspect-macro.hbs",
        "systems/pl1e/templates/item/components/passive-aspect-modify.hbs",
        "systems/pl1e/templates/item/components/passive-aspect-status.hbs",
        
        // Rest parts
        "systems/pl1e/templates/rest/parts/crafting.hbs",
        "systems/pl1e/templates/rest/parts/sleep-and-meal.hbs",
        "systems/pl1e/templates/rest/parts/training.hbs"
    ]);
};