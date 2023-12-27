/**
 * Custom system settings register
 */
export const registerSettings = function () {
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

    game.settings.register('pl1e', 'scrollingTextMinFont', {
        name: 'Scrolling text minimal font',
        hint: "Define the minimal font possible for a scrolling text font when displaying actor update.",
        config: true,
        type: Number,
        range: {
            min: 10,
            max: 50,
            step: 5
        },
        default: 20
    });

    game.settings.register('pl1e', 'scrollingTextMaxFont', {
        name: 'Scrolling text maximal font',
        hint: "Define the maximal font possible for a scrolling text font when displaying actor update.",
        config: true,
        type: Number,
        range: {
            min: 50,
            max: 100,
            step: 5
        },
        default: 50
    });

    game.settings.register('pl1e', 'scrollingTextDuration', {
        name: 'Scrolling text duration in seconds',
        hint: "Define duration for a scrolling text when displaying actor update.",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 10,
            step: 1
        },
        default: 5
    });

    game.settings.register("pl1e", "monoClassLevelCaps", {
        name: "Mono class XP level caps",
        hint: "Enter the XP caps for each levels, separated by commas. E.g., '10, 20, 30, 40, 50'.",
        scope: "world",
        config: true,
        type: String,
        default: "10, 20, 30, 40, 50"
    });

    game.settings.register("pl1e", "multiClassLevelCaps", {
        name: "Multi class XP level caps",
        hint: "Enter the XP caps for each levels, separated by commas. E.g., '10, 20, 30, 40, 50'.",
        scope: "world",
        config: true,
        type: String,
        default: "10, 30, 50"
    });
}