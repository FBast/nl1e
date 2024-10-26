export const registerStatuses = function () {
    CONFIG.statusEffects = [
        {
            // Resolve when equal or below deathDoor (default -10)
            id: "dead",
            label: "PL1E.StatusDead",
            description: "PL1E.StatusDeadDescription",
            icon: "systems/pl1e/assets/svg/dead.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.quickAction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.action",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.reaction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
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
            description: "PL1E.StatusUnconsciousDescription",
            icon: "systems/pl1e/assets/svg/unconscious.svg",
            tint: "#ff0000",
            changes: [{ // Unconscious health decrease is handled from Combat class
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.quickAction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.action",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.reaction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
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
            description: "PL1E.StatusCharmedDescription",
            icon: "systems/pl1e/assets/svg/charmed.svg",
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
            // No movement, loose all actions, no defenses
            id: "paralysis",
            label: "PL1E.StatusParalysis",
            description: "PL1E.StatusParalysisDescription",
            icon: "systems/pl1e/assets/svg/paralysis.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.quickAction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.action",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.reaction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.skills.parry.number",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.skills.reflex.number",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.skills.vigor.number",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.skills.resilience.number",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.skills.intuition.number",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
            duration: {},
            flags: {}
        },
        {
            // Removed if the character take damage and is replaced by stunned for one turn
            id: "asleep",
            label: "PL1E.StatusAsleep",
            description: "PL1E.StatusAsleepDescription",
            icon: "systems/pl1e/assets/svg/asleep.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.quickAction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.action",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            },
            {
                key: "system.general.reaction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
            duration: {},
            flags: {}
        },
        {
            // Prevent movement
            id: "restrained",
            label: "PL1E.StatusRestrained",
            description: "PL1E.StatusRestrainedDescription",
            icon: "systems/pl1e/assets/svg/restrained.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: 0
            }],
            duration: {},
            flags: {}
        },
        {
            // Remove one action and decrease movement by two
            id: "slow",
            label: "PL1E.StatusSlow",
            description: "PL1E.StatusSlowDescription",
            icon: "systems/pl1e/assets/svg/slow.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.general.action",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -2
            }],
            duration: {},
            flags: {}
        },
        {
            // Add one action and increase movement by two
            id: "fast",
            label: "PL1E.StatusFast",
            description: "PL1E.StatusFastDescription",
            icon: "systems/pl1e/assets/svg/fast.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.general.action",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
            {
                key: "system.misc.movement",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 2
            }],
            duration: {},
            flags: {}
        },
        {
            // Remove one reaction
            id: "stunned",
            label: "PL1E.StatusStunned",
            description: "PL1E.StatusStunnedDescription",
            icon: "systems/pl1e/assets/svg/stunned.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.general.reaction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Add one reaction
            id: "invigorated",
            label: "PL1E.StatusInvigorated",
            description: "PL1E.StatusInvigoratedDescription",
            icon: "systems/pl1e/assets/svg/invigorated.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.general.reaction",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            duration: {},
            flags: {}
        },
        {
            // Disadvantage on parry, reflex and vigor
            id: "sick",
            label: "PL1E.StatusSick",
            description: "PL1E.StatusSickDescription",
            icon: "systems/pl1e/assets/svg/sick.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.skills.parry.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.skills.reflex.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.skills.vigor.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Advantage on parry, reflex and vigor
            id: "healthy",
            label: "PL1E.StatusHealthy",
            description: "PL1E.StatusHealthyDescription",
            icon: "systems/pl1e/assets/svg/healthy.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.skills.parry.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
            {
                key: "system.skills.reflex.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
            {
                key: "system.skills.vigor.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            duration: {},
            flags: {}
        },
        {
            // Disadvantage on resilience and intuition
            id: "confused",
            label: "PL1E.StatusConfused",
            description: "PL1E.StatusConfusedDescription",
            icon: "systems/pl1e/assets/svg/confused.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.skills.resilience.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.skills.intuition.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Advantage on resilience and intuition
            id: "focused",
            label: "PL1E.StatusFocused",
            description: "PL1E.StatusFocusedDescription",
            icon: "systems/pl1e/assets/svg/focused.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.skills.resilience.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            },
            {
                key: "system.skills.intuition.diceMod",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            duration: {},
            flags: {}
        },
        {
            // Add 5 health on turn start
            id: "bleeding",
            label: "PL1E.StatusBleeding",
            description: "PL1E.StatusBleedingDescription",
            icon: "systems/pl1e/assets/svg/bleeding.svg",
            tint: "#ff0000",
            changes: [], // Bleeding health decrease is handled from Combat class
            duration: {},
            flags: {}
        },
        {
            // Remove 1/3 of health damage
            id: "regenerate",
            label: "PL1E.StatusRegenerate",
            description: "PL1E.StatusRegenerateDescription",
            icon: "systems/pl1e/assets/svg/regenerate.svg",
            tint: "#00ff00",
            changes: [], // Regenerate health increase is handled from Combat class
            duration: {},
            flags: {}
        },
        {
            // Add one disadvantage
            id: "downgraded",
            label: "PL1E.StatusDowngraded",
            description: "PL1E.StatusDowngradedDescription",
            icon: "systems/pl1e/assets/svg/downgraded.svg",
            tint: "#ff0000",
            changes: [{
                key: "system.general.advantages",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            duration: {},
            flags: {}
        },
        {
            // Add one disadvantage
            id: "upgraded",
            label: "PL1E.StatusUpgraded",
            description: "PL1E.StatusUpgradedDescription",
            icon: "systems/pl1e/assets/svg/upgraded.svg",
            tint: "#00ff00",
            changes: [{
                key: "system.general.advantages",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }],
            duration: {},
            flags: {}
        },
        {
            // Prevent token sight
            id: "blind",
            label: "PL1E.StatusBlind",
            description: "PL1E.StatusBlindDescription",
            icon: "systems/pl1e/assets/svg/blind.svg",
            tint: "#ff0000",
            changes: [], // Automatic native status
            duration: {},
            flags: {}
        },
        {
            // Should prevent vocal spell to be launched
            id: "deaf",
            label: "PL1E.StatusDeaf",
            description: "PL1E.StatusDeafDescription",
            icon: "systems/pl1e/assets/svg/deaf.svg",
            tint: "#ff0000",
            changes: [],
            duration: {},
            flags: {}
        },
        {
            // Remove token from normal sight
            id: "invisible",
            label: "PL1E.StatusInvisible",
            description: "PL1E.StatusInvisibleDescription",
            icon: "systems/pl1e/assets/svg/invisible.svg",
            tint: "#00ff00",
            changes: [], // Automatic native status
            duration: {},
            flags: {}
        },
        {
            // Allow token to see invisible
            id: "clairvoyant",
            label: "PL1E.StatusClairvoyant",
            description: "PL1E.StatusClairvoyantDescription",
            icon: "systems/pl1e/assets/svg/clairvoyant.svg",
            tint: "#00ff00",
            changes: [],
            duration: {},
            flags: {
                pl1e: {
                    tokenChanges: {
                        "detectionModes": [{
                            "id": "seeInvisibility",
                            "enabled": true,
                            "range": 20
                        }]
                    }
                }
            }
        },
        {
            // Grant token tremorsense
            id: "tremorsense",
            label: "PL1E.StatusTremorsense",
            description: "PL1E.StatusTremorsenseDescription",
            icon: "systems/pl1e/assets/svg/tremorsense.svg",
            tint: "#00ff00",
            changes: [{
                key: "token.sight.visionMode",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: "tremorsense"
            }],
            duration: {},
            flags: {
                pl1e: {
                    tokenChanges: {
                        "detectionModes": [{
                            "id": "feelTremor",
                            "enabled": true,
                            "range": 20
                        }]
                    }
                }
            }
        },
        {
            // The token will expire
            id: "ephemeral",
            label: "PL1E.Ephemeral",
            description: "PL1E.EphemeralDescription",
            icon: "systems/pl1e/assets/svg/ephemeral.svg",
            changes: [], // TODO
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "fireImmunity",
            label: "PL1E.StatusFireImmunity",
            description: "PL1E.StatusFireImmunityDescription",
            icon: "systems/pl1e/assets/svg/fireImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.burn",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "coldImmunity",
            label: "PL1E.StatusColdImmunity",
            description: "PL1E.StatusColdImmunityDescription",
            icon: "systems/pl1e/assets/svg/coldImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.cold",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "shockImmunity",
            label: "PL1E.StatusShockImmunity",
            description: "PL1E.StatusShockImmunityDescription",
            icon: "systems/pl1e/assets/svg/shockImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.acid",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "acidImmunity",
            label: "PL1E.StatusAcidImmunity",
            description: "PL1E.StatusAcidImmunityDescription",
            icon: "systems/pl1e/assets/svg/acidImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.shock",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "slashingImmunity",
            label: "PL1E.StatusSlashingImmunity",
            description: "PL1E.StatusSlashingImmunityDescription",
            icon: "systems/pl1e/assets/svg/slashingImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.slashing",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "crushingImmunity",
            label: "PL1E.StatusCrushingImmunity",
            description: "PL1E.StatusCrushingImmunityDescription",
            icon: "systems/pl1e/assets/svg/crushingImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.crushing",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant immunity to related damage type
            id: "piercingImmunity",
            label: "PL1E.StatusPiercingImmunity",
            description: "PL1E.StatusPiercingImmunityDescription",
            icon: "systems/pl1e/assets/svg/piercingImmunity.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.piercing",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        },
        {
            // Grant all immunities
            id: "immortal",
            label: "PL1E.StatusImmortal",
            description: "PL1E.StatusImmortalDescription",
            icon: "systems/pl1e/assets/svg/immortal.svg",
            tint: "#00bbff",
            changes: [{
                key: "system.reductions.slashing",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.crushing",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.piercing",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.burn",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.cold",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.acid",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            },
            {
                key: "system.reductions.shock",
                mode: foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                value: Infinity
            }],
            duration: {},
            flags: {}
        }
    ];
}

export const localizeStatuses = function () {
    for (const statusEffect of CONFIG.statusEffects) {
        statusEffect.label = game.i18n.localize(statusEffect.label);
        statusEffect.description = game.i18n.localize(statusEffect.description);
    }
}