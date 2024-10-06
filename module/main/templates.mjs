/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([

        // Item partials
        "systems/pl1e/templates/item/parts/ability-attributes.hbs",
        "systems/pl1e/templates/item/parts/class-attributes.hbs",
        "systems/pl1e/templates/item/parts/common-attributes.hbs",
        "systems/pl1e/templates/item/parts/consumable-attributes.hbs",
        "systems/pl1e/templates/item/parts/culture-attributes.hbs",
        "systems/pl1e/templates/item/parts/feature-attributes.hbs",
        "systems/pl1e/templates/item/parts/item-description.hbs",
        "systems/pl1e/templates/item/parts/item-linked.hbs",
        "systems/pl1e/templates/item/parts/mastery-attributes.hbs",
        "systems/pl1e/templates/item/parts/module-attributes.hbs",
        "systems/pl1e/templates/item/parts/race-attributes.hbs",
        "systems/pl1e/templates/item/parts/weapon-attributes.hbs",
        "systems/pl1e/templates/item/parts/wearable-attributes.hbs",

        // Actor components
        "systems/pl1e/templates/actor/components/config-parameters.hbs",
        "systems/pl1e/templates/actor/components/config-roll-tables.hbs",
        "systems/pl1e/templates/actor/components/abilities.hbs",
        "systems/pl1e/templates/actor/components/features-background.hbs",
        "systems/pl1e/templates/actor/components/features-background-row.hbs",
        "systems/pl1e/templates/actor/components/effects.hbs",
        "systems/pl1e/templates/actor/components/features-features.hbs",
        "systems/pl1e/templates/actor/components/features-features-row.hbs",
        "systems/pl1e/templates/actor/components/inventory-commons.hbs",
        "systems/pl1e/templates/actor/components/inventory-consumables.hbs",
        "systems/pl1e/templates/actor/components/inventory-modules.hbs",
        "systems/pl1e/templates/actor/components/inventory-money.hbs",
        "systems/pl1e/templates/actor/components/inventory-weapons.hbs",
        "systems/pl1e/templates/actor/components/inventory-wearables.hbs",
        "systems/pl1e/templates/actor/components/stats-characteristics.hbs",
        "systems/pl1e/templates/actor/components/stats-skills.hbs",
        "systems/pl1e/templates/actor/components/stats-favorites.hbs",

        // Item components
        "systems/pl1e/templates/item/components/active-aspect-invocation.hbs",
        "systems/pl1e/templates/item/components/active-aspect-macro.hbs",
        "systems/pl1e/templates/item/components/active-aspect-modify.hbs",
        "systems/pl1e/templates/item/components/active-aspect-movement.hbs",
        "systems/pl1e/templates/item/components/active-aspect-status.hbs",
        "systems/pl1e/templates/item/components/active-aspect-transfer.hbs",
        "systems/pl1e/templates/item/components/item-aspects-actives.hbs",
        "systems/pl1e/templates/item/components/item-aspects-passives.hbs",
        "systems/pl1e/templates/item/components/item-list.hbs",
        "systems/pl1e/templates/item/components/item-tags.hbs",
        "systems/pl1e/templates/item/components/passive-aspect-macro.hbs",
        "systems/pl1e/templates/item/components/passive-aspect-modify.hbs",
        "systems/pl1e/templates/item/components/passive-aspect-status.hbs"
    ]);
};