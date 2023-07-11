import {PL1E} from "./config.mjs";

export function getConfigItems() {
    PL1E.items = {
        "feature": {
            "droppable": ["feature", "ability"]
        },
        "ability": {
            "droppable": []
        },
        "weapon": {
            "droppable": ["feature", "ability"]
        },
        "wearable": {
            "droppable": ["feature", "ability"]
        },
        "consumable": {
            "droppable": []
        },
        "common": {
            "droppable": []
        }
    }

    PL1E.itemBase = {
        "isMajorActionUsed": {
            "label": "PL1E.MajorAction",
            "icon": "fa-star",
            "type": "bool",
            "path": "system.isMajorActionUsed"
        }
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
        "launchMacro": {
            "label": "PL1E.LaunchMacro",
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
        "parryProjectiles": {
            "label": "PL1E.ParryProjectiles",
            "type": "bool"
        },
        "hands": {
            "label": "PL1E.Hands",
            "type": "number"
        },
        "ammo": {
            "label": "PL1E.Ammo",
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
        "uses": {
            "label": "PL1E.Uses",
            "type": "number"
        },
        // Common
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
            "data": "mana",
            "createEffect": false,
            "effectIcon": "icons/svg/upgrade.svg"
        },
        {
            "name": "decrease",
            "value": 0,
            "dataGroup": "resources",
            "data": "stamina",
            "createEffect": false,
            "effectIcon": "icons/svg/downgrade.svg"
        },
        {
            "name": "set",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "createEffect": false,
            "effectIcon": "icons/svg/target.svg"
        }
    ]

    PL1E.activeAspectsObjects = [
        {
            "name": "increase",
            "value": 0,
            "dataGroup": "resources",
            "data": "mana",
            "targetGroup": "all",
            "resolutionType": "value",
            "createEffect": false,
            "effectDuration": 1,
            "eachTurnEffect": false,
            "effectIcon": "icons/svg/upgrade.svg"
        },
        {
            "name": "decrease",
            "value": 0,
            "dataGroup": "resources",
            "data": "stamina",
            "targetGroup": "all",
            "resolutionType": "value",
            "damageType": "raw",
            "createEffect": false,
            "effectDuration": 1,
            "eachTurnEffect": false,
            "effectIcon": "icons/svg/downgrade.svg"
        },
        {
            "name": "set",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "targetGroup": "all",
            "resolutionType": "value",
            "createEffect": false,
            "effectDuration": 1,
            "effectIcon": "icons/svg/target.svg"
        },
        {
            "name": "transfer",
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "targetGroup": "all",
            "transferSource": "all",
            "transferDestination": "all",
            "resolutionType": "value",
            "damageType": "raw",
            "effectIcon": "icons/svg/stoned.svg"
        },
        {
            "name": "status",
            "value": 0,
            "dataGroup": "status",
            "data": "dead",
            "targetGroup": "all",
            "statusType": "permanent",
            "statusDuration": 1,
            "effectIcon": "icons/svg/aura.svg"
        }
    ]

    PL1E.aspects = {
        "increase": {
            "label": "PL1E.Increase",
            "img": "icons/svg/upgrade.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "misc": "PL1E.Misc",
                "reductions": "PL1E.Reductions"
            }
        },
        "decrease": {
            "label": "PL1E.Decrease",
            "img": "icons/svg/downgrade.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "misc": "PL1E.Misc",
                "reductions": "PL1E.Reductions"
            }
        },
        "set": {
            "label": "PL1E.Set",
            "img": "icons/svg/target.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "misc": "PL1E.Misc",
                "reductions": "PL1E.Reductions"
            }
        },
        "transfer": {
            "label": "PL1E.Transfer",
            "img": "icons/svg/stoned.svg",
            "dataGroups": {
                "resources": "PL1E.Resources",
                "characteristics": "PL1E.Characteristics",
                "misc": "PL1E.Misc",
                "reductions": "PL1E.Reductions"
            }
        },
        "status": {
            "label": "PL1E.Status",
            "img": "icons/svg/aura.svg",
            "dataGroups": {
                "status": "PL1E.Status"
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
        "parry": "PL1E.Parry",
        "dodge": "PL1E.Dodge",
        "vigor": "PL1E.Vigor",
        "reflex": "PL1E.Reflex",
        "resilience": "PL1E.Resilience",
        "intuition": "PL1E.Intuition"
    }

    PL1E.areaShapes = {
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
        "multiplyBySuccess": "PL1E.MultiplyBySuccess"
    }

    PL1E.masteryLinks = {
        "melee": "PL1E.Melee",
        "ranged": "PL1E.Ranged",
        "special": "PL1E.Special"
    }

    PL1E.statusTypes = {
        "permanentIfSuccess": "PL1E.PermanentIfSuccess",
        "durationFromSuccess": "PL1E.DurationFromSuccess",
        "durationIfSuccess": "PL1E.DurationIfSuccess"
    }

}