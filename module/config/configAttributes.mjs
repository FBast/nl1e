import {PL1E} from "./config.mjs";

export function getAttributes() {
    PL1E.attributes = {
        // Common
        "description": {
            "label": "PL1E.Description",
            "category": "header",
            "type": "text"
        },
        "mastery": {
            "label": "PL1E.Mastery",
            "category": "header",
            "type": "select",
            "select": "masteries"
        },
        "range": {
            "label": "PL1E.Range",
            "category": "fixed",
            "type": "number",
            "conditions": "areaShape!==self",
            "fallback": 0
        },
        // Features
        "featureType": {
            "label": "PL1E.FeatureType",
            "category": "header",
            "type": "number",
            "select": "featureTypes"
        },
        "cost": {
            "label": "PL1E.Cost",
            "category": "header",
            "type": "number"
        },
        // Abilities
        "level": {
            "label": "PL1E.Level",
            "category": "header",
            "type": "number"
        },
        "healthCost": {
            "label": "PL1E.HealthCost",
            "category": "fixed",
            "dataGroup": "resources",
            "data": "health",
            "function": "decrease"
        },
        "staminaCost": {
            "label": "PL1E.StaminaCost",
            "category": "fixed",
            "dataGroup": "resources",
            "data": "stamina",
            "function": "decrease"
        },
        "manaCost": {
            "label": "PL1E.ManaCost",
            "category": "fixed",
            "dataGroup": "resources",
            "data": "mana",
            "function": "decrease"
        },
        "abilityLink": {
            "label": "PL1E.AbilityLink",
            "category": "fixed",
            "type": "select",
            "select": "abilityLinks"
        },
        "characterRoll": {
            "label": "PL1E.CharacterRoll",
            "category": "fixed",
            "type": "select",
            "select": "abilitySkills"
        },
        "areaShape": {
            "label": "PL1E.AreaShape",
            "category": "fixed",
            "type": "select",
            "select": "areaShapes",
            "fallback": "circle"
        },
        "areaNumber": {
            "label": "PL1E.AreaNumber",
            "category": "fixed",
            "type": "number",
            "conditions": "range!==0",
            "fallback": 1
        },
        "circleRadius": {
            "label": "PL1E.CircleRadius",
            "category": "fixed",
            "type": "number",
            "conditions": "areaShape===circle",
            "fallback": 1
        },
        "coneLength": {
            "label": "PL1E.ConeLength",
            "category": "fixed",
            "type": "number",
            "conditions": "areaShape===cone",
            "fallback": 1
        },
        "coneAngle": {
            "label": "PL1E.ConeAngle",
            "category": "fixed",
            "type": "number",
            "conditions": "areaShape===cone",
            "fallback": 50
        },
        "squareLength": {
            "label": "PL1E.SquareLength",
            "category": "fixed",
            "type": "number",
            "conditions": "areaShape===square",
            "fallback": 1
        },
        "rayLength": {
            "label": "PL1E.RayLength",
            "category": "fixed",
            "type": "number",
            "conditions": "areaShape===ray",
            "fallback": 1
        },
        "targetRoll": {
            "label": "PL1E.TargetRoll",
            "category": "fixed",
            "type": "select",
            "select": "abilitySkills",
            "conditions": "areaShape!==self",
            "fallback": "none"
        },
        // Weapons
        "parryProjectiles": {
            "label": "PL1E.ParryProjectiles",
            "category": "fixed",
            "type": "bool"
        },
        "hands": {
            "label": "PL1E.Hands",
            "category": "fixed",
            "type": "number"
        },
        "ammo": {
            "label": "PL1E.Ammo",
            "category": "fixed",
            "type": "number"
        },
        // Wearables
        "slot": {
            "label": "PL1E.Slot",
            "category": "header",
            "type": "select",
            "select": "slots"
        },
        "slashingReduction": {
            "label": "PL1E.SlashingReduction",
            "category": "header",
            "dataGroup": "reductions",
            "data": "slashing",
            "function": "increase"
        },
        "piercingReduction": {
            "label": "PL1E.PiercingReduction",
            "category": "header",
            "dataGroup": "reductions",
            "data": "piercing",
            "function": "increase"
        },
        "crushingReduction": {
            "label": "PL1E.CrushingReduction",
            "category": "header",
            "dataGroup": "reductions",
            "data": "crushing",
            "function": "increase"
        },
        // Consumables
        "activation": {
            "label": "PL1E.Activation",
            "category": "header",
            "type": "select",
            "select": "activations"
        },
        "reloadable": {
            "label": "PL1E.Reloadable",
            "category": "fixed",
            "type": "bool"
        },
        "uses": {
            "label": "PL1E.Uses",
            "category": "fixed",
            "type": "number"
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