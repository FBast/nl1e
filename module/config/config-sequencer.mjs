import { PL1E } from "../pl1e.mjs";

export function getConfigSequencer() {
    PL1E.sequencerPresets = {
        none: {
            label: "None",
            factory: () => null
        },

        // Base Melee Effects
        shortAxeAttack: {
            label: "Melee: Short Axe",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.melee_attack.02.handaxe.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        longSwordAttack: {
            label: "Melee: Long Sword Attack",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.melee_attack.03.greatsword.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        shortSwordAttack: {
            label: "Melee: Short Sword Attack",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.shortsword.melee.01.white")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        spearAttack: {
            label: "Melee: Spear Attack",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.spear.melee.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },

        // Base Ranged Effects
        arrowShot: {
            label: "Ranged: Arrow Shot",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.arrow.physical.blue")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        boltShot: {
            label: "Ranged: Bolt Shot",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.bolt.physical.orange")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        javelinThrow: {
            label: "Ranged: Javelin Throw",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.javelin.01.throw")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        shortBladeThrow: {
            label: "Ranged: Short Blade Throw",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.dagger.throw.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        shortAxeThrow: {
            label: "Ranged: Short Axe Throw",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.handaxe.throw.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },

        // Physical Effects
        shieldBash: {
            label: "Physical: Shield Bash",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq
                        .effect()
                        .file("jb2a.melee_attack.06.shield.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        shieldEffect: {
            label: "Physical: Shield Effect",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.shield.01.complete")
                        .atLocation(target)
                        .scale(0.5)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },

        // Circle Effects
        arcanicCircle: {
            label: "Circle: Arcanic",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq
                        .effect()
                        .file("jb2a.magic_signs.circle.02.abjuration.complete.dark_blue")
                        .attachTo(args.caster)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster}` })
                }
                return seq;
            }
        },
        entropicCircle: {
            label: "Circle: Entropic",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq
                        .effect()
                        .file("jb2a.magic_signs.circle.02.evocation.complete.dark_red")
                        .attachTo(args.caster)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster}` })
                }
                return seq;
            }
        },
        aethericCircle: {
            label: "Circle: Aetheric",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq
                        .effect()
                        .file("jb2a.magic_signs.circle.02.enchantment.complete.dark_pink")
                        .attachTo(args.caster)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster}` })
                }
                return seq;
            }
        },
        liturgicalCircle: {
            label: "Circle: Liturgical",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq
                        .effect()
                        .file("jb2a.magic_signs.circle.02.conjuration.complete.dark_yellow")
                        .attachTo(args.caster)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster}` })
                }
                return seq;
            }
        },
        faerieCircle: {
            label: "Circle: Faerie",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq
                        .effect()
                        .file("jb2a.magic_signs.circle.02.necromancy.complete.dark_green")
                        .attachTo(args.caster)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster}` })
                }
                return seq;
            }
        },
        asceticCircle: {
            label: "Circle: Ascetic",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq
                        .effect()
                        .file("jb2a.magic_signs.circle.02.transmutation.complete.dark_yellow")
                        .attachTo(args.caster)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster}` })
                }
                return seq;
            }
        },

        // Spell Effects
        magicMissile: {
            label: "Spell: Magic Missile",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.magic_missile")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .randomizeMirrorY(true)
                        .playbackRate(Math.random() * (1.2 - 0.8) + 0.8);
                }
                return seq;
            }
        },
        fireball: {
            label: "Spell: Fireball",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    seq
                        .effect()
                        .file("jb2a.fireball.beam.orange")
                        .atLocation(args.caster)
                        .stretchTo(template.primaryPosition)
                        .playbackRate(1.2)
                        .missed(false);

                    seq
                        .effect()
                        .file("jb2a.fireball.explosion.orange")
                        .atLocation(template.primaryPosition)
                        .size(3)
                        .randomizeMirrorY(true)
                        .waitUntilFinished(2000);
                }
                return seq;
            }
        },
        lightningLine: {
            label: "Spell: Lightning Line",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templatesSecondary) {
                    seq
                        .effect()
                        .file("jb2a.breath_weapons.lightning.line.blue")
                        .atLocation(args.caster)
                        .stretchTo(template.secondaryPosition);
                }
                return seq;
            }
        },
        frostCone: {
            label: "Spell: Frost Cone",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    seq
                        .effect()
                        .file("jb2a.cone_of_cold")
                        .atLocation(template.primaryPosition)
                        .size(1);
                }
                return seq;
            }
        },
        mistyIn: {
            label: "Spell: Misty In",
            factory: (args) => {
                const seq = new Sequence();
                seq
                    .effect()
                    .file("jb2a.misty_step.02")
                    .atLocation(args.caster)
                    .randomizeMirrorY(true);
                return seq;
            }
        },
        mistyOut: {
            label: "Spell: Misty Out",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    seq
                        .effect()
                        .file("jb2a.misty_step.01")
                        .atLocation(template.primaryPosition)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        leafWhirl: {
            label: "Spell: Leaf Whirl",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.swirling_leaves.ranged")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        rockFall: {
            label: "Spell: Rock Fall",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.falling_rocks.top.1x1")
                        .atLocation(target)
                        .size(3)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        darkStep: {
            label: "Spell: Dark Step",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    seq
                        .effect()
                        .file("jb2a.misty_step.01.dark_black")
                        .atLocation(template.primaryPosition)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        blueHeal: {
            label: "Spell: Blue Heal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.healing_generic.200px.blue")
                        .atLocation(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        redHeal: {
            label: "Spell: Red Heal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.healing_generic.200px.red")
                        .atLocation(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        greenRayHeal: {
            label: "Spell: Green Ray Heal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.scorching_ray.01.green")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .waitUntilFinished(2000);
                }
                return seq;
            }
        },
        greenHeal: {
            label: "Spell: Green Heal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq
                        .effect()
                        .file("jb2a.healing_generic.200px.green")
                        .atLocation(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        }
    };
}
