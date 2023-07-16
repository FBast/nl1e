/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([

        // Actor partials
        "systems/pl1e/templates/actor/parts/character-stats.hbs",
        "systems/pl1e/templates/actor/parts/character-features.hbs",
        "systems/pl1e/templates/actor/parts/character-items.hbs",
        "systems/pl1e/templates/actor/parts/merchant-items.hbs",
        "systems/pl1e/templates/actor/parts/merchant-features.hbs",
        "systems/pl1e/templates/actor/parts/merchant-config.hbs",
        "systems/pl1e/templates/actor/parts/npc-stats.hbs",

        // Actor components
        "systems/pl1e/templates/actor/components/resources.hbs",
        "systems/pl1e/templates/actor/components/characteristics.hbs",
        "systems/pl1e/templates/actor/components/skills.hbs",
        "systems/pl1e/templates/actor/components/attributes-general.hbs",
        "systems/pl1e/templates/actor/components/attributes-reductions.hbs",
        "systems/pl1e/templates/actor/components/attributes-misc.hbs",
        "systems/pl1e/templates/actor/components/items-weapons.hbs",
        "systems/pl1e/templates/actor/components/items-wearables.hbs",
        "systems/pl1e/templates/actor/components/items-consumables.hbs",
        "systems/pl1e/templates/actor/components/items-commons.hbs",
        "systems/pl1e/templates/actor/components/features-features.hbs",
        "systems/pl1e/templates/actor/components/features-restricted.hbs",
        "systems/pl1e/templates/actor/components/features-abilities.hbs",
        "systems/pl1e/templates/actor/components/features-effects.hbs",
        "systems/pl1e/templates/actor/components/roll-tables.hbs",

        // Item partials
        "systems/pl1e/templates/item/parts/ability-attributes.hbs",
        "systems/pl1e/templates/item/parts/common-attributes.hbs",
        "systems/pl1e/templates/item/parts/consumable-attributes.hbs",
        "systems/pl1e/templates/item/parts/feature-attributes.hbs",
        "systems/pl1e/templates/item/parts/item-description.hbs",
        "systems/pl1e/templates/item/parts/item-linked.hbs",
        "systems/pl1e/templates/item/parts/weapon-attributes.hbs",
        "systems/pl1e/templates/item/parts/wearable-attributes.hbs",

        // Item components
        "systems/pl1e/templates/item/components/price.hbs",
        "systems/pl1e/templates/item/components/item-aspects-passives.hbs",
        "systems/pl1e/templates/item/components/item-aspects-actives.hbs"

    ]);
};