export const RegisterStatuses = function () {
    CONFIG.statusEffects = [
        {
            // Resolve when equal or below deathDoor (default -10)
            id: 'dead',
            label: 'EFFECT.StatusDead',
            icon: 'icons/svg/skull.svg'
        },
        {
            // Resolve when equal or below comaDoor (default 0)
            id: 'coma',
            label: 'EFFECT.StatusComa',
            icon: 'systems/pl1e/assets/icons/coma.svg',
            changes: [{
                key: "system.resources.health",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }],
            flags: {
                pl1e: {
                    continuous: true
                }
            }
        },
        {
            // No effects
            id: 'unconscious',
            label: 'EFFECT.StatusUnconscious',
            icon: 'icons/svg/unconscious.svg'
        },
        {
            // No effects
            id: 'sleep',
            label: 'EFFECT.StatusAsleep',
            icon: 'icons/svg/sleep.svg'
        },
        {
            // Remove one action and one reaction
            id: 'stun',
            label: 'EFFECT.StatusStunned',
            icon: 'icons/svg/daze.svg',
            changes: [{
                key: "system.misc.action",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            },
            {
                key: "system.misc.reaction",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }]
        },
        {
            // No effects
            id: 'prone',
            label: 'EFFECT.StatusProne',
            icon: 'icons/svg/falling.svg'
        },
        {
            // Prevent movement
            id: 'restrain',
            label: 'EFFECT.StatusRestrained',
            icon: 'icons/svg/net.svg'
        },
        {
            // No effects
            id: 'paralysis',
            label: 'EFFECT.StatusParalysis',
            icon: 'icons/svg/paralysis.svg'
        },
        {
            // No effects
            id: 'fly',
            label: 'EFFECT.StatusFlying',
            icon: 'icons/svg/wing.svg'
        },
        {
            // Prevent token sight
            id: 'blind',
            label: 'EFFECT.StatusBlind',
            icon: 'icons/svg/blind.svg'
        },
        {
            // No effects
            id: 'deaf',
            label: 'EFFECT.StatusDeaf',
            icon: 'icons/svg/deaf.svg'
        },
        {
            // No effects
            id: 'silence',
            label: 'EFFECT.StatusSilenced',
            icon: 'icons/svg/silenced.svg'
        },
        {
            // No effects
            id: 'fear',
            label: 'EFFECT.StatusFear',
            icon: 'icons/svg/terror.svg'
        },
        {
            // No effects
            id: 'disease',
            label: 'EFFECT.StatusDisease',
            icon: 'icons/svg/biohazard.svg'
        },
        {
            // Add one advantage
            id: 'upgrade',
            label: 'EFFECT.StatusUpgrade',
            icon: 'icons/svg/upgrade.svg',
            changes: [{
                key: "system.general.advantages",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }]
        },
        {
            // Add one disadvantage
            id: 'downgrade',
            label: 'EFFECT.StatusDowngrade',
            icon: 'icons/svg/downgrade.svg',
            changes: [{
                key: "system.general.advantages",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }]
        },
        {
            // Remove token from normal sight
            id: 'invisible',
            label: 'EFFECT.StatusInvisible',
            icon: 'icons/svg/invisible.svg'
        },
        {
            // No effects
            id: 'target',
            label: 'EFFECT.StatusTarget',
            icon: 'icons/svg/target.svg'
        },
        {
            // No effects
            id: 'eye',
            label: 'EFFECT.StatusMarked',
            icon: 'icons/svg/eye.svg'
        },
        {
            // Add one bonus
            id: 'bless',
            label: 'EFFECT.StatusBlessed',
            icon: 'icons/svg/angel.svg',
            changes: [{
                key: "system.general.bonuses",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: 1
            }]
        },
        {
            // Add one malus
            id: 'curse',
            label: 'EFFECT.StatusCursed',
            icon: 'icons/svg/sun.svg',
            changes: [{
                key: "system.general.bonuses",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -1
            }]
        },
        {
            // No effects (will grant fire immunity)
            id: 'fireShield',
            label: 'EFFECT.StatusFireShield',
            icon: 'icons/svg/fire-shield.svg'
        },
        {
            // No effects (will grant cold immunity)
            id: 'coldShield',
            label: 'EFFECT.StatusIceShield',
            icon: 'icons/svg/ice-shield.svg'
        },
        {
            // No effects (will grant shock immunity)
            id: 'shockShield',
            label: 'EFFECT.StatusShockShield',
            icon: 'systems/pl1e/assets/icons/lightning-shield.svg'
        },
        {
            // No effects (will grant acid immunity)
            id: 'acidShield',
            label: 'EFFECT.StatusAcidShield',
            icon: 'systems/pl1e/assets/icons/acid-shield.svg'
        }
    ];
}