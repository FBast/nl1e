export const Pl1eMovementSettings = {
    namespace: "pl1e",
    keys: {
        enable: "movement.enable",
        combatOnly: "movement.combatOnly",
        shiftBypass: "movement.shiftBypass"
    },

    /**
     * Register system settings related to movement restriction.
     */
    register() {
        game.settings.register(this.namespace, this.keys.enable, {
            name: "Enable movement restriction",
            hint: "Toggle PL1E movement cap and action consumption.",
            scope: "world",
            config: true,
            default: true,
            type: Boolean
        });

        game.settings.register(this.namespace, this.keys.shiftBypass, {
            name: "Hold SHIFT to bypass",
            hint: "Holding SHIFT while moving will bypass restriction.",
            scope: "client",
            config: true,
            default: true,
            type: Boolean
        });
    },

    get enabled()       { return game.settings.get(this.namespace, this.keys.enable); },
    get shiftBypass()   { return game.settings.get(this.namespace, this.keys.shiftBypass); }
};
