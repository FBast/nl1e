import { PL1E } from "../pl1e.mjs";

/**
 * PL1E Sequencer Presets
 *
 * Each preset defines one or more visual effects (VFX) for actions in the system.
 *
 * PARAMETERS PER EFFECT:
 * - file: (string) The path to the VFX file to play.
 *
 * POSITIONING:
 * - at: (string | null) If no "to", defines the exact location of a non-stretch effect. Options:
 *   "caster", "target", "templatePrimary", "templateSecondary".
 *
 * - from: (string | null) Origin of the effect (stretch). Options:
 *   "caster" (the actor's token),
 *   "target" (each target token),
 *   "templatePrimary" (main point of the template),
 *   "templateSecondary" (secondary point of the template, e.g., end of a cone or beam),
 *
 * - to: (string | null) Destination of the effect (stretch). Options:
 *   "caster", "target", "templatePrimary", "templateSecondary".
 *
 * AREA / ZONE CONTROL:
 * - zone: (boolean) True if the effect should scale based on a template's area (cone, circle, etc.).
 * - sizeMultiplier: (number) Multiplier for the size of area effects (default: 1).
 *
 * PERSISTENT EFFECTS:
 * - persist: (boolean) If true, the effect remains active (e.g., an aura).
 * - fadeIn / fadeOut: (number) Milliseconds for fade in/out animations (only for persistent effects).
 *
 * TRANSFORMATIONS:
 * - scale: (number) Scale factor for the effect.
 * - randomize: (boolean) Randomizes Y-mirror (e.g., flips vertically for variation).
 * - randomSpeed: (boolean) Random playback speed.
 *
 * TIMING:
 * - postDelay: (number) Milliseconds to wait after the effect completes.
 *
 * HIT/MISS:
 * - missed: (boolean) True if the effect should "miss" (e.g., to show an attack failure).
 */

export function getConfigSequencer() {
    PL1E.sequencerPresets = {
        none: {
            label: "None",
            effects: []
        },
        // Base Melee Effects
        shortAxeAttack: {
            label: "Melee: Short Axe",
            effects: [
                {
                    file: "jb2a.melee_attack.02.handaxe.01",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        longSwordAttack: {
            label: "Melee: Long Sword Attack",
            effects: [
                {
                    file: "jb2a.melee_attack.03.greatsword.01",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        shortSwordAttack: {
            label: "Melee: Short Sword Attack",
            effects: [
                {
                    file: "jb2a.shortsword.melee.01.white",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        spearAttack: {
            label: "Melee: Spear Attack",
            effects: [
                {
                    file: "jb2a.spear.melee.01",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },

        // Base Ranged Effects
        arrowShot: {
            label: "Ranged: Arrow Shot",
            effects: [
                {
                    file: "jb2a.arrow.physical.blue",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        boltShot: {
            label: "Ranged: Bolt Shot",
            effects: [
                {
                    file: "jb2a.bolt.physical.orange",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        javelinThrow: {
            label: "Ranged: Javelin Throw",
            effects: [
                {
                    file: "jb2a.javelin.01.throw",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        shortBladeThrow: {
            label: "Ranged: Short Blade Throw",
            effects: [
                {
                    file: "jb2a.dagger.throw.01",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        shortAxeThrow: {
            label: "Ranged: Short Axe Throw",
            effects: [
                {
                    file: "jb2a.handaxe.throw.01",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },

        // Physical Effects
        shieldBash: {
            label: "Physical: Shield Bash",
            effects: [
                {
                    file: "jb2a.melee_attack.06.shield.01",
                    from: "caster",
                    to: "target",
                    missed: true
                }
            ]
        },
        shieldEffect: {
            label: "Physical: Shield Effect",
            effects: [
                {
                    file: "jb2a.shield.01.complete",
                    at: "target",
                    scale: 0.5,
                    randomize: true
                }
            ]
        },

        // Circle Effects
        arcanicCircle: {
            label: "Circle: Arcanic",
            effects: [
                {
                    file: "jb2a.magic_signs.circle.02.abjuration.complete.dark_blue",
                    persist: true,
                    fadeIn: 1500,
                    fadeOut: 1500,
                    scale: 2
                }
            ]
        },
        entropicCircle: {
            label: "Circle: Entropic",
            effects: [
                {
                    file: "jb2a.magic_signs.circle.02.evocation.complete.dark_red",
                    persist: true,
                    fadeIn: 1500,
                    fadeOut: 1500,
                    scale: 2
                }
            ]
        },
        aethericCircle: {
            label: "Circle: Aetheric",
            effects: [
                {
                    file: "jb2a.magic_signs.circle.02.enchantment.complete.dark_pink",
                    persist: true,
                    fadeIn: 1500,
                    fadeOut: 1500,
                    scale: 2
                }
            ]
        },
        liturgicalCircle: {
            label: "Circle: Liturgical",
            effects: [
                {
                    file: "jb2a.magic_signs.circle.02.conjuration.complete.dark_yellow",
                    persist: true,
                    fadeIn: 1500,
                    fadeOut: 1500,
                    scale: 2
                }
            ]
        },
        faerieCircle: {
            label: "Circle: Faerie",
            effects: [
                {
                    file: "jb2a.magic_signs.circle.02.necromancy.complete.dark_green",
                    persist: true,
                    fadeIn: 1500,
                    fadeOut: 1500,
                    scale: 2
                }
            ]
        },
        asceticCircle: {
            label: "Circle: Ascetic",
            effects: [
                {
                    file: "jb2a.magic_signs.circle.02.transmutation.complete.dark_yellow",
                    persist: true,
                    fadeIn: 1500,
                    fadeOut: 1500,
                    scale: 2
                }
            ]
        },

        // Spell Effects
        magicMissile: {
            label: "Spell: Magic Missile",
            effects: [
                {
                    file: "jb2a.magic_missile",
                    from: "caster",
                    to: "target",
                    randomize: true,
                    randomSpeed: true
                }
            ]
        },
        fireball: {
            label: "Spell: Fireball",
            effects: [
                {
                    file: "jb2a.fireball.beam.orange",
                    from: "caster",
                    to: "templatePrimary",
                    speed: 1.2,
                    missed: false
                },
                {
                    file: "jb2a.fireball.explosion.orange",
                    at: "templatePrimary",
                    zone: true,
                    sizeMultiplier: 3,
                    postDelay: 2000,
                    randomize: true
                }
            ]
        },
        lightningLine: {
            label: "Spell: Lightning Line",
            effects: [
                {
                    file: "jb2a.breath_weapons.lightning.line.blue",
                    from: "caster",
                    to: "templateSecondary",
                    zone: true
                }
            ]
        },
        frostCone: {
            label: "Spell: Frost Cone",
            effects: [
                {
                    file: "jb2a.cone_of_cold",
                    at: "templatePrimary",
                    zone: true,
                    sizeMultiplier: 1
                }
            ]
        },
        mistyIn: {
            label: "Spell: Misty In",
            effects: [
                {
                    file: "jb2a.misty_step.02",
                    at: "caster",
                    randomize: true
                }
            ]
        },
        mistyOut: {
            label: "Spell: Misty Out",
            effects: [
                {
                    file: "jb2a.misty_step.01",
                    at: "templatePrimary",
                    randomize: true
                }
            ]
        },
        leafWhirl: {
            label: "Spell: Leaf Whirl",
            effects: [
                {
                    file: "jb2a.swirling_leaves.ranged",
                    from: "caster",
                    to: "target",
                    randomize: true
                }
            ]
        },
        rockFall: {
            label: "Spell: Rock Fall",
            effects: [
                {
                    file: "jb2a.falling_rocks.top.1x1",
                    at: "target",
                    zone: true,
                    sizeMultiplier: 3,
                    randomize: true
                }
            ]
        },
        darkStep: {
            label: "Spell: Dark Step",
            effects: [
                {
                    file: "jb2a.misty_step.01.dark_black",
                    at: "templatePrimary",
                    randomize: true
                }
            ]
        },
        blueHeal: {
            label: "Spell: Blue Heal",
            effects: [
                {
                    file: "jb2a.healing_generic.200px.blue",
                    at: "target",
                    randomize: true
                }
            ]
        },
        redHeal: {
            label: "Spell: Red Heal",
            effects: [
                {
                    file: "jb2a.healing_generic.200px.red",
                    at: "target",
                    randomize: true
                }
            ]
        },
        greenRayHeal: {
            label: "Spell: Green Ray Heal",
            effects: [
                {
                    file: "jb2a.scorching_ray.01.green",
                    from: "caster",
                    to: "target",
                    postDelay: 2000
                }
            ]
        },
        greenHeal: {
            label: "Spell: Green Heal",
            effects: [
                {
                    file: "jb2a.healing_generic.200px.green",
                    at: "target",
                    randomize: true
                }
            ]
        }
    };
}
