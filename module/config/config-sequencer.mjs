import { PL1E } from "../pl1e.mjs";
import {Pl1ePolygons} from "../helpers/polygones.mjs";

export function getConfigSequencer() {
    PL1E.sequencerPresets = {
        none: {
            label: "PL1E.None.M",
            factory: () => {
                return new Sequence();
            }
        },

        // Base Melee Effects
        staffAttack: {
            label: "PL1E.PresetMeleeStaff",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.quarterstaff.melee.01.white"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        spearAttack: {
            label: "PL1E.PresetMeleeSpear",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.spear.melee.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        shortAxeAttack: {
            label: "PL1E.PresetMeleeShortAxe",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.02.handaxe.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        longAxeAttack: {
            label: "PL1E.PresetMeleeLongAxe",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.03.greataxe"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        shortBladeAttack: {
            label: "PL1E.PresetMeleeShortBlade",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.shortsword.melee.01.white"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        mediumBladeAttack: {
            label: "PL1E.PresetMeleeMediumBlade",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.01.shortsword.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        longBladeAttack: {
            label: "PL1E.PresetMeleeLongBlade",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.03.greatsword.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        shortHammerAttack: {
            label: "PL1E.PresetMeleeShortHammer",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.02.hammer.02"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        longHammerAttack: {
            label: "PL1E.PresetMeleeLongHammer",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.03.maul.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        shieldAttack: {
            label: "PL1E.PresetMeleeShield",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.moveTowardsAttack(
                        args.caster,
                        target,
                        "jb2a.melee_attack.06.shield.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        clawAttack: {
            label: "PL1E.PresetMeleeClaw",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.atLocationAttack(
                        args.caster,
                        target,
                        "jb2a.claws.200px.red"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        biteAttack: {
            label: "PL1E.PresetMeleeBite",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.atLocationAttack(
                        args.caster,
                        target,
                        "jb2a.bite.200px.red"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },

        fistAttack: {
            label: "PL1E.PresetMeleeFist",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.atLocationAttack(
                        args.caster,
                        target,
                        "jb2a.unarmed_strike.physical.01.blue"
                    );
                    seq.addSequence(attackSeq);
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
                    const attackSeq = PL1E.sequencerSubs.stretchAttack(
                        args.caster,
                        target,
                        "jb2a.dagger.throw.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },
        shortAxeThrow: {
            label: "PL1E.PresetRangedShortAxeThrow",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.stretchAttack(
                        args.caster,
                        target,
                        "jb2a.handaxe.throw.01"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },
        javelinThrow: {
            label: "PL1E.PresetRangedJavelinThrow",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.stretchAttack(
                        args.caster,
                        target,
                        "jb2a.javelin.01.throw"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },
        arrowShot: {
            label: "PL1E.PresetRangedArrowShot",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.stretchAttack(
                        args.caster,
                        target,
                        "jb2a.arrow.physical.blue"
                    );
                    seq.addSequence(attackSeq);
                }

                return seq;
            }
        },
        boltShot: {
            label: "PL1E.PresetRangedBoltShot",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    const attackSeq = PL1E.sequencerSubs.stretchAttack(
                        args.caster,
                        target,
                        "jb2a.bolt.physical.orange"
                    );
                    seq.addSequence(attackSeq);
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
                        .atLocation(args.caster.id)
                        .stretchTo(template.secondaryPosition)
                        .belowTokens()
                        .playbackRate(2);
                }
                return seq;
            }
        },
        slashCone: {
            label: "PL1E.PresetPhysicalSlashCone",
            factory: (args) => {
                const seq = new Sequence();

                for (const template of args.templates) {
                    const coneRadius = template.distance / 2;
                    const coneDirection = 360 - template.direction;
                    const center = template.primaryPosition;

                    seq.effect()
                        .file("jb2a.melee_generic.slash.01")
                        .atLocation(center)
                        .scale(coneRadius)
                        .rotate(coneDirection);
                }

                return seq;
            }
        },

        // Circle Effects
        arcanicCircle: {
            label: "PL1E.PresetCircleArcanic",
            factory: (args) => {
                return PL1E.sequencerSubs.magicCircle(
                    "jb2a.magic_signs.circle.02.abjuration.complete.dark_blue",
                    args.caster,
                    args.active
                );
            }
        },
        entropicCircle: {
            label: "PL1E.PresetCircleEntropic",
            factory: (args) => {
                return PL1E.sequencerSubs.magicCircle(
                    "jb2a.magic_signs.circle.02.evocation.complete.dark_red",
                    args.caster,
                    args.active
                );
            }
        },
        aethericCircle: {
            label: "PL1E.PresetCircleAetheric",
            factory: (args) => {
                return PL1E.sequencerSubs.magicCircle(
                    "jb2a.magic_signs.circle.02.enchantment.complete.dark_pink",
                    args.caster,
                    args.active
                );
            }
        },
        liturgicalCircle: {
            label: "PL1E.PresetCircleLiturgical",
            factory: (args) => {
                return PL1E.sequencerSubs.magicCircle(
                    "jb2a.magic_signs.circle.02.conjuration.complete.dark_yellow",
                    args.caster,
                    args.active
                );
            }
        },
        faerieCircle: {
            label: "PL1E.PresetCircleFaerie",
            factory: (args) => {
                return PL1E.sequencerSubs.magicCircle(
                    "jb2a.magic_signs.circle.02.necromancy.complete.dark_green",
                    args.caster,
                    args.active
                );
            }
        },
        asceticCircle: {
            label: "PL1E.PresetCircleAscetic",
            factory: (args) => {
                return PL1E.sequencerSubs.magicCircle(
                    "jb2a.magic_signs.circle.02.transmutation.complete.dark_yellow",
                    args.caster,
                    args.active
                );
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
                        .atLocation(args.caster.id)
                        .stretchTo(target.id)
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
                        .atLocation(args.caster.id)
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
                        .atLocation(args.caster.id)
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
                        .atLocation(target.id)
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
                        .atLocation(target.id)
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
                        .belowTokens()
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
                    .atLocation(args.caster.id)
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
                        .atLocation(args.caster.id)
                        .stretchTo(target.id)
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
                    seq.effect()
                        .file("jb2a.falling_rocks.top.1x1.grey")
                        .atLocation(target.id)
                        .scale(0.5)
                        .randomizeMirrorY(true)
                        .missed(caster.result <= 0)
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
                        .atLocation(target.id)
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
                        .atLocation(target.id)
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
                        .atLocation(args.caster.id)
                        .stretchTo(target.id)
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
                        .atLocation(target.id)
                        .randomizeMirrorY(true);
                }
                return seq;
            }
        }
    };

    PL1E.sequencerSubs = {
        // Attacks
        moveTowardsAttack: (caster, target, effectFile, options = {}) => {
            const seq = new Sequence();

            seq.effect()
                .file(effectFile)
                .atLocation(caster.id)
                .randomizeMirrorY()
                .moveTowards(target.template.id)
                .missed(caster.result <= 0)

            return seq;
        },
        atLocationAttack: (caster, target, effectFile, options = {}) => {
            const seq = new Sequence();

            seq.effect()
                .file(effectFile)
                .randomizeMirrorY()
                .atLocation(target.template.id)
                .missed(caster.result <= 0)

            return seq;
        },
        stretchAttack: (caster, target, effectFile, options = {}) => {
            const seq = new Sequence();

            seq.effect()
                .file(effectFile)
                .atLocation(caster.id)
                .stretchTo(target.template.id)
                .missed(caster.result <= 0)

            return seq;
        },

        // Spell
        magicCircle: (effectFile, caster, active) => {
            const seq = new Sequence();

            if (active) {
                seq.effect()
                    .file(effectFile)
                    .attachTo(caster.id)
                    .belowTokens()
                    .scaleToObject(2)
                    .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                    .fadeOut(1500)
                    .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                    .rotateOut(350, 1500, { ease: "easeInCubic" })
                    .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                    .scaleOut(0, 1500, { ease: "easeInCubic" })
                    .persist()
                    .name(`SpellActivation-${caster.id}`);
            } else {
                Sequencer.EffectManager.endEffects({ name: `SpellActivation-${caster.id}` });
            }

            return seq;
        }
    }

    PL1E.sequencerAuto = {
        defense: (args) => {
            const seq = new Sequence();

            for (const target of args.targets) {
                if (target.result > 0) continue;

                const duration = 3000;
                const svgTint = "#00FFFF";
                const svgPath = `systems/pl1e/assets/svg/${target.skill}.svg`;

                seq.effect()
                    .file(svgPath)
                    .atLocation(target.id)
                    .scaleToObject(0.5)
                    .sortLayer(700)
                    .fadeIn(500)
                    .tint(svgTint)
                    .loopProperty("sprite", "scale.x", {
                        from: 0.8,
                        to: 1.2,
                        duration: duration / 4,
                        pingPong: true,
                        ease: "easeInOutSine"
                    })
                    .loopProperty("sprite", "scale.y", {
                        from: 0.8,
                        to: 1.2,
                        duration: duration / 4,
                        pingPong: true,
                        ease: "easeInOutSine"
                    })
                    .duration(duration)
                    .fadeOut(500);
            }

            return seq;
        }
    }
}
