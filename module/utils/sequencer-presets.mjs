export const PRESETS = {
    // Basic potion effect (mana)
    manaPotion: {
        label: "PL1E.Preset.ManaPotion",
        file: "jb2a.healing_generic.200px.blue",
        at: "target",
        randomize: true
    },

    // Melee axe attack effect
    axeAttack: {
        label: "PL1E.Preset.AxeAttack",
        file: "jb2a.melee_attack.02.handaxe.01",
        at: "caster",
        stretchTo: "target",
        missed: true
    },

    // Fireball explosion effect (template area)
    fireballExplosion: {
        label: "PL1E.Preset.FireballExplosion",
        file: "jb2a.fireball.explosion.orange",
        zone: true,
        sizeMultiplier: 3,
        postDelay: 2000,
        randomize: true
    },

    // Persistent magic circle effect (activation/deactivation)
    persistentCircle: {
        label: "PL1E.Preset.PersistentCircle",
        file: "jb2a.magic_signs.circle.02.abjuration.complete.dark_blue",
        persist: true,
        fadeIn: 1500,
        fadeOut: 1500,
        scale: 2
    },

    // Shield effect on target
    shieldEffect: {
        label: "PL1E.Preset.ShieldEffect",
        file: "jb2a.shield.01.complete",
        at: "target",
        scale: 0.5,
        randomize: true
    },

    // Lightning bolt attack effect (template line)
    lightningBolt: {
        label: "PL1E.Preset.LightningBolt",
        file: "jb2a.breath_weapons.lightning.line.blue",
        zone: true
    },

    // Healing burst area (template)
    healingBurst: {
        label: "PL1E.Preset.HealingBurst",
        file: "jb2a.healing_generic.burst.greenorange",
        zone: true,
        sizeMultiplier: 2
    },

    // Magic missile effect on multiple targets
    magicMissile: {
        label: "PL1E.Preset.MagicMissile",
        file: "jb2a.magic_missile",
        at: "caster",
        stretchTo: "target",
        randomize: true,
        randomSpeed: true
    }
};
