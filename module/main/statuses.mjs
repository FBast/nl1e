export const registerStatuses = function () {
    CONFIG.statusEffects = [
        {
            // Resolve when equal or below deathDoor (default -10)
            id: "dead",
            label: "PL1E.StatusDead",
            icon: "icons/svg/skull.svg",
            changes: [],
            flags: {
                pl1e: {
                    permanent: true
                }
            }
        },
        {
            // Resolve when equal or below comaDoor (default 0)
            id: "coma",
            label: "PL1E.StatusComa",
            icon: "systems/pl1e/assets/icons/coma.svg",
            changes: [], // Coma health decrease is handled from Combat class
            flags: {
                pl1e: {
                    permanent: true
                }
            }
        },
        {
            // No effects
            id: "unconscious",
            label: "PL1E.StatusUnconscious",
            icon: "icons/svg/unconscious.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "sleep",
            label: "PL1E.StatusAsleep",
            icon: "icons/svg/sleep.svg",
            changes: [],
            flags: {}
        },
        {
            // Remove one action and one reaction
            id: "stun",
            label: "PL1E.StatusStunned",
            icon: "icons/svg/daze.svg",
            changes: [{
                key: "system.misc.action",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.misc.reaction",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            flags: {}
        },
        {
            // No effects
            id: "prone",
            label: "PL1E.StatusProne",
            icon: "icons/svg/falling.svg",
            changes: [],
            flags: {}
        },
        {
            // Prevent movement
            id: "restrain",
            label: "PL1E.StatusRestrained",
            icon: "icons/svg/net.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "paralysis",
            label: "PL1E.StatusParalysis",
            icon: "icons/svg/paralysis.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "fly",
            label: "PL1E.StatusFlying",
            icon: "icons/svg/wing.svg",
            changes: [],
            flags: {}
        },
        {
            // Prevent token sight
            id: "blind",
            label: "PL1E.StatusBlind",
            icon: "icons/svg/blind.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "deaf",
            label: "PL1E.StatusDeaf",
            icon: "icons/svg/deaf.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "silence",
            label: "PL1E.StatusSilenced",
            icon: "icons/svg/silenced.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "fear",
            label: "PL1E.StatusFear",
            icon: "icons/svg/terror.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "disease",
            label: "PL1E.StatusDisease",
            icon: "icons/svg/biohazard.svg",
            changes: [],
            flags: {}
        },
        {
            // Add one advantage
            id: "upgrade",
            label: "PL1E.StatusUpgrade",
            icon: "icons/svg/upgrade.svg",
            changes: [{
                key: "system.general.advantages",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            flags: {}
        },
        {
            // Add one disadvantage
            id: "downgrade",
            label: "PL1E.StatusDowngrade",
            icon: "icons/svg/downgrade.svg",
            changes: [{
                key: "system.general.advantages",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            flags: {}
        },
        {
            // Remove token from normal sight
            id: "invisible",
            label: "PL1E.StatusInvisible",
            icon: "icons/svg/invisible.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "target",
            label: "PL1E.StatusTarget",
            icon: "icons/svg/target.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects
            id: "eye",
            label: "PL1E.StatusMarked",
            icon: "icons/svg/eye.svg",
            changes: [],
            flags: {}
        },
        {
            // Add one bonus
            id: "bless",
            label: "PL1E.StatusBlessed",
            icon: "icons/svg/angel.svg",
            changes: [{
                key: "system.general.bonuses",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            flags: {}
        },
        {
            // Add one malus
            id: "curse",
            label: "PL1E.StatusCursed",
            icon: "icons/svg/sun.svg",
            changes: [{
                key: "system.general.bonuses",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            flags: {}
        },
        {
            // No effects (will grant fire immunity)
            id: "fireShield",
            label: "PL1E.StatusFireShield",
            icon: "icons/svg/fire-shield.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects (will grant cold immunity)
            id: "coldShield",
            label: "PL1E.StatusIceShield",
            icon: "icons/svg/ice-shield.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects (will grant shock immunity)
            id: "shockShield",
            label: "PL1E.StatusShockShield",
            icon: "systems/pl1e/assets/icons/lightning-shield.svg",
            changes: [],
            flags: {}
        },
        {
            // No effects (will grant acid immunity)
            id: "acidShield",
            label: "PL1E.StatusAcidShield",
            icon: "systems/pl1e/assets/icons/acid-shield.svg",
            changes: [],
            flags: {}
        }
    ];
}