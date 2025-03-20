import {Pl1eMacro} from "../helpers/macro.mjs";

Hooks.once("ready", () => {
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (["Item"].includes(data.type)) {
            Pl1eMacro.createMacro(data, slot);
            return false;
        }
    });
});

Hooks.on("controlToken", async (token, isSelected) => {
    if (!token.actor) return;

    const dynamicHotbar = game.user.getFlag('pl1e', 'dynamicHotBar');
    if (dynamicHotbar && isSelected && token.actor.isOwner) {
        // Delete previous dynamic macros
        await Pl1eMacro.deleteAllDynamicMacros();

        // Generate macros for the selected token
        await Pl1eMacro.generateTokenMacros(token);
    }
});

Hooks.on("getSceneControlButtons", (controls) => {
    let tokenCategory = controls.find(c => c.name === "token");

    if (tokenCategory) {
        tokenCategory.tools.push({
            name: "dynamicHotBar",
            title: game.i18n.localize("PL1E.DynamicHotBar"),
            icon: "fas fa-exchange-alt",
            active: game.user.getFlag('pl1e', 'dynamicHotBar') || false,
            toggle: true,
            button: true,
            onClick: async (enable) => {
                game.user.setFlag('pl1e', 'dynamicHotBar', enable);
                if (!enable) {
                    // Delete previous dynamic macros
                    await Pl1eMacro.deleteAllDynamicMacros();

                    // Restore the default hotbar state
                    let defaultHotbarMacros = game.user.getFlag('pl1e', 'defaultHotbarMacros');
                    if (defaultHotbarMacros) {
                        for (const macroData of defaultHotbarMacros) {
                            let macro = game.macros.get(macroData.id);
                            await game.user.assignHotbarMacro(macro ? macro : null, macroData.slot);
                        }
                    }
                }
                else {
                    // Save the current state of the hotbar
                    const totalPages = 5;
                    let fullHotbarState = [];
                    for (let page = 1; page <= totalPages; page++) {
                        let pageMacros = game.user.getHotbarMacros(page);
                        pageMacros.forEach(pageMacro => {
                            fullHotbarState.push({
                                id: pageMacro.macro ? pageMacro.macro.id : null,
                                slot: pageMacro.slot
                            });
                        })
                    }
                    await game.user.setFlag('pl1e', 'defaultHotbarMacros', fullHotbarState);

                    // Generate the macros for the current token selected (if existing)
                    const selectedToken = game.canvas.tokens.controlled[0];
                    if (selectedToken && selectedToken.isOwner) {
                        // Generate macros for the selected token
                        await Pl1eMacro.generateTokenMacros(selectedToken);
                    }
                }
            }
        });
    }
});