import { PL1E } from "../pl1e.mjs";

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
                return [seq];
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
                return [seq];
            }
        },
        slashCone: {
            label: "PL1E.PresetSpellSlashCone",
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

                const dodgeSeqs = PL1E.sequencerPresets.dodgeCaster.factory?.(args) ?? [];
                return [seq, ...dodgeSeqs];
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
                        .attachTo(args.caster.id)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster.id}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster.id}` })
                }
                return [seq];
            }
        },
        entropicCircle: {
            label: "PL1E.PresetCircleEntropic",
            factory: (args) => {
                const seq = new Sequence();

                if (args.active) {
                    seq.effect()
                        .file("jb2a.magic_signs.circle.02.evocation.complete.dark_red")
                        .attachTo(args.caster.id)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster.id}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster.id}` })
                }
                return [seq];
            }
        },
        aethericCircle: {
            label: "PL1E.PresetCircleAetheric",
            factory: (args) => {
                const seq = new Sequence();

                if (args.active) {
                    seq.effect()
                        .file("jb2a.magic_signs.circle.02.enchantment.complete.dark_pink")
                        .attachTo(args.caster.id)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster.id}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster.id}` })
                }
                return [seq];
            }
        },
        liturgicalCircle: {
            label: "PL1E.PresetCircleLiturgical",
            factory: (args) => {
                const seq = new Sequence();

                if (args.active) {
                    seq.effect()
                        .file("jb2a.magic_signs.circle.02.conjuration.complete.dark_yellow")
                        .attachTo(args.caster.id)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster.id}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster.id}` })
                }
                return [seq];
            }
        },
        faerieCircle: {
            label: "PL1E.PresetCircleFaerie",
            factory: (args) => {
                const seq = new Sequence();

                if (args.active) {
                    seq.effect()
                        .file("jb2a.magic_signs.circle.02.necromancy.complete.dark_green")
                        .attachTo(args.caster.id)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster.id}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster.id}` })
                }
                return [seq];
            }
        },
        asceticCircle: {
            label: "PL1E.PresetCircleAscetic",
            factory: (args) => {
                const seq = new Sequence();

                if (args.active) {
                    seq.effect()
                        .file("jb2a.magic_signs.circle.02.transmutation.complete.dark_yellow")
                        .attachTo(args.caster.id)
                        .belowTokens()
                        .scaleToObject(2)
                        .fadeIn(1500, { ease: "easeOutCubic", delay: 500 })
                        .fadeOut(1500)
                        .rotateIn(90, 2500, { ease: "easeInOutCubic" })
                        .rotateOut(350, 1500, { ease: "easeInCubic" })
                        .scaleIn(2, 2500, { ease: "easeInOutCubic" })
                        .scaleOut(0, 1500, { ease: "easeInCubic" })
                        .persist()
                        .name(`SpellActivation-${args.caster.id}`);
                } else {
                    Sequencer.EffectManager.endEffects({ name: `SpellActivation-${args.caster.id}` })
                }
                return [seq];
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
                return [seq];
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
                    seq.thenDo(() => {
                        const dodgeSeqs = PL1E.sequencerPresets.dodgeTemplate.factory(args);
                        dodgeSeqs.forEach(seq => seq.play());
                    });
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                        .missed(target.result <= 0);
                }
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
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
                return [seq];
            }
        },

        // Defense Effects
        dodgeCaster: {
            label: "PL1E.PresetDefenseDodgeCaster",
            factory: (args) => {
                const sequences = [];

                for (const target of args.targets) {
                    if (target.result <= 0 && target.skill === "reflex") {
                        const seq = PL1E.sequencerSubs.dodge(
                            args.caster.position,
                            target
                        );

                        if (seq) sequences.push(seq);
                    }
                }

                return sequences;
            }
        },
        dodgeTemplate: {
            label: "PL1E.PresetDefenseDodgeTemplate",
            factory: (args) => {
                const sequences = [];

                for (const template of args.templates) {
                    for (const target of args.targets) {
                        if (target.result <= 0 && target.skill === "reflex") {
                            const seq = PL1E.sequencerSubs.dodge(
                                template.primaryPosition,
                                target
                            );

                            if (seq) sequences.push(seq);
                        }
                    }
                }

                return sequences;
            }
        },
        parry: {
            label: "PL1E.PresetDefenseParry",
            factory: (args) => {
                const seq = new Sequence();

                for (const target of args.targets) {
                    if (target.result <= 0 && target.skill === "parry") {
                        seq.effect()
                            .file("jb2a.icon.shield.green")
                            .scale(0.5)
                            .atLocation(target.id)
                        seq.effect()
                            .file("jb2a.impact.008")
                            .scale(0.5)
                            .atLocation(target.id)
                    }
                }
                return [seq];
            }
        }
    };

    PL1E.sequencerSubs = {
        // Attacks
        moveTowardsAttack: (caster, target, effectFile, options = {}) => {
            const seq = new Sequence();

            const duration = options.duration || 2000;
            const waitBeforeDodge = -duration * 0.5;
            const waitBeforeParry = -duration * 0.75;

            const effect = seq.effect()
                .file(effectFile)
                .atLocation(caster.id)
                .moveTowards(target.id)
                .randomizeMirrorY();

            if (target.result <= 0) {
                if (target.skill === "reflex") {
                    effect.waitUntilFinished(waitBeforeDodge);
                    seq.thenDo(() => {
                        const dodgeSeq = PL1E.sequencerSubs.dodge(caster.position, target);
                        if (dodgeSeq) dodgeSeq.play();
                    });
                }
                else if (target.skill === "parry") {
                    effect.waitUntilFinished(waitBeforeParry);
                    seq.thenDo(() => {
                        const parrySeq = PL1E.sequencerSubs.parry(target);
                        if (parrySeq) parrySeq.play();
                    });
                }
            }

            return seq;
        },
        atLocationAttack: (caster, target, effectFile, options = {}) => {
            const seq = new Sequence();

            const duration = options.duration || 2000;
            const waitBeforeDodge = -duration * 0.5;
            const waitBeforeParry = -duration * 0.75;

            const effect = seq.effect()
                .file(effectFile)
                .atLocation(target.id)
                .randomizeMirrorY();

            if (target.result <= 0) {
                if (target.skill === "reflex") {
                    effect.waitUntilFinished(waitBeforeDodge);
                    seq.thenDo(() => {
                        const dodgeSeq = PL1E.sequencerSubs.dodge(caster.position, target);
                        if (dodgeSeq) dodgeSeq.play();
                    });
                }
                else if (target.skill === "parry") {
                    effect.waitUntilFinished(waitBeforeParry);
                    seq.thenDo(() => {
                        const parrySeq = PL1E.sequencerSubs.parry(target);
                        if (parrySeq) parrySeq.play();
                    });
                }
            }

            return seq;
        },
        stretchAttack: (caster, target, effectFile, options = {}) => {
            const seq = new Sequence();

            seq.effect()
                .file(effectFile)
                .atLocation(caster.id)
                .stretchTo(target.id)

            if (target.result <= 0) {
                if (target.skill === "reflex") {
                    seq.thenDo(() => {
                        const dodgeSeq = PL1E.sequencerSubs.dodge(caster.position, target, options);
                        if (dodgeSeq) dodgeSeq.play();
                    });
                }
                else if (target.skill === "parry") {
                    seq.thenDo(() => {
                        const parrySeq = PL1E.sequencerSubs.parry(target, options);
                        if (parrySeq) parrySeq.play();
                    });
                }
            }

            return seq;
        },

        // Defenses
        dodge: (sourcePosition, target, options = {}) => {
            const targetTokenX = target.position.x;
            const targetTokenY = target.position.y;

            const dx = targetTokenX - sourcePosition.x;
            const dy = targetTokenY - sourcePosition.y;

            if (dx === 0 && dy === 0) return null;

            const defenseWait = options.defenseWait ?? 0;
            const recoil = options.recoil ?? 100;
            const duration = options.duration ?? 500;
            const waitTime = options.waitTime ?? 100;

            const length = Math.sqrt(dx*dx + dy*dy);
            const recoilPoint = {
                x: targetTokenX + recoil * dx / length,
                y: targetTokenY + recoil * dy / length
            };

            return new Sequence()
                // .wait(defenseWait)
                .animation()
                    .on(target.id)
                    .moveTowards(recoilPoint, { ease: "easeOutExpo" })
                    .duration(duration)
                    .waitUntilFinished(waitTime)
                .animation()
                    .on(target.id)
                    .moveTowards({ x: targetTokenX, y: targetTokenY }, { ease: "easeOutExpo" })
                    .duration(duration);

        },
        parry: (target, options = {}) => {
            const seq = new Sequence();

            seq.effect()
                .file("jb2a.icon.shield.green")
                .scale(0.5)
                .atLocation(target.id);

            seq.effect()
                .file("jb2a.impact.008")
                .scale(0.5)
                .atLocation(target.id);

            return seq;
        },

        // Others
        magicCircle: (caster, effectFile, active) => {
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
}
