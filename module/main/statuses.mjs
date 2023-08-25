export const registerStatuses = function () {
    CONFIG.statusEffects = [
        {
            // Resolve when equal or below deathDoor (default -10)
            id: "dead",
            label: "PL1E.StatusDead",
            icon: "systems/pl1e/assets/icons/dead.svg",
            tint: "#ff0000",
            changes: [],
            duration: {},
            flags: {
                pl1e: {
                    permanent: true
                }
            }
        },
        {
            // Resolve when equal or below unconsciousDoor (default 0)
            id: "unconscious",
            label: "PL1E.StatusUnconscious",
            icon: "systems/pl1e/assets/icons/unconscious.svg",
            tint: "#ff0000",
            changes: [], // Unconscious health decrease is handled from Combat class
            duration: {},
            flags: {
                pl1e: {
                    permanent: true
                }
            }
        },
        {
            // Resolve when equal or below unconsciousDoor (default 0)
            id: "charmed",
            label: "PL1E.StatusCharmed",
            icon: "systems/pl1e/assets/icons/charmed.svg",
            tint: "#ff0000",
            changes: [], // Token disposition is updated in actor
            duration: {},
            flags: {
                pl1e: {
                    permanent: true
                }
            }
        },
        {
            // Skip turn
            id: "paralysis",
            label: "PL1E.StatusParalysis",
            icon: "systems/pl1e/assets/icons/paralysis.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.quickAction",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.action",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.misc.reaction",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
            duration: {},
            flags: {}
        },
        {
            // Skip turn, removed if the character take damage and is replaced by stun for one turn
            id: "asleep",
            label: "PL1E.StatusAsleep",
            icon: "systems/pl1e/assets/icons/asleep.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.quickAction",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.action",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.misc.reaction",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
            duration: {},
            flags: {}
        },
        {
            // Prevent movement
            id: "restrain",
            label: "PL1E.StatusRestrained",
            icon: "systems/pl1e/assets/icons/restrained.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
            duration: {},
            flags: {}
        },
        {
            // Remove one action, one reaction and decrease movement by two
            id: "slow",
            label: "PL1E.StatusSlow",
            icon: "systems/pl1e/assets/icons/slow.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.general.action",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.general.reaction",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.misc.movement",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2
            }],
            duration: {},
            flags: {}
        },
        {
            // Add one action and increase movement by two
            id: "fast",
            label: "PL1E.StatusFast",
            icon: "systems/pl1e/assets/icons/fast.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.general.action",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
                {
                    key: "system.general.reaction",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: 1
                },
                {
                    key: "system.misc.movement",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: 2
                }],
            duration: {},
            flags: {}
        },
        {
            // Remove one action and one reaction
            id: "stun",
            label: "PL1E.StatusStunned",
            icon: "systems/pl1e/assets/icons/stun.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.general.action",
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
            // Disadvantage on resilience and intuition
            id: "confused",
            label: "PL1E.StatusConfused",
            icon: "systems/pl1e/assets/icons/confused.svg",
            tint: "#ff0000",
            changes: [{
                key: "skills.resilience.diceMod",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "skills.intuition.diceMod",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Advantage on resilience and intuition
            id: "composed",
            label: "PL1E.StatusComposed",
            icon: "systems/pl1e/assets/icons/composed.svg",
            tint: "#00ff00",
            changes: [{
                key: "skills.resilience.diceMod",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
                {
                    key: "skills.intuition.diceMod",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: 1
                }],
            duration: {},
            flags: {}
        },
        {
            // Disadvantage on reflex and vigor
            id: "sick",
            label: "PL1E.StatusSick",
            icon: "systems/pl1e/assets/icons/sick.svg",
            tint: "#ff0000",
            changes: [{
                key: "skills.reflex.diceMod",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "skills.vigor.diceMod",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Advantage on reflex and vigor
            id: "healthy",
            label: "PL1E.StatusHealthy",
            icon: "systems/pl1e/assets/icons/healthy.svg",
            tint: "#00ff00",
            changes: [{
                key: "skills.reflex.diceMod",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
                {
                    key: "skills.vigor.diceMod",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: 1
                }],
            duration: {},
            flags: {}
        },
        {
            // Add 1/2 of slashing, crushing and piercing damage
            id: "bleeding",
            label: "PL1E.StatusBleeding",
            icon: "systems/pl1e/assets/icons/bleeding.svg",
            tint: "#ff0000",
            changes: [], // Handled on actor update
            duration: {},
            flags: {}
        },
        {
            // Remove 1/2 of slashing, crushing and piercing damage
            id: "regeneration",
            label: "PL1E.StatusRegeneration",
            icon: "systems/pl1e/assets/icons/regeneration.svg",
            tint: "#00ff00",
            changes: [], // Handled on actor update
            duration: {},
            flags: {}
        },
        {
            // Add 1/2 of fire, cold, acid and electricity damage
            id: "cursed",
            label: "PL1E.StatusCursed",
            icon: "systems/pl1e/assets/icons/cursed.svg",
            tint: "#ff0000",
            changes: [], // Handled on actor update
            duration: {},
            flags: {}
        },
        {
            // Remove 1/2 of fire, cold, acid and electricity damage
            id: "blessed",
            label: "PL1E.StatusBlessed",
            icon: "systems/pl1e/assets/icons/blessed.svg",
            tint: "#00ff00",
            changes: [], // Handled on actor update
            duration: {},
            flags: {}
        },
        {
            // Add one disadvantage
            id: "downgraded",
            label: "PL1E.StatusDowngraded",
            icon: "systems/pl1e/assets/icons/downgraded.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.general.advantages",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Add one disadvantage
            id: "upgraded",
            label: "PL1E.StatusUpgraded",
            icon: "systems/pl1e/assets/icons/upgraded.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.general.advantages",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            duration: {},
            flags: {}
        },
        {
            // Prevent token sight
            id: "blind",
            label: "PL1E.StatusBlind",
            icon: "systems/pl1e/assets/icons/blind.svg",
            tint: "#ff0000",
            changes: [],
            duration: {},
            flags: {}
        },
        // {
        //     // Should prevent vocal spell to be launched
        //     id: "deaf",
        //     label: "PL1E.StatusDeaf",
        //     icon: "systems/pl1e/assets/icons/deaf.svg",
        //     tint: "#ff0000",
        //     changes: [],
        //     duration: {},
        //     flags: {}
        // },
        {
            // Remove token from normal sight
            id: "invisible",
            label: "PL1E.StatusInvisible",
            icon: "systems/pl1e/assets/icons/invisible.svg",
            tint: "#00ff00",
            changes: [], // Automatic legacy status
            duration: {},
            flags: {}
        },
        {
            // Allow token to see invisible
            id: "clairvoyant",
            label: "PL1E.StatusClairvoyant",
            icon: "systems/pl1e/assets/icons/clairvoyant.svg",
            tint: "#00ff00",
            changes: [], // Automatic legacy status
            duration: {},
            flags: {}
        },
        {
            // Grant token tremorsense
            id: "tremorsense",
            label: "PL1E.StatusTremorsense",
            icon: "systems/pl1e/assets/icons/tremorsense.svg",
            tint: "#00ff00",
            changes: [], // Automatic legacy status
            duration: {},
            flags: {}
        },
        {
            // The character focus on a spell
            id: "focus",
            label: "PL1E.StatusFocus",
            icon: "systems/pl1e/assets/icons/focus.svg",
            changes: [], // Automatic legacy status
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "slashingImmunity",
            label: "PL1E.StatusSlashingImmunity",
            icon: "systems/pl1e/assets/icons/slashingImmunity.svg",
            changes: [{
                key: "system.reductions.slashing",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "crushingImmunity",
            label: "PL1E.StatusCrushingImmunity",
            icon: "systems/pl1e/assets/icons/crushingImmunity.svg",
            changes: [{
                key: "system.reductions.crushing",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "piercingImmunity",
            label: "PL1E.StatusPiercingImmunity",
            icon: "systems/pl1e/assets/icons/piercingImmunity.svg",
            changes: [{
                key: "system.reductions.piercing",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "fireImmunity",
            label: "PL1E.StatusFireImmunity",
            icon: "systems/pl1e/assets/icons/fireImmunity.svg",
            changes: [{
                key: "system.reductions.burn",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "coldImmunity",
            label: "PL1E.StatusColdImmunity",
            icon: "systems/pl1e/assets/icons/coldImmunity.svg",
            changes: [{
                key: "system.reductions.cold",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "shockImmunity",
            label: "PL1E.StatusShockImmunity",
            icon: "systems/pl1e/assets/icons/shockImmunity.svg",
            changes: [{
                key: "system.reductions.acid",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "acidImmunity",
            label: "PL1E.StatusAcidImmunity",
            icon: "systems/pl1e/assets/icons/acidImmunity.svg",
            changes: [{
                key: "system.reductions.shock",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant all immunities
            id: "immortal",
            label: "PL1E.StatusImmortal",
            icon: "systems/pl1e/assets/icons/immortal.svg",
            changes: [{
                key: "system.reductions.slashing",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.crushing",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.piercing",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.burn",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.cold",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.acid",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.shock",
                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        }
    ];
}