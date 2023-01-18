/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
    return loadTemplates([

        // Actor partials.
        "systems/pl1e/templates/actor/parts/actor-stats.hbs",
        "systems/pl1e/templates/actor/parts/actor-features.hbs",
        "systems/pl1e/templates/actor/parts/actor-items.hbs",
        "systems/pl1e/templates/actor/parts/actor-effects.hbs",

        // Item partials.
        "systems/pl1e/templates/item/parts/item-attributes.hbs",
        "systems/pl1e/templates/item/parts/item-description.hbs",
        "systems/pl1e/templates/item/parts/item-linked.hbs",

        // Feature partials.
        "systems/pl1e/templates/item/parts/feature-attributes.hbs",
        "systems/pl1e/templates/item/parts/feature-description.hbs",
        "systems/pl1e/templates/item/parts/feature-linked.hbs"

    ]);
};
