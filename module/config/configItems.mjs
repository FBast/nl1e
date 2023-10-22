import {PL1E} from "./config.mjs";

export function getConfigItems() {
    PL1E.itemTypes = {
        "feature": {
            "label": "PL1E.Feature",
            "droppable": ["ability"],
            "localDroppable": [],
            "stackable": []
        },
        "race": {
            "label": "PL1E.Race",
            "droppable": ["feature", "ability", "weapon"],
            "localDroppable": [],
            "stackable": ["weapon"]
        },
        "class": {
            "label": "PL1E.Class",
            "droppable": ["feature", "ability"],
            "localDroppable": [],
            "stackable": []
        },
        "ability": {
            "label": "PL1E.Ability",
            "droppable": [],
            "localDroppable": [],
            "stackable": []
        },
        "weapon": {
            "label": "PL1E.Weapon",
            "droppable": ["feature", "ability"],
            "localDroppable": ["module"],
            "stackable": ["module"]
        },
        "wearable": {
            "label": "PL1E.Wearable",
            "droppable": ["feature", "ability"],
            "localDroppable": ["module"],
            "stackable": ["module"]
        },
        "consumable": {
            "label": "PL1E.Consumable",
            "droppable": [],
            "localDroppable": [],
            "stackable": []
        },
        "common": {
            "label": "PL1E.Common",
            "droppable": [],
            "localDroppable": [],
            "stackable": []
        }
    }

    PL1E.itemBase = {
        "majorActionUsed": {
            "label": "PL1E.MajorActionUsed",
            "icon": "fa-star",
            "type": "bool",
            "path": "system.majorActionUsed"
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
            "type": "text",
            "show": false
        },
        "masters": {
            "label": "PL1E.Masters",
            "type": "select",
            "select": "masters",
            "show": true
        },
        "range": {
            "label": "PL1E.Range",
            "type": "number",
            "fallback": 0,
            "show": true
        },
        "uses": {
            "label": "PL1E.Uses",
            "type": "number",
            "show": true
        },
        "actionCost": {
            "label": "PL1E.ActionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "action",
            "invertSign": true,
            "combatOnly": true,
            "show": true
        },
        "reactionCost": {
            "label": "PL1E.ReactionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "reaction",
            "invertSign": true,
            "combatOnly": true,
            "show": true
        },
        "isMajorAction": {
            "label": "PL1E.MajorAction",
            "type": "bool",
            "document": "linkedItem",
            "dataGroup": "itemBase",
            "data": "majorActionUsed",
            "applyIfTrue": true,
            "combatOnly": true,
            "show": true
        },
        "activationMacro": {
            "label": "PL1E.ActivationMacro",
            "type": "text",
            "show": false
        },
        "preLaunchMacro": {
            "label": "PL1E.PreLaunchMacro",
            "type": "text",
            "show": false
        },
        "postLaunchMacro": {
            "label": "PL1E.PostLaunchMacro",
            "type": "text",
            "show": false
        },
        // Features
        "featureType": {
            "label": "PL1E.FeatureType",
            "type": "number",
            "select": "featureTypes",
            "show": true
        },
        "cost": {
            "label": "PL1E.Cost",
            "type": "number",
            "show": true
        },
        // Abilities
        "level": {
            "label": "PL1E.Level",
            "type": "number",
            "show": true
        },
        "healthCost": {
            "label": "PL1E.HealthCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "health",
            "invertSign": true,
            "show": true
        },
        "staminaCost": {
            "label": "PL1E.StaminaCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "stamina",
            "invertSign": true,
            "show": true
        },
        "manaCost": {
            "label": "PL1E.ManaCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "mana",
            "invertSign": true,
            "show": true
        },
        "usageCost": {
            "label": "PL1E.UsageCost",
            "type": "number",
            "document": "linkedItem",
            "dataGroup": "itemBase",
            "data": "removedUses",
            "invertSign": false,
            "show": true
        },
        "abilityLink": {
            "label": "PL1E.AbilityLink",
            "type": "select",
            "select": "abilityLinks",
            "show": true
        },
        "roll": {
            "label": "PL1E.Roll",
            "type": "select",
            "select": "abilitySkills",
            "show": true
        },
        "areaShape": {
            "label": "PL1E.AreaShape",
            "type": "select",
            "select": "areaShapes",
            "fallback": "circle",
            "show": true
        },
        "areaNumber": {
            "label": "PL1E.AreaNumber",
            "type": "number",
            "fallback": 1,
            "show": true
        },
        "circleRadius": {
            "label": "PL1E.CircleRadius",
            "type": "number",
            "fallback": 1,
            "show": true
        },
        "coneLength": {
            "label": "PL1E.ConeLength",
            "type": "number",
            "fallback": 1,
            "show": true
        },
        "coneAngle": {
            "label": "PL1E.ConeAngle",
            "type": "number",
            "fallback": 50,
            "show": true
        },
        "squareLength": {
            "label": "PL1E.SquareLength",
            "type": "number",
            "fallback": 1,
            "show": true
        },
        "rayLength": {
            "label": "PL1E.RayLength",
            "type": "number",
            "fallback": 1,
            "show": true
        },
        "oppositeRoll": {
            "label": "PL1E.OppositeRoll",
            "type": "select",
            "select": "abilityResistances",
            "fallback": "none",
            "show": true
        },
        // Weapons
        "hands": {
            "label": "PL1E.Hands",
            "type": "number",
            "show": true
        },
        // Wearables
        "slot": {
            "label": "PL1E.Slot",
            "type": "select",
            "select": "slots",
            "show": true
        },
        // Consumables
        "isReloadable": {
            "label": "PL1E.Reloadable",
            "type": "bool",
            "show": true
        },
        // Common Objects
        "commonType": {
            "label": "PL1E.CommonType",
            "type": "select",
            "select": "commonTypes",
            "show": true
        }
    }

    PL1E.abilitySkills = {
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

    PL1E.resolutionTypes = {
        "fixed": "PL1E.Fixed",
        "ifSuccess" : "PL1E.IfSuccess",
        "multipliedBySuccess": "PL1E.MultipliedBySuccess"
    }

    PL1E.linkOverrides = {
        "none": "PL1E.None",
        "reach": "PL1E.Reach",
        "range": "PL1E.Range"
    }

}