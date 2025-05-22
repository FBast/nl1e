import {Pl1eMacro} from "../helpers/macro.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

/**
 * Generate macros for a token's actor based on favorite and relevant items.
 * Only includes favorite weapons, abilities, and consumables.
 * Items are categorized, filtered, sorted, and used to fill the hotbar from slot 1 to 50.
 * @param {Token} token - The token whose actor's items will be processed.
 * @returns {Promise<void>}
 */
async function _generateTokenMacros(token) {
    const actor = token.actor;
    if (!actor) return;

    let context = {
        weapons: [],
        abilities: [],
        consumables: []
    };

    context = await Pl1eHelpers.categorizeItems(context, actor.items);
    context = await Pl1eHelpers.selectRepresentativeItems(context);
    context = Pl1eHelpers.sortDocuments(context);

    const weapons = context.weapons.filter(item => actor.isFavorite("items", item.sourceId));
    const consumables = context.consumables.filter(item => actor.isFavorite("items", item.sourceId));
    const abilities = context.abilities.filter(item => actor.isFavorite("items", item.sourceId));
    const allItems = [...weapons, ...consumables, ...abilities];

    const hotbarUpdates = {};
    const macroPromises = [];

    let nextSlot = 1;

    for (const item of allItems) {
        const dropData = {
            type: "Item",
            data: foundry.utils.deepClone(item),
            id: item._id
        };

        const isWeapon = item.type === "weapon";
        const isEquipped = item.system.isEquippedMain || item.system.isEquippedSecondary;
        const isDisabled = !item.isEnabled;

        const flags = {
            pl1e: {
                isDynamic: true,
                equipped: isWeapon ? isEquipped : false,
                disabled: !isWeapon ? isDisabled : false
            }
        };

        macroPromises.push(
            Pl1eMacro.createMacro(dropData, {
                flags,
                folderName: "Dynamic"
            }).then(macro => {
                if (macro) {
                    hotbarUpdates[String(nextSlot)] = macro.id;
                    nextSlot++;
                }
            })
        );
    }

    await Promise.all(macroPromises);

    await game.user.update({ hotbar: {} }, {diff: false, recursive: false, noHook: true})
    await game.user.update({ hotbar: hotbarUpdates }, { diff: false });
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
 * If no macro is found for a slot, the slot is simply omitted.
 * @returns {Promise<void>}
 */
async function _restoreUserMacros() {
    const defaultHotbar = game.user.getFlag('pl1e', 'defaultHotbarMacros') || [];

    const hotbar = {};
    for (const { slot, id } of defaultHotbar) {
        if (id) hotbar[slot] = id;
    }

    await game.user.update({ hotbar: {} }, {diff: false, recursive: false, noHook: true})
    await game.user.update({ hotbar }, { diff: false });
}

Hooks.once("setup", async () => {
    await _restoreUserMacros();
    const dynamicMacros = game.macros.contents.filter(m => m.getFlag("pl1e", "isDynamic"));
    for (const macro of dynamicMacros) {
        if (macro.isOwner) await macro.delete();
    }
});

Hooks.once("ready", () => {
    /**
     * Allow manual drop of items to hotbar, generating a macro in the process.
     */
    Hooks.on("hotbarDrop", async (bar, data, slot) => {
        if (data.type === "Item") {
            await Pl1eMacro.createMacro(data, {
                slot: slot
            })
            return false;
        }
    });

    /**
     * Add a frame on the equipped item macro
     */
    Hooks.on("renderHotbar", (hotbar, html, data) => {
        html.find(".macro").each((_, el) => {
            const macroId = el.dataset.macroId;
            const macro = game.macros.get(macroId);
            if (!macro) return;

            if (!macro.getFlag("pl1e", "isDynamic")) return;

            const isEquipped = macro.getFlag("pl1e", "equipped");
            const isDisabled = macro.getFlag("pl1e", "disabled");

            el.classList.toggle("equipped", isEquipped);
            el.classList.toggle("disabled", isDisabled);
        });
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

/**
 * Handle token selection to generate or restore macros depending on selection state.
 */
Hooks.on("controlToken", async (token, isSelected) => {
    const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
    if (!dynamicHotbar) return;

    if (isSelected) {
        void _generateTokenMacrosSafe("generate", token);
    } else {
        await new Promise(resolve => setTimeout(resolve, 100));

        const stillNoneSelected = canvas.tokens.controlled.length === 0;
        if (stillNoneSelected) {
            void _generateTokenMacrosSafe("restore");
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
        void _generateTokenMacrosSafe("generate", token);
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

    void _generateTokenMacrosSafe("generate", selectedToken);
});

let _currentGeneration = null;
let _nextTask = null;

/**
 * Schedule a macro generation or restore.
 * If one is already running, it queues the last action only.
 * @param {"generate"|"restore"} type - The type of operation
 * @param {Token|null} token - The token to use for generation (ignored for restore)
 */
async function _generateTokenMacrosSafe(type, token = null) {
    // Si une tâche est en cours, on remplace la prochaine action par celle-ci
    if (_currentGeneration) {
        _nextTask = { type, token };
        return;
    }

    _currentGeneration = true;
    let currentTask = { type, token };

    while (currentTask) {
        _nextTask = null;

        if (currentTask.type === "generate" && currentTask.token) {
            await _generateTokenMacros(currentTask.token);
        } else if (currentTask.type === "restore") {
            await _restoreUserMacros();
        }

        currentTask = _nextTask;
    }

    _currentGeneration = null;
}