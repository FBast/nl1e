/**
 * Custom system settings register
 */
export const RegisterSettings = function () {
    game.settings.register("pl1e", "enableAutoResetActorsItems", {
        name: "Enable auto reset actors items",
        hint: "Enable this to automatically reset all actors items when their source item is modified.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register("pl1e", "enableDebugUINotifications", {
        name: "Enable debug UI notifications",
        hint: "Enable this to display major debug to ui as notification.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register("pl1e", "enableVFXAndSFX", {
        name: "Enable VFX and SFX",
        hint: "Enable this to use the VFX and SFX provided by Sequencer and JB2A.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register("pl1e", "globalAdvantages", {
        name: "Global advantages",
        scope: "world",
        config: false,
        type: Number,
        default: 0
    });

    game.settings.register("pl1e", "globalBonuses", {
        name: "Global bonuses",
        scope: "world",
        config: false,
        type: Number,
        default: 0
    });
}