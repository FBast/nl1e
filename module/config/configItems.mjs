import {PL1E} from "./config.mjs";

export function getConfigItems() {
    PL1E.itemTypes = {
        "feature": {
            "label": "PL1E.Feature",
            "droppable": ["ability"],
            "localDroppable": [],
            "stackable": [],
            "unlock": [],
            "locked": false
        },
        "race": {
            "label": "PL1E.Race",
            "droppable": ["feature", "ability", "weapon"],
            "localDroppable": [],
            "stackable": ["weapon"],
            "unlock": [],
            "locked": false
        },
        "class": {
            "label": "PL1E.Class",
            "droppable": ["feature", "ability", "mastery"],
            "localDroppable": [],
            "stackable": [],
            "unlock": ["mastery"],
            "locked": false
        },
        "mastery": {
            "label": "PL1E.Mastery",
            "droppable": ["ability"],
            "localDroppable": [],
            "stackable": [],
            "unlock": [],
            "locked": true
        },
        "ability": {
            "label": "PL1E.Ability",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "unlock": [],
            "locked": false
        },
        "weapon": {
            "label": "PL1E.Weapon",
            "droppable": ["feature", "ability", "mastery", "module"],
            "localDroppable": ["module"],
            "stackable": ["module"],
            "unlock": [],
            "locked": false
        },
        "wearable": {
            "label": "PL1E.Wearable",
            "droppable": ["feature", "ability", "mastery"],
            "localDroppable": ["module"],
            "stackable": ["module"],
            "unlock": [],
            "locked": false
        },
        "consumable": {
            "label": "PL1E.Consumable",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "unlock": [],
            "locked": false
        },
        "common": {
            "label": "PL1E.Common",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "unlock": [],
            "locked": false
        },
        "module": {
            "label": "PL1E.Module",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "unlock": [],
            "locked": false
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
            "inDescription": false
        },
        "range": {
            "label": "PL1E.Range",
            "type": "number",
            "fallback": 0,
            "inDescription": true
        },
        "uses": {
            "label": "PL1E.Uses",
            "type": "number",
            "inDescription": true
        },
        "actionCost": {
            "label": "PL1E.ActionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "action",
            "invertSign": true,
            "combatOnly": true,
            "inDescription": true
        },
        "reactionCost": {
            "label": "PL1E.ReactionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "reaction",
            "invertSign": true,
            "combatOnly": true,
            "inDescription": true
        },
        "isMajorAction": {
            "label": "PL1E.MajorAction",
            "type": "bool",
            "document": "linkedItem",
            "dataGroup": "itemBase",
            "data": "majorActionUsed",
            "applyIfTrue": true,
            "combatOnly": true,
            "inDescription": true
        },
        "isDangerous": {
            "label": "PL1E.IsDangerous",
            "type": "bool",
            "inDescription": true
        },
        "useFocus": {
            "label": "PL1E.UseFocus",
            "type": "bool",
            "inDescription": true
        },
        "activationMacro": {
            "label": "PL1E.ActivationMacro",
            "type": "text",
            "inDescription": false
        },
        "preLaunchMacro": {
            "label": "PL1E.PreLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        "postLaunchMacro": {
            "label": "PL1E.PostLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        // Features
        "featureType": {
            "label": "PL1E.FeatureType",
            "type": "number",
            "select": "featureTypes",
            "inDescription": true
        },
        "cost": {
            "label": "PL1E.Cost",
            "type": "number",
            "inDescription": true
        },
        // Abilities
        "level": {
            "label": "PL1E.Level",
            "type": "number",
            "inDescription": true
        },
        "healthCost": {
            "label": "PL1E.HealthCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "health",
            "invertSign": true,
            "inDescription": true
        },
        "staminaCost": {
            "label": "PL1E.StaminaCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "stamina",
            "invertSign": true,
            "inDescription": true
        },
        "manaCost": {
            "label": "PL1E.ManaCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "mana",
            "invertSign": true,
            "inDescription": true
        },
        "usageCost": {
            "label": "PL1E.UsageCost",
            "type": "number",
            "document": "linkedItem",
            "dataGroup": "itemBase",
            "data": "removedUses",
            "invertSign": false,
            "inDescription": true
        },
        "abilityLink": {
            "label": "PL1E.AbilityLink",
            "type": "select",
            "select": "abilityLinks",
            "inDescription": true
        },
        "roll": {
            "label": "PL1E.Roll",
            "type": "select",
            "select": "abilitySkills",
            "inDescription": true
        },
        "areaShape": {
            "label": "PL1E.AreaShape",
            "type": "select",
            "select": "areaShapes",
            "fallback": "circle",
            "inDescription": true
        },
        "areaNumber": {
            "label": "PL1E.AreaNumber",
            "type": "number",
            "fallback": 1,
            "inDescription": true
        },
        "circleRadius": {
            "label": "PL1E.CircleRadius",
            "type": "number",
            "fallback": 1,
            "inDescription": true
        },
        "coneLength": {
            "label": "PL1E.ConeLength",
            "type": "number",
            "fallback": 1,
            "inDescription": true
        },
        "coneAngle": {
            "label": "PL1E.ConeAngle",
            "type": "number",
            "fallback": 50,
            "inDescription": true
        },
        "squareLength": {
            "label": "PL1E.SquareLength",
            "type": "number",
            "fallback": 1,
            "inDescription": true
        },
        "rayLength": {
            "label": "PL1E.RayLength",
            "type": "number",
            "fallback": 1,
            "inDescription": true
        },
        "oppositeRoll": {
            "label": "PL1E.OppositeRoll",
            "type": "select",
            "select": "abilityResistances",
            "fallback": "none",
            "inDescription": true
        },
        // Weapons
        "hands": {
            "label": "PL1E.Hands",
            "type": "number",
            "inDescription": true
        },
        // Wearables
        "slot": {
            "label": "PL1E.Slot",
            "type": "select",
            "select": "slots",
            "inDescription": true
        },
        // Consumables
        "isReloadable": {
            "label": "PL1E.Reloadable",
            "type": "bool",
            "inDescription": true
        },
        // Common Objects
        "commonType": {
            "label": "PL1E.CommonType",
            "type": "select",
            "select": "commonTypes",
            "inDescription": true
        },
        // Modules
        "moduleTypes": {
            "label": "PL1E.ModuleTypes",
            "type": "select",
            "select": "moduleTypes",
            "inDescription": true
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