import {PL1E} from "./config.mjs";

export function getConfigAspects() {

    PL1E.passiveAspectsObjects = [
        {
            "name": "modify",
            "dataGroup": "aspectsResources",
            "data": "health",
            "value": 0,
            "createEffect": false,
            "effectIcon": "systems/pl1e/assets/icons/increase.svg"
        },
    ]

    PL1E.activeAspectsObjects = [
        {
            "name": "modify",
            "dataGroup": "aspectsResources",
            "data": "health",
            "operator": "add",
            "damageType": "raw",
            "value": 0,
            "resolutionType": "value",
            "targetGroup": "all",
            "createEffect": false,
            "effectDuration": 1,
            "effectDurationResolutionType": "value",
            "effectIcon": "systems/pl1e/assets/icons/set.svg",
            "effectIconTint": "#000000"
        },
        {
            "name": "transfer",
            "value": 0,
            "dataGroup": "aspectsResources",
            "data": "health",
            "resolutionType": "value",
            "targetGroup": "all",
            "transferSource": "all",
            "transferDestination": "all",
            "damageType": "raw",
            "effectIcon": "systems/pl1e/assets/icons/transfer.svg"
        },
        {
            "name": "status",
            "value": 0,
            "dataGroup": "statuses",
            "data": "stunned",
            "targetGroup": "all",
            "statusType": "permanent",
            "effectDuration": 1,
        },
        {
            "name": "movement",
            "value": 0,
            "dataGroup": "movements",
            "data": "standard",
            "targetGroup": "all"
        },
        {
            "name": "invocation",
            "value": 0,
            "dataGroup": "invocations",
            "data": "standard",
            "resolutionType": "value",
            "invocation": ""
        }
    ]

    PL1E.aspects = {
        "modify": {
            "label": "PL1E.Modify",
            "img": "systems/pl1e/assets/icons/set.svg",
            "dataGroups": {
                "aspectsResources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "aspectsSkills": "PL1E.Skills",
                "general": "PL1E.General",
                "reductions": "PL1E.Reductions",
                "aspectsMisc": "PL1E.Misc"
            }
        },
        "transfer": {
            "label": "PL1E.Transfer",
            "img": "systems/pl1e/assets/icons/transfer.svg",
            "dataGroups": {
                "aspectsResources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "reductions": "PL1E.Reductions"
            }
        },
        "status": {
            "label": "PL1E.Status",
            "img": "systems/pl1e/assets/icons/status.svg",
            "dataGroups": {
                "statuses": "PL1E.Statuses"
            }
        },
        "movement": {
            "label": "PL1E.Movement",
            "img": "systems/pl1e/assets/icons/movement.svg",
            "dataGroups": {
                "movements": "PL1E.Movements"
            }
        },
        "invocation": {
            "label": "PL1E.Invocation",
            "img": "systems/pl1e/assets/icons/invocation.svg",
            "dataGroups": {
                "invocations": "PL1E.Invocations"
            }
        }
    }

    PL1E.aspectsResources = {
        "health": {
            "label": "PL1E.Health",
            "path": "system.resources.health.value",
            "type": "number"
        },
        "healthMax": {
            "label": "PL1E.MaxHealth",
            "path": "system.resources.health.max",
            "type": "number"
        },
        "healthTemp": {
            "label": "PL1E.TempHealth",
            "path": "system.resources.health.temp",
            "type": "number"
        },
        "stamina": {
            "label": "PL1E.Stamina",
            "path": "system.resources.stamina.value",
            "type": "number"
        },
        "staminaMax": {
            "label": "PL1E.MaxStamina",
            "path": "system.resources.stamina.max",
            "type": "number"
        },
        "staminaTemp": {
            "label": "PL1E.TempStamina",
            "path": "system.resources.stamina.temp",
            "type": "number"
        },
        "mana": {
            "label": "PL1E.Mana",
            "path": "system.resources.mana.value",
            "type": "number"
        },
        "manaMax": {
            "label": "PL1E.MaxStamina",
            "path": "system.resources.mana.max",
            "type": "number"
        },
        "manaTemp": {
            "label": "PL1E.TempStamina",
            "path": "system.resources.mana.temp",
            "type": "number"
        }
    }

    PL1E.aspectsSkills = {
        "coverNumber": {
            "label": "PL1E.CoverNumber",
            "path": "system.skills.cover.numberMod",
            "type": "number"
        },
        "coverDice": {
            "label": "PL1E.CoverDice",
            "path": "system.skills.cover.numberMod",
            "type": "number"
        },
        "coverExplode": {
            "label": "PL1E.CoverExploding",
            "path": "system.skills.cover.exploding",
            "type": "bool"
        },
        "parryNumber": {
            "label": "PL1E.ParryNumber",
            "path": "system.skills.parry.numberMod",
            "type": "number"
        },
        "parryDice": {
            "label": "PL1E.ParryDice",
            "path": "system.skills.parry.numberMod",
            "type": "number"
        },
        "parryExplode": {
            "label": "PL1E.ParryExploding",
            "path": "system.skills.parry.exploding",
            "type": "bool"
        },
        "reflexNumber": {
            "label": "PL1E.ReflexNumber",
            "path": "system.skills.reflex.numberMod",
            "type": "number"
        },
        "reflexDice": {
            "label": "PL1E.ReflexDice",
            "path": "system.skills.reflex.numberMod",
            "type": "number"
        },
        "reflexExplode": {
            "label": "PL1E.ReflexExploding",
            "path": "system.skills.reflex.exploding",
            "type": "bool"
        },
        "vigorNumber": {
            "label": "PL1E.VigorNumber",
            "path": "system.skills.vigor.numberMod",
            "type": "number"
        },
        "vigorDice": {
            "label": "PL1E.VigorDice",
            "path": "system.skills.vigor.numberMod",
            "type": "number"
        },
        "vigorExplode": {
            "label": "PL1E.VigorExploding",
            "path": "system.skills.vigor.exploding",
            "type": "bool"
        },
        "resilienceNumber": {
            "label": "PL1E.ResilienceNumber",
            "path": "system.skills.resilience.numberMod",
            "type": "number"
        },
        "resilienceDice": {
            "label": "PL1E.ResilienceDice",
            "path": "system.skills.resilience.numberMod",
            "type": "number"
        },
        "resilienceExplode": {
            "label": "PL1E.ResilienceExploding",
            "path": "system.skills.resilience.exploding",
            "type": "bool"
        },
        "intuitionNumber": {
            "label": "PL1E.IntuitionNumber",
            "path": "system.skills.intuition.numberMod",
            "type": "number"
        },
        "intuitionDice": {
            "label": "PL1E.IntuitionDice",
            "path": "system.skills.intuition.numberMod",
            "type": "number"
        },
        "intuitionExplode": {
            "label": "PL1E.IntuitionExploding",
            "path": "system.skills.intuition.exploding",
            "type": "bool"
        },
        "handlingNumber": {
            "label": "PL1E.HandlingNumber",
            "path": "system.skills.handling.numberMod",
            "type": "number"
        },
        "handlingDice": {
            "label": "PL1E.HandlingDice",
            "path": "system.skills.handling.numberMod",
            "type": "number"
        },
        "handlingExplode": {
            "label": "PL1E.HandlingExploding",
            "path": "system.skills.handling.exploding",
            "type": "bool"
        },
        "throwingNumber": {
            "label": "PL1E.ThrowingNumber",
            "path": "system.skills.throwing.numberMod",
            "type": "number"
        },
        "throwingDice": {
            "label": "PL1E.ThrowingDice",
            "path": "system.skills.throwing.numberMod",
            "type": "number"
        },
        "throwingExplode": {
            "label": "PL1E.ThrowingExploding",
            "path": "system.skills.throwing.exploding",
            "type": "bool"
        },
        "athleticsNumber": {
            "label": "PL1E.AthleticsNumber",
            "path": "system.skills.athletics.numberMod",
            "type": "number"
        },
        "athleticsDice": {
            "label": "PL1E.AthleticsDice",
            "path": "system.skills.athletics.numberMod",
            "type": "number"
        },
        "athleticsExplode": {
            "label": "PL1E.AthleticsExploding",
            "path": "system.skills.athletics.exploding",
            "type": "bool"
        },
        "acrobaticsNumber": {
            "label": "PL1E.AcrobaticsNumber",
            "path": "system.skills.acrobatics.numberMod",
            "type": "number"
        },
        "acrobaticsDice": {
            "label": "PL1E.AcrobaticsDice",
            "path": "system.skills.acrobatics.numberMod",
            "type": "number"
        },
        "acrobaticsExplode": {
            "label": "PL1E.AcrobaticsExploding",
            "path": "system.skills.acrobatics.exploding",
            "type": "bool"
        },
        "accuracyNumber": {
            "label": "PL1E.AccuracyNumber",
            "path": "system.skills.accuracy.numberMod",
            "type": "number"
        },
        "accuracyDice": {
            "label": "PL1E.AccuracyDice",
            "path": "system.skills.accuracy.numberMod",
            "type": "number"
        },
        "accuracyExplode": {
            "label": "PL1E.AccuracyExploding",
            "path": "system.skills.accuracy.exploding",
            "type": "bool"
        },
        "searchNumber": {
            "label": "PL1E.SearchNumber",
            "path": "system.skills.search.numberMod",
            "type": "number"
        },
        "searchDice": {
            "label": "PL1E.SearchDice",
            "path": "system.skills.search.numberMod",
            "type": "number"
        },
        "searchExplode": {
            "label": "PL1E.SearchExploding",
            "path": "system.skills.search.exploding",
            "type": "bool"
        },
        "vigilanceNumber": {
            "label": "PL1E.VigilanceNumber",
            "path": "system.skills.vigilance.numberMod",
            "type": "number"
        },
        "vigilanceDice": {
            "label": "PL1E.VigilanceDice",
            "path": "system.skills.vigilance.numberMod",
            "type": "number"
        },
        "vigilanceExplode": {
            "label": "PL1E.VigilanceExploding",
            "path": "system.skills.vigilance.exploding",
            "type": "bool"
        },
        "discretionNumber": {
            "label": "PL1E.DiscretionNumber",
            "path": "system.skills.discretion.numberMod",
            "type": "number"
        },
        "discretionDice": {
            "label": "PL1E.DiscretionDice",
            "path": "system.skills.discretion.numberMod",
            "type": "number"
        },
        "discretionExplode": {
            "label": "PL1E.DiscretionExploding",
            "path": "system.skills.discretion.exploding",
            "type": "bool"
        },
        "performanceNumber": {
            "label": "PL1E.PerformanceNumber",
            "path": "system.skills.performance.numberMod",
            "type": "number"
        },
        "performanceDice": {
            "label": "PL1E.PerformanceDice",
            "path": "system.skills.performance.numberMod",
            "type": "number"
        },
        "performanceExplode": {
            "label": "PL1E.PerformanceExploding",
            "path": "system.skills.performance.exploding",
            "type": "bool"
        },
        "diplomacyNumber": {
            "label": "PL1E.DiplomacyNumber",
            "path": "system.skills.diplomacy.numberMod",
            "type": "number"
        },
        "diplomacyDice": {
            "label": "PL1E.DiplomacyDice",
            "path": "system.skills.diplomacy.numberMod",
            "type": "number"
        },
        "diplomacyExplode": {
            "label": "PL1E.DiplomacyExploding",
            "path": "system.skills.diplomacy.exploding",
            "type": "bool"
        },
        "intimidationNumber": {
            "label": "PL1E.IntimidationNumber",
            "path": "system.skills.intimidation.numberMod",
            "type": "number"
        },
        "intimidationDice": {
            "label": "PL1E.IntimidationDice",
            "path": "system.skills.intimidation.numberMod",
            "type": "number"
        },
        "intimidationExplode": {
            "label": "PL1E.IntimidationExploding",
            "path": "system.skills.intimidation.exploding",
            "type": "bool"
        },
        "bluffNumber": {
            "label": "PL1E.BluffNumber",
            "path": "system.skills.bluff.numberMod",
            "type": "number"
        },
        "bluffDice": {
            "label": "PL1E.BluffDice",
            "path": "system.skills.bluff.numberMod",
            "type": "number"
        },
        "bluffExplode": {
            "label": "PL1E.BluffExploding",
            "path": "system.skills.bluff.exploding",
            "type": "bool"
        },
        "craftNumber": {
            "label": "PL1E.CraftNumber",
            "path": "system.skills.craft.numberMod",
            "type": "number"
        },
        "craftDice": {
            "label": "PL1E.CraftDice",
            "path": "system.skills.craft.numberMod",
            "type": "number"
        },
        "craftExplode": {
            "label": "PL1E.CraftExploding",
            "path": "system.skills.craft.exploding",
            "type": "bool"
        },
        "eruditionNumber": {
            "label": "PL1E.EruditionNumber",
            "path": "system.skills.erudition.numberMod",
            "type": "number"
        },
        "eruditionDice": {
            "label": "PL1E.EruditionDice",
            "path": "system.skills.erudition.numberMod",
            "type": "number"
        },
        "eruditionExplode": {
            "label": "PL1E.EruditionExploding",
            "path": "system.skills.erudition.exploding",
            "type": "bool"
        },
        "natureNumber": {
            "label": "PL1E.NatureNumber",
            "path": "system.skills.nature.numberMod",
            "type": "number"
        },
        "natureDice": {
            "label": "PL1E.NatureDice",
            "path": "system.skills.nature.numberMod",
            "type": "number"
        },
        "natureExplode": {
            "label": "PL1E.NatureExploding",
            "path": "system.skills.nature.exploding",
            "type": "bool"
        },
        "magicNumber": {
            "label": "PL1E.MagicNumber",
            "path": "system.skills.magic.numberMod",
            "type": "number"
        },
        "magicDice": {
            "label": "PL1E.MagicDice",
            "path": "system.skills.magic.numberMod",
            "type": "number"
        },
        "magicExplode": {
            "label": "PL1E.MagicExploding",
            "path": "system.skills.magic.exploding",
            "type": "bool"
        }
    }

    PL1E.aspectsMisc = {
        "statusImmunities": {
            "label": "PL1E.StatusImmunities",
            "icon": "fa-swords",
            "type": "array",
            "path": "system.misc.statusImmunities",
            "select": "statusImmunities"
        },
        "masters": {
            "label": "PL1E.Masters",
            "icon": "fa-swords",
            "type": "array",
            "path": "system.misc.masters",
            "select": "masters"
        },
        "size": {
            "label": "PL1E.Size",
            "icon": "fa-arrow-up-big-small",
            "type": "select",
            "path": "system.misc.size",
            "select": "sizes"
        },
        "speed": {
            "label": "PL1E.Speed",
            "icon": "fa-person-running",
            "type": "select",
            "path": "system.misc.speed",
            "select": "speeds"
        },
        "unconsciousDoor": {
            "label": "PL1E.UnconsciousDoor",
            "icon": "fa-face-sleeping",
            "type": "number",
            "path": "system.misc.unconsciousDoor"
        },
        "deathDoor": {
            "label": "PL1E.DeathDoor",
            "icon": "fa-skull",
            "type": "number",
            "path": "system.misc.deathDoor"
        },
        "flexibility": {
            "label": "PL1E.Flexibility",
            "icon": "fa-weight-hanging",
            "type": "number",
            "path": "system.misc.flexibility"
        },
        "nightVisionRange": {
            "label": "PL1E.NightVisionRange",
            "icon": "fa-eye",
            "type": "number",
            "path": "system.misc.nightVisionRange"
        },
        "faithPower": {
            "label": "PL1E.FaithPower",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.faithPower"
        },
        "gesturalMagic": {
            "label": "PL1E.GesturalMagic",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.gesturalMagic"
        },
        "vocalMagic": {
            "label": "PL1E.VocalMagic",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.vocalMagic"
        }
    }

    PL1E.damageTypes = {
        "raw": "PL1E.Raw",
        "slashing": "PL1E.Slashing",
        "crushing": "PL1E.Crushing",
        "piercing": "PL1E.Piercing",
        "burn": "PL1E.Burn",
        "cold": "PL1E.Cold",
        "acid": "PL1E.Acid",
        "shock": "PL1E.Shock"
    }

    PL1E.targetGroups = {
        "all": "PL1E.All",
        "self": "PL1E.Self",
        "allies": "PL1E.Allies",
        "opponents": "PL1E.Opponents",
    }

    PL1E.statusTypes = {
        "permanentIfSuccess": "PL1E.PermanentIfSuccess",
        "durationFromSuccess": "PL1E.DurationFromSuccess",
        "durationIfSuccess": "PL1E.DurationIfSuccess"
    }

    PL1E.statusImmunities = {
        "charmed": "PL1E.StatusCharmed",
        "paralysis": "PL1E.StatusParalysis",
        "asleep": "PL1E.StatusAsleep",
        "restrained": "PL1E.StatusRestrained",
        "slow": "PL1E.StatusSlow",
        "fast": "PL1E.StatusFast",
        "stunned": "PL1E.StatusStunned",
        "invigorated": "PL1E.StatusInvigorated",
        "sick": "PL1E.StatusSick",
        "healthy": "PL1E.StatusHealthy",
        "confused": "PL1E.StatusConfused",
        "composed": "PL1E.StatusComposed",
        "bleeding": "PL1E.StatusBleeding",
        "regenerate": "PL1E.StatusRegenerate",
        "downgraded": "PL1E.StatusDowngraded",
        "upgraded": "PL1E.StatusUpgraded",
        "blind": "PL1E.StatusBlind",
        "deaf": "PL1E.StatusDeaf",
        "invisible": "PL1E.StatusInvisible",
        "clairvoyant": "PL1E.StatusClairvoyant",
        "tremorsense": "PL1E.StatusTremorsense"
    }

    PL1E.movements = {
        "walk": {
            "label": "PL1E.Walk"
        },
        "push": {
            "label": "PL1E.Push"
        },
        "teleport": {
            "label": "PL1E.Teleport"
        }
    }

    PL1E.invocations = {
        "standard": {
            "label": "PL1E.Standard"
        }
    }

    PL1E.numberOperators = {
        "add": "PL1E.Add",
        "remove": "PL1E.Remove",
        "set": "PL1E.Set"
    }

}