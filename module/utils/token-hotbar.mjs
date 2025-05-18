import {Pl1eMacro} from "../helpers/macro.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

/**
 * Generate macros for a token's actor based on favorite displayed and enabled items.
 * Only includes favorite consumables and abilities. Sorted by type, level, and name.
 * Fills hotbar slots from 1 to 50, clearing unused slots.
 * @param {Token} token - The token whose actor's items will be processed.
 * @returns {Promise<void>}
 */
async function _generateTokenMacros(token) {
    let nextSlot = 1;
    const actor = token.actor;
    if (!actor) return;

    const consumables = actor.displayedItems.filter(item => item.type === "consumable" && item.system?.isFavorite);
    const abilities = actor.enabledItems.filter(item => item.type === "ability" && item.system?.isFavorite);
    const items = [...consumables, ...abilities];

    // Group by type
    const grouped = {};
    for (const item of items) {
        if (!grouped[item.type]) grouped[item.type] = [];
        grouped[item.type].push(item);
    }

    // Sort each group
    Pl1eHelpers.sortDocuments(grouped);

    // Generate macros by group
    for (const type in grouped) {
        for (const item of grouped[type]) {
            const dropData = {
                type: "Item",
                data: item,
                id: item.id
            };
            await Pl1eMacro.createMacro(dropData, nextSlot);
            nextSlot++;
        }
    }

    // Clear remaining slots
    for (let i = nextSlot; i <= 50; i++) {
        await game.user.assignHotbarMacro(null, i);
    }
}

/**
 * Save the user's current hotbar macros (all pages) into a persistent flag.
 * Used for restoring after dynamic hotbar mode is disabled.
 * @returns {Promise<void>}
 */
async function _saveUserMacros() {
    const totalPages = 5;
    const savedHotbar = [];

    for (let page = 1; page <= totalPages; page++) {
        for (const {slot, macro} of game.user.getHotbarMacros(page)) {
            savedHotbar.push({
                id: macro?.id ?? null,
                slot
            });
        }
    }

    await game.user.setFlag('pl1e', 'defaultHotbarMacros', savedHotbar);
}

/**
 * Restore the user's saved hotbar macros to their previous state.
 * If no macro is found for a slot, the slot is cleared.
 * @returns {Promise<void>}
 */
async function _restoreUserMacros() {
    const defaultHotbar = game.user.getFlag('pl1e', 'defaultHotbarMacros') || [];

    const slotMap = new Map();
    for (const { id, slot } of defaultHotbar) {
        slotMap.set(slot, id);
    }

    for (let slot = 1; slot <= 50; slot++) {
        const macroId = slotMap.get(slot);
        const macro = macroId ? game.macros.get(macroId) : null;
        await game.user.assignHotbarMacro(macro ?? null, slot);
    }
}

// Hook setup
Hooks.once("ready", () => {
    /**
     * Allow manual drop of items to hotbar, generating a macro in the process.
     */
    Hooks.on("hotbarDrop", async (bar, data, slot) => {
        if (data.type === "Item") {
            await Pl1eMacro.createMacro(data, slot);
            return false;
        }
    });

    /**
     * Add a toggle button to enable/disable the dynamic hotbar system.
     * On enable: saves current hotbar and generates macros.
     * On disable: restores the saved hotbar.
     */
    Hooks.on("getSceneControlButtons", (controls) => {
        const tokenCategory = controls.find(c => c.name === "token");
        if (!tokenCategory) return;

        tokenCategory.tools.push({
            name: "dynamicHotBar",
            title: game.i18n.localize("PL1E.DynamicHotBar"),
            icon: "fas fa-exchange-alt",
            active: game.user.getFlag('pl1e', 'dynamicHotBar') || false,
            toggle: true,
            button: true,
            onClick: async (enable) => {
                await game.user.setFlag('pl1e', 'dynamicHotBar', enable);

                if (!enable) {
                    await _restoreUserMacros();
                } else {
                    await _saveUserMacros();

                    const selected = canvas.tokens.controlled[0];
                    if (selected && selected.actor?.isOwner) {
                        await _generateTokenMacros(selected);
                    }
                }
            }
        });
    });
});

/**
 * Handle token selection to generate or restore macros depending on selection state.
 */
Hooks.on("controlToken", async (token, isSelected) => {
    const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
    if (!dynamicHotbar) return;

    if (isSelected) {
        await _generateTokenMacros(token);
    } else {
        // Wait until next task to ensure selection state is accurate
        await new Promise(resolve => setTimeout(resolve, 0));

        const stillSelected = canvas.tokens.controlled.length > 0;
        if (!stillSelected) {
            await _restoreUserMacros();
        }
    }
});

/**
 * Re-generate macros when the actor is updated if its token is currently selected.
 */
Hooks.on("updateActor", async (actor, changes, options, userId) => {
    const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
    if (!dynamicHotbar) return;

    const selectedToken = canvas.tokens.controlled[0];
    const token = actor.getActiveTokens()[0];
    if (selectedToken && token && selectedToken.document === token.document) {
        await _generateTokenMacros(token);
    }
});

/**
 * Regenerate macros when an item's favorite status changes.
 */
Hooks.on("updateItem", async (item, changes, options, userId) => {
    const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
    if (!dynamicHotbar) return;

    // Check if any relevant flags were changed
    const changedFavorite   = foundry.utils.hasProperty(changes, "system.isFavorite");
    const changedEquippedMain  = foundry.utils.hasProperty(changes, "system.isEquippedMain");
    const changedEquippedSecondary  = foundry.utils.hasProperty(changes, "system.isEquippedSecondary");

    if (!changedFavorite && !changedEquippedMain && !changedEquippedSecondary) return;

    // Ensure the item belongs to the currently selected token
    const selectedToken = canvas.tokens.controlled[0];
    if (!selectedToken || !selectedToken.actor) return;

    if (selectedToken.actor.id !== item.parent?.id) return;

    await _generateTokenMacros(selectedToken);
});