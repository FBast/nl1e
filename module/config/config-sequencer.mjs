import { PL1E } from "../pl1e.mjs";

export function getConfigSequencer() {
    PL1E.sequencerPresets = {
        none: {
            label: "PL1E.None.M",
            factory: () => null
        },

        // Base Melee Effects
        staffAttack: {
            label: "PL1E.PresetMeleeStaff",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.quarterstaff.melee.01.white")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        spearAttack: {
            label: "PL1E.PresetMeleeSpear",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.spear.melee.01")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        shortAxeAttack: {
            label: "PL1E.PresetMeleeShortAxe",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.02.handaxe.01")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        longAxeAttack: {
            label: "PL1E.PresetMeleeLongAxe",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.03.greataxe")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        shortBladeAttack: {
            label: "PL1E.PresetMeleeShortBlade",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.shortsword.melee.01.white")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        mediumBladeAttack: {
            label: "PL1E.PresetMeleeMediumBlade",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.01.shortsword.01")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        longBladeAttack: {
            label: "PL1E.PresetMeleeLongBlade",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.03.greatsword.01")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        shortHammerAttack: {
            label: "PL1E.PresetMeleeShortHammer",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.02.hammer.02")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        longHammerAttack: {
            label: "PL1E.PresetMeleeLongHammer",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.03.maul.01")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        shieldAttack: {
            label: "PL1E.PresetMeleeShield",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.melee_attack.06.shield.01")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .randomizeMirrorY()
                        .missed(missed);
                }
                return seq;
            }
        },
        clawAttack: {
            label: "PL1E.PresetMeleeClaw",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.claws.200px.red")
                        .atLocation(target)
                        .missed(missed);
                }
                return seq;
            }
        },

        biteAttack: {
            label: "PL1E.PresetMeleeBite",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.bite.200px.red")
                        .atLocation(target)
                        .missed(missed);
                }
                return seq;
            }
        },

        fistAttack: {
            label: "PL1E.PresetMeleeFist",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.unarmed_strike.physical.01.blue")
                        .atLocation(args.caster)
                        .moveTowards(target)
                        .missed(missed);
                }
                return seq;
            }
        },

        // Base Ranged Effects
        shortBladeThrow: {
            label: "PL1E.PresetRangedShortBladeThrow",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.dagger.throw.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        shortAxeThrow: {
            label: "PL1E.PresetRangedShortAxeThrow",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.handaxe.throw.01")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        javelinThrow: {
            label: "PL1E.PresetRangedJavelinThrow",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.javelin.01.throw")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        arrowShot: {
            label: "PL1E.PresetRangedArrowShot",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.arrow.physical.blue")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },
        boltShot: {
            label: "PL1E.PresetRangedBoltShot",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.bolt.physical.orange")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed);
                }
                return seq;
            }
        },

        // Physical Effects
        shieldEffect: {
            label: "PL1E.PresetPhysicalShieldEffect",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.shield.01.complete")
                        .atLocation(target)
                        .scale(0.5)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        charge: {
            label: "PL1E.PresetPhysicalCharge",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    seq.effect()
                        .file("jb2a.gust_of_wind.default")
                        .atLocation(args.caster)
                        .stretchTo(template.secondaryPosition)
                        .belowTokens()
                        .playbackRate(2);
                }
                return seq;
            }
        },

        // Circle Effects
        arcanicCircle: {
            label: "PL1E.PresetCircleArcanic",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq.effect()
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
            label: "PL1E.PresetCircleEntropic",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq.effect()
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
            label: "PL1E.PresetCircleAetheric",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq.effect()
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
            label: "PL1E.PresetCircleLiturgical",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq.effect()
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
            label: "PL1E.PresetCircleFaerie",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq.effect()
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
            label: "PL1E.PresetCircleAscetic",
            factory: (args) => {
                const seq = new Sequence();
                if (args.active) {
                    seq.effect()
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
            label: "PL1E.PresetSpellMagicMissile",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.magic_missile")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .randomizeMirrorY()
                        .playbackRate(Math.random() * (1.2 - 0.8) + 0.8);
                }
                return seq;
            }
        },
        fireball: {
            label: "PL1E.PresetSpellFireball",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    const blastSize = template.distance * 2
                    seq.effect()
                        .file("jb2a.fireball.beam.orange")
                        .atLocation(args.caster)
                        .scale(2)
                        .stretchTo(template.primaryPosition)
                        .randomizeMirrorY()
                        .waitUntilFinished(-2000);
                    seq.effect()
                        .file("jb2a.impact.ground_crack.orange")
                        .atLocation(template.primaryPosition)
                        .size(blastSize, { gridUnits: true })
                        .belowTokens()
                        .randomizeMirrorY()
                        .fadeOut(2000);
                    seq.effect()
                        .file("jb2a.fireball.explosion.orange")
                        .atLocation(template.primaryPosition)
                        .size(blastSize, { gridUnits: true })
                        .randomizeMirrorY();
                }
                return seq;
            }
        },
        lightningLine: {
            label: "PL1E.PresetSpellLightningLine",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templatesSecondary) {
                    seq.effect()
                        .file("jb2a.breath_weapons.lightning.line.blue")
                        .atLocation(args.caster)
                        .stretchTo(template.secondaryPosition);
                }
                return seq;
            }
        },
        faerieBurst: {
            label: "PL1E.PresetSpellFaerieBurst",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.fairies.outward_burst")
                        .atLocation(target)
                        .randomizeMirrorY()
                }
                return seq;
            }
        },
        flowerSanctuary: {
            label: "PL1E.PresetSpellFlowerSanctuary",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.plant_growth.03.round.2x2.complete")
                        .atLocation(target)
                        .randomizeMirrorY()
                        .belowTokens()
                }
                return seq;
            }
        },
        emergingPlant: {
            label: "PL1E.PresetSpellEmergingPlant",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    const plantSize = template.distance * 2
                    seq.effect()
                        .file("jb2a.entangle.02.complete.02.green")
                        .atLocation(template.primaryPosition)
                        .size(plantSize, {gridUnits: true})
                        .randomizeMirrorY()
                }
                return seq;
            }
        },
        frostCone: {
            label: "PL1E.PresetSpellFrostCone",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    let coneLength = template.distance;
                    let offset = coneLength / 2;
                    let direction = 360 - template.direction;
                    seq.effect()
                        .file("jb2a.cone_of_cold")
                        .atLocation(template.primaryPosition)
                        .spriteOffset({x: offset}, {gridUnits: true})
                        .size({width: coneLength, height: coneLength}, {gridUnits: true})
                        .rotate(direction);
                }
                return seq;
            }
        },
        mistyIn: {
            label: "PL1E.PresetSpellMistyIn",
            factory: (args) => {
                const seq = new Sequence();
                seq.effect()
                    .file("jb2a.misty_step.02")
                    .atLocation(args.caster)
                    .randomizeMirrorY(true);
                return seq;
            }
        },
        mistyOut: {
            label: "PL1E.PresetSpellMistyOut",
            factory: (args) => {
                const seq = new Sequence();
                for (const template of args.templates) {
                    seq.effect()
                        .file("jb2a.misty_step.01")
                        .startTime(800)
                        .atLocation(template.primaryPosition)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        leafWhirl: {
            label: "PL1E.PresetSpellLeafWhirl",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.swirling_leaves.ranged")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        rockFall: {
            label: "PL1E.PresetSpellRockFall",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);
                    seq.effect()
                        .file("jb2a.falling_rocks.top.1x1.grey")
                        .atLocation(target)
                        .scale(0.5)
                        .randomizeMirrorY(true)
                        .missed(missed);
                }
                return seq;
            }
        },
        blueHeal: {
            label: "PL1E.PresetSpellBlueHeal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.healing_generic.200px.blue")
                        .atLocation(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        redHeal: {
            label: "PL1E.PresetSpellRedHeal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.healing_generic.200px.red")
                        .atLocation(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },
        greenRayHeal: {
            label: "PL1E.PresetSpellGreenRayHeal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.scorching_ray.01.green")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .waitUntilFinished(2000);
                }
                return seq;
            }
        },
        greenHeal: {
            label: "PL1E.PresetSpellGreenHeal",
            factory: (args) => {
                const seq = new Sequence();
                for (const target of args.targets) {
                    seq.effect()
                        .file("jb2a.healing_generic.200px.green")
                        .atLocation(target)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        },

        // Test Effects
        arcaneBlast: {
            label: "PL1E.PresetSpellArcaneBlast",
            factory: (args) => {
                const seq = new Sequence();

                // Préparation
                const playbackRate = Math.random() * (1.2 - 0.8) + 0.8;

                // Effet de départ : un cercle magique sous le lanceur
                seq.effect()
                    .file("jb2a.magic_signs.circle.02.abjuration.complete.blue")
                    .attachTo(args.caster)
                    .belowTokens()
                    .scaleToObject(1.5)
                    .fadeIn(500)
                    .fadeOut(500)
                    .opacity(0.5);

                // Effet principal : rayon magique vers les cibles
                for (const target of args.targets) {
                    const missed = args.missedTargets.includes(target);

                    // Projectile visuel
                    seq.effect()
                        .file("jb2a.ray_of_frost.blue")
                        .atLocation(args.caster)
                        .stretchTo(target)
                        .missed(missed)
                        .playbackRate(playbackRate)
                        .waitUntilFinished(-100);

                    // Impact à l'arrivée
                    seq.effect()
                        .file("jb2a.ground_cracks.orange")
                        .atLocation(target)
                        .scale(0.7)
                        .belowTokens()
                        .fadeIn(300)
                        .fadeOut(300)
                        .opacity(0.75)
                        .playbackRate(playbackRate);

                    // Particules persistantes sur le sol après impact
                    seq.effect()
                        .file("jb2a.smoke.puff.centered.grey")
                        .atLocation(target)
                        .scale(0.5)
                        .fadeIn(500)
                        .fadeOut(500)
                        .persist()
                        .name(`ArcaneBlast-${target.id}`)
                        .belowTokens();
                }

                return seq;
            }
        }
    };
}
