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

    const favoriteSourceIds = actor.getFavoriteIds("items");
    const items = {
        weapons: actor.displayedItems.filter(item =>
            item.type === "weapon" && favoriteSourceIds.includes(item.sourceId)
        ),
        consumables: actor.displayedItems.filter(item =>
            item.type === "consumable" && favoriteSourceIds.includes(item.sourceId)
        ),
        abilities: actor.enabledItems.filter(item =>
            item.type === "ability" && favoriteSourceIds.includes(item.sourceId)
        )
    };

    // Sort each group
    Pl1eHelpers.sortDocuments(items);

    // Generate macros by group
    for (const category in items) {
        for (const item of items[category]) {
            const dropData = {
                type: "Item",
                data: item,
                id: item.id
            };

            const macro = await Pl1eMacro.createMacro(dropData, nextSlot);
            if (item.type === "weapon") {
                let equippedType = null;
                if (item.system.isEquippedMain) equippedType = "main";
                else if (item.system.isEquippedSecondary) equippedType = "secondary";

                if (equippedType) {
                    await macro.setFlag("pl1e", "equippedWeapon", equippedType);
                }
                else {
                    await macro.unsetFlag("pl1e", "equippedWeapon");
                }
            }

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

    Hooks.on("renderHotbar", (hotbar, html, data) => {
        html.find(".macro").each((_, el) => {
            const slot = el.dataset.slot;
            const macroId = el.dataset.macroId;
            const macro = game.macros.get(macroId);
            if (!macro) return;

            const equipped = macro.getFlag("pl1e", "equippedWeapon");
            if (equipped === "main") {
                el.classList.add("equipped-main");
            } else if (equipped === "secondary") {
                el.classList.add("equipped-secondary");
            }
        });
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
 * Regenerate macros when an item's favorite status or equip state changes.
 */
Hooks.on("updateItem", async (item, changes, options, userId) => {
    const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
    if (!dynamicHotbar) return;

    // Check if any relevant equip state was changed
    const changedEquippedMain = foundry.utils.hasProperty(changes, "system.isEquippedMain");
    const changedEquippedSecondary = foundry.utils.hasProperty(changes, "system.isEquippedSecondary");

    if (!changedEquippedMain && !changedEquippedSecondary) return;

    // Ensure the item belongs to the currently selected token
    const selectedToken = canvas.tokens.controlled[0];
    if (!selectedToken || !selectedToken.actor) return;
    if (selectedToken.actor.id !== item.parent?.id) return;

    // Wait 100ms to allow any follow-up updates to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    await _generateTokenMacros(selectedToken);
});