import {PL1E} from "./config.mjs";

export function getConfigItems() {
    PL1E.items = {
        "feature": {
            "droppable": ["feature", "ability", "weapon", "wearable"],
            "stackable": ["weapon"]
        },
        "ability": {
            "droppable": [],
            "stackable": []
        },
        "weapon": {
            "droppable": ["feature", "ability"],
            "stackable": []
        },
        "wearable": {
            "droppable": ["feature", "ability"],
            "stackable": []
        },
        "consumable": {
            "droppable": [],
            "stackable": []
        },
        "common": {
            "droppable": [],
            "stackable": []
        }
    }

    PL1E.itemBase = {
        "isMajorActionUsed": {
            "label": "PL1E.MajorAction",
            "icon": "fa-star",
            "type": "bool",
            "path": "system.isMajorActionUsed"
        },
        "removedUses": {
            "label": "PL1E.RemovedUses",
            "icon": "fa-tally",
            "type": "number",
            "path": "system.removedUses"
        },
    }

    PL1E.attributes = {
        // Common
        "description": {
            "label": "PL1E.Description",
            "type": "text"
        },
        "masters": {
            "label": "PL1E.Masters",
            "type": "select",
            "select": "masters"
        },
        "range": {
            "label": "PL1E.Range",
            "type": "number",
            "fallback": 0
        },
        "uses": {
            "label": "PL1E.Uses",
            "type": "number"
        },
        "actionCost": {
            "label": "PL1E.ActionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "action",
            "invertSign": true,
            "combatOnly": true
        },
        "reactionCost": {
            "label": "PL1E.ReactionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "reaction",
            "invertSign": true,
            "combatOnly": true
        },
        "isMajorAction": {
            "label": "PL1E.Major",
            "type": "bool",
            "document": "linkedItem",
            "dataGroup": "itemBase",
            "data": "isMajorActionUsed",
            "applyIfTrue": true,
            "combatOnly": true
        },
        "activationMacro": {
            "label": "PL1E.ActivationMacro",
            "type": "text"
        },
        "preLaunchMacro": {
            "label": "PL1E.PreLaunchMacro",
            "type": "text"
        },
        "postLaunchMacro": {
            "label": "PL1E.PostLaunchMacro",
            "type": "text"
        },
        // Features
        "featureType": {
            "label": "PL1E.FeatureType",
            "type": "number",
            "select": "featureTypes"
        },
        "cost": {
            "label": "PL1E.Cost",
            "type": "number"
        },
        // Abilities
        "level": {
            "label": "PL1E.Level",
            "type": "number"
        },
        "healthCost": {
            "label": "PL1E.HealthCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "health",
            "invertSign": true
        },
        "staminaCost": {
            "label": "PL1E.StaminaCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "stamina",
            "invertSign": true
        },
        "manaCost": {
            "label": "PL1E.ManaCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "mana",
            "invertSign": true
        },
        "usageCost": {
            "label": "PL1E.UsageCost",
            "type": "number",
            "document": "linkedItem",
            "dataGroup": "itemBase",
            "data": "removedUses",
            "invertSign": false
        },
        "abilityLink": {
            "label": "PL1E.AbilityLink",
            "type": "select",
            "select": "abilityLinks"
        },
        "characterRoll": {
            "label": "PL1E.CharacterRoll",
            "type": "select",
            "select": "abilitySkills"
        },
        "areaShape": {
            "label": "PL1E.AreaShape",
            "type": "select",
            "select": "areaShapes",
            "fallback": "circle"
        },
        "areaNumber": {
            "label": "PL1E.AreaNumber",
            "type": "number",
            "fallback": 1
        },
        "circleRadius": {
            "label": "PL1E.CircleRadius",
            "type": "number",
            "fallback": 1
        },
        "coneLength": {
            "label": "PL1E.ConeLength",
            "type": "number",
            "fallback": 1
        },
        "coneAngle": {
            "label": "PL1E.ConeAngle",
            "type": "number",
            "fallback": 50
        },
        "squareLength": {
            "label": "PL1E.SquareLength",
            "type": "number",
            "fallback": 1
        },
        "rayLength": {
            "label": "PL1E.RayLength",
            "type": "number",
            "fallback": 1
        },
        "targetRoll": {
            "label": "PL1E.TargetRoll",
            "type": "select",
            "select": "abilityResistances",
            "fallback": "none"
        },
        // Weapons
        "hands": {
            "label": "PL1E.Hands",
            "type": "number"
        },
        // Wearables
        "slot": {
            "label": "PL1E.Slot",
            "type": "select",
            "select": "slots"
        },
        // Consumables
        "isReloadable": {
            "label": "PL1E.Reloadable",
            "type": "bool"
        },
        // Common Objects
        "commonType": {
            "label": "PL1E.CommonType",
            "type": "select",
            "select": "commonTypes"
        }
    }

    PL1E.passiveAspectsObjects = [
        {
            "name": "increase",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "createEffect": false,
            "effectIcon": "systems/pl1e/assets/icons/increase.svg"
        },
        {
            "name": "decrease",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "createEffect": false,
            "effectIcon": "systems/pl1e/assets/icons/decrease.svg"
        },
        {
            "name": "set",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "createEffect": false,
            "effectIcon": "systems/pl1e/assets/icons/set.svg"
        },
        {
            "name": "modify",
            "dataGroup": "resources",
            "data": "health",
            "value": 0,
            "createEffect": false,
            "effectIcon": "systems/pl1e/assets/icons/increase.svg"
        },
    ]

    PL1E.activeAspectsObjects = [
        {
            "name": "increase",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "resolutionType": "value",
            "targetGroup": "all",
            "createEffect": false,
            "effectDuration": 1,
            "effectDurationResolutionType": "value",
            "effectIcon": "systems/pl1e/assets/icons/increase.svg",
            "effectIconTint": "#00ff00"
        },
        {
            "name": "decrease",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "resolutionType": "value",
            "targetGroup": "all",
            "damageType": "raw",
            "createEffect": false,
            "effectDuration": 1,
            "effectDurationResolutionType": "value",
            "effectIcon": "systems/pl1e/assets/icons/decrease.svg",
            "effectIconTint": "#ff0000"
        },
        {
            "name": "set",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "resolutionType": "value",
            "targetGroup": "all",
            "createEffect": false,
            "effectDuration": 1,
            "effectDurationResolutionType": "value",
            "effectIcon": "systems/pl1e/assets/icons/set.svg",
            "effectIconTint": "#000000"
        },
        {
            "name": "modify",
            "dataGroup": "resources",
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
            "dataGroup": "resources",
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
        "increase": {
            "label": "PL1E.Increase",
            "img": "systems/pl1e/assets/icons/increase.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "general": "PL1E.General",
                "reductions": "PL1E.Reductions",
                "misc": "PL1E.Misc"
            }
        },
        "decrease": {
            "label": "PL1E.Decrease",
            "img": "systems/pl1e/assets/icons/decrease.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "general": "PL1E.General",
                "reductions": "PL1E.Reductions",
                "misc": "PL1E.Misc"
            }
        },
        "set": {
            "label": "PL1E.Set",
            "img": "systems/pl1e/assets/icons/set.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "general": "PL1E.General",
                "reductions": "PL1E.Reductions",
                "misc": "PL1E.Misc"
            }
        },
        "modify": {
            "label": "PL1E.Modify",
            "img": "systems/pl1e/assets/icons/set.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "general": "PL1E.General",
                "reductions": "PL1E.Reductions",
                "misc": "PL1E.Misc"
            }
        },
        "transfer": {
            "label": "PL1E.Transfer",
            "img": "systems/pl1e/assets/icons/transfer.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
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

    PL1E.abilitySkills = {
        "none": "PL1E.None",
        "handling": "PL1E.Handling",
        "throwing": "PL1E.Throwing",
        "athletics": "PL1E.Athletics",
        "acrobatics": "PL1E.Acrobatics",
        "accuracy": "PL1E.Accuracy",
        "search": "PL1E.Search",
        "vigilance": "PL1E.Vigilance",
        "discretion": "PL1E.Discretion",
        "performance": "PL1E.Performance",
        "diplomacy": "PL1E.Diplomacy",
        "intimidation": "PL1E.Intimidation",
        "bluff": "PL1E.Bluff",
        "craft": "PL1E.Craft",
        "erudition": "PL1E.Erudition",
        "nature": "PL1E.Nature",
        "magic": "PL1E.Magic",
    }
    
    PL1E.abilityResistances = {
        "cover": "PL1E.Cover",
        "parry": "PL1E.Parry",
        "reflex": "PL1E.Reflex",
        "vigor": "PL1E.Vigor",
        "resilience": "PL1E.Resilience",
        "intuition": "PL1E.Intuition"
    }

    PL1E.areaShapes = {
        "self": "PL1E.Self",
        "target": "PL1E.Target",
        "circle": "PL1E.Circle",
        "cone": "PL1E.Cone",
        "square": "PL1E.Square",
        "ray": "PL1E.Ray"
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

    PL1E.resolutionTypes = {
        "value": "PL1E.Value",
        "valueIfSuccess" : "PL1E.ValueIfSuccess",
        "valueMultipliedBySuccess": "PL1E.ValueMultipliedBySuccess"
    }

    PL1E.linkOverrides = {
        "none": "PL1E.None",
        "reach": "PL1E.Reach",
        "range": "PL1E.Range"
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