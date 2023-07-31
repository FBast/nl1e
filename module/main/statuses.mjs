export const registerStatuses = function () {
    CONFIG.statusEffects = [
        {
            // Resolve when equal or below deathDoor (default -10)
            id: "dead",
            label: "PL1E.StatusDead",
            icon: "icons/svg/skull.svg",
            changes: [],
            duration: {},
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
            duration: {},
            flags: {
                pl1e: {
                    permanent: true
                }
            }
        },
        // {
        //     // No effects
        //     id: "unconscious",
        //     label: "PL1E.StatusUnconscious",
        //     icon: "icons/svg/unconscious.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
        // {
        //     // No effects
        //     id: "sleep",
        //     label: "PL1E.StatusAsleep",
        //     icon: "icons/svg/sleep.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
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
            duration: {},
            flags: {}
        },
        {
            // Remove one action
            id: "prone",
            label: "PL1E.StatusProne",
            icon: "icons/svg/falling.svg",
            changes: [],
            duration: {
                rounds: 1
            },
            flags: {}
        },
        {
            // Prevent movement
            id: "restrain",
            label: "PL1E.StatusRestrained",
            icon: "icons/svg/net.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Skip turn
            id: "paralysis",
            label: "PL1E.StatusParalysis",
            icon: "icons/svg/paralysis.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        // {
        //     // No effects
        //     id: "fly",
        //     label: "PL1E.StatusFlying",
        //     icon: "icons/svg/wing.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
        {
            // Prevent token sight
            id: "blind",
            label: "PL1E.StatusBlind",
            icon: "icons/svg/blind.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        // {
        //     // No effects
        //     id: "deaf",
        //     label: "PL1E.StatusDeaf",
        //     icon: "icons/svg/deaf.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
        // {
        //     // No effects
        //     id: "silence",
        //     label: "PL1E.StatusSilenced",
        //     icon: "icons/svg/silenced.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
        {
            // Reduce mind characteristics by one
            id: "fear",
            label: "PL1E.StatusFear",
            icon: "icons/svg/terror.svg",
            changes: [{
                key: "system.characteristics.intellect.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.characteristics.cunning.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.characteristics.wisdom.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.characteristics.will.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Reduce body characteristics by one
            id: "disease",
            label: "PL1E.StatusDisease",
            icon: "icons/svg/biohazard.svg",
            changes: [{
                key: "system.characteristics.strength.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.characteristics.agility.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.characteristics.perception.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.characteristics.constitution.mods",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
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
            duration: {},
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
            duration: {},
            flags: {}
        },
        {
            // Remove token from normal sight
            id: "invisible",
            label: "PL1E.StatusInvisible",
            icon: "icons/svg/invisible.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        // {
        //     // No effects
        //     id: "target",
        //     label: "PL1E.StatusTarget",
        //     icon: "icons/svg/target.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
        // {
        //     // No effects
        //     id: "eye",
        //     label: "PL1E.StatusMarked",
        //     icon: "icons/svg/eye.svg",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
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
            duration: {},
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
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "slashingImmunity",
            label: "PL1E.StatusSlashingImmunity",
            icon: "systems/pl1e/assets/icons/crossed-axes.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "crushingImmunity",
            label: "PL1E.StatusCrushingImmunity",
            icon: "systems/pl1e/assets/icons/trample.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "piercingImmunity",
            label: "PL1E.StatusPiercingImmunity",
            icon: "systems/pl1e/assets/icons/arrow-cluster.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "fireImmunity",
            label: "PL1E.StatusFireImmunity",
            icon: "icons/svg/fire-shield.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "coldImmunity",
            label: "PL1E.StatusColdImmunity",
            icon: "icons/svg/ice-shield.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "shockImmunity",
            label: "PL1E.StatusShockImmunity",
            icon: "systems/pl1e/assets/icons/lightning-shield.svg",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "acidImmunity",
            label: "PL1E.StatusAcidImmunity",
            icon: "systems/pl1e/assets/icons/rosa-shield.svg",
            changes: [],
            duration: {},
            flags: {}
        }
    ];
}