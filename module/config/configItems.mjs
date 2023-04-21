import {PL1E} from "./config.mjs";

export function getConfigItems() {
    PL1E.items = {
        "feature": {
            "droppable": ["feature", "ability", "aspect"]
        },
        "ability": {
            "droppable": ["aspect"]
        },
        "weapon": {
            "droppable": ["feature", "ability", "aspect"]
        },
        "wearable": {
            "droppable": ["feature", "ability", "aspect"]
        },
        "consumable": {
            "droppable": ["aspect"]
        },
        "common": {
            "droppable": []
        },
        "aspect": {
            "droppable": []
        }
    }

    PL1E.attributes = {
        // Common
        "description": {
            "label": "PL1E.Description",
            "type": "text"
        },
        "mastery": {
            "label": "PL1E.Mastery",
            "type": "select",
            "select": "masteries"
        },
        "range": {
            "label": "PL1E.Range",
            "type": "number",
            "fallback": 0
        },
        "activation": {
            "label": "PL1E.Activation",
            "type": "select",
            "select": "activations"
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
            "dataGroup": "resources",
            "data": "health",
            "invertSign": true
        },
        "staminaCost": {
            "label": "PL1E.StaminaCost",
            "type": "number",
            "dataGroup": "resources",
            "data": "stamina",
            "invertSign": true
        },
        "manaCost": {
            "label": "PL1E.ManaCost",
            "type": "number",
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
            "select": "abilitySkills",
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
        "reloadable": {
            "label": "PL1E.Reloadable",
            "type": "bool"
        },
        "uses": {
            "label": "PL1E.Uses",
            "type": "number"
        },
        // Select generated
        "action": {
            "label": "PL1E.Action",
            "type": "number",
            "dataGroup": "misc",
            "data": "action"
        },
        "reaction": {
            "label": "PL1E.Reaction",
            "type": "number",
            "dataGroup": "misc",
            "data": "reaction"
        },
        "instant": {
            "label": "PL1E.Activation",
            "type": "number",
            "dataGroup": "misc",
            "data": "instant"
        }
    }

    PL1E.functions = {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "override": "PL1E.Override",
        "transfer": "PL1E.Transfer",
        "effect": "PL1E.Effect"
    }

    PL1E.dataGroups = {
        "resources": "PL1E.Resources",
        "characteristics": "PL1E.Characteristics",
        "misc": "PL1E.Misc"
    }

    PL1E.dynamicAttributesGroups = {
        "feature": {
            "increase": "PL1E.Increase",
            "decrease": "PL1E.Decrease",
            "override": "PL1E.Override"
        },
        "ability": {
            "increase": "PL1E.Increase",
            "decrease": "PL1E.Decrease",
            "override": "PL1E.Override",
            "transfer": "PL1E.Transfer",
            "effect": "PL1E.Effect"
        },
        "weapon": {
            "increase": "PL1E.Increase",
            "decrease": "PL1E.Decrease",
            "override": "PL1E.Override",
            "transfer": "PL1E.Transfer"
        },
        "wearable": {
            "increase": "PL1E.Increase",
            "decrease": "PL1E.Decrease",
            "override": "PL1E.Override"
        },
        "consumable": {
            "increase": "PL1E.Increase",
            "decrease": "PL1E.Decrease",
            "override": "PL1E.Override"
        }
    }

    PL1E.aspects = {
        "increase": {
            "value": 0,
            "dataGroup": "resources",
            "data": "strength",
        },
        "decrease": {
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
            "reduction": "none",
        },
        "override": {
            "value": 0,
            "dataGroup": "resources",
            "data": "health",
        },
        "transfer": {
            "value": 0,
            "reduction": "none",
            "dataGroup": "resources",
            "data": "health",
        },
        "effect": {
            "value": 0,
            "dataGroup": "characteristics",
            "data": "strength",
        }
    }

    PL1E.abilitySkills = {
        "none": "PL1E.None",
        "parry": "PL1E.Parry",
        "dodge": "PL1E.Dodge",
        "vigor": "PL1E.Vigor",
        "reflex": "PL1E.Reflex",
        "resilience": "PL1E.Resilience",
        "intuition": "PL1E.Intuition",
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
        "divineMagic": "PL1E.DivineMagic",
        "secularMagic": "PL1E.SecularMagic",
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
        "value" : "PL1E.Value",
        "valueIfSuccess" : "PL1E.ValueIfSuccess",
        "multiplyBySuccess": "PL1E.MultiplyBySuccess"
    }

    PL1E.abilityLinks = {
        "none" : "PL1E.None",
        "parent": "PL1E.Parent",
        "mastery": "PL1E.Mastery"
    }

}