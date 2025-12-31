import {PL1E} from "../pl1e.mjs";

export function getConfigItems() {
    PL1E.itemTypes = {
        "race": {
            "label": "PL1E.Race",
            "droppable": ["feature", "ability", "weapon"],
            "localDroppable": [],
            "stackable": ["weapon"],
            "behaviors": ["regular"]
        },
        "culture": {
            "label": "PL1E.Culture",
            "droppable": ["feature", "ability"],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        },
        "class": {
            "label": "PL1E.Class",
            "droppable": ["feature", "ability", "mastery"],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        },
        "mastery": {
            "label": "PL1E.Mastery",
            "droppable": ["ability"],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular", "container", "key"]
        },
        "feature": {
            "label": "PL1E.Feature",
            "droppable": ["ability", "mastery"],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular", "container", "key"]
        },
        "ability": {
            "label": "PL1E.Ability",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        },
        "weapon": {
            "label": "PL1E.Weapon",
            "droppable": ["feature", "ability", "mastery", "module"],
            "localDroppable": ["module"],
            "stackable": ["module"],
            "behaviors": ["regular"]
        },
        "wearable": {
            "label": "PL1E.Wearable",
            "droppable": ["feature", "ability", "mastery"],
            "localDroppable": ["module"],
            "stackable": ["module"],
            "behaviors": ["regular"]
        },
        "consumable": {
            "label": "PL1E.Consumable",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        },
        "common": {
            "label": "PL1E.Common",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        },
        "module": {
            "label": "PL1E.Module",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        },
        "service": {
            "label": "PL1E.Service",
            "droppable": [],
            "localDroppable": [],
            "stackable": [],
            "behaviors": ["regular"]
        }
    }

    PL1E.itemCollections = {
        "race": "background",
        "culture": "background",
        "class": "background",
        "mastery": "background",
        "feature": "features",
        "ability": "abilities",
        "weapon": "weapons",
        "wearable": "wearables",
        "consumable": "consumables",
        "common": "commons",
        "module": "modules",
        "service": "services"
    }

    PL1E.itemBase = {
        "majorActionUsed": {
            "label": "PL1E.MajorActionUsed",
            "icon": "far fa-star",
            "type": "bool",
            "path": "system.majorActionUsed"
        },
        "removedUses": {
            "label": "PL1E.RemovedUses",
            "icon": "far fa-tally",
            "type": "number",
            "path": "system.removedUses"
        }
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
            "dataGroup": "general",
            "data": "action",
            "invertSign": true,
            "combatOnly": true,
            "inDescription": true
        },
        "reactionCost": {
            "label": "PL1E.ReactionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "general",
            "data": "reaction",
            "invertSign": true,
            "combatOnly": true,
            "inDescription": true
        },
        "quickActionCost": {
            "label": "PL1E.QuickActionCost",
            "type": "number",
            "document": "actor",
            "dataGroup": "general",
            "data": "quickAction",
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
        "customMacro": {
            "label": "PL1E.CustomMacro",
            "type": "bool",
            "inDescription": false
        },
        "meleeActivationMacro": {
            "label": "PL1E.MeleeActivationMacro",
            "type": "text",
            "inDescription": false
        },
        "meleePreLaunchMacro": {
            "label": "PL1E.MeleePreLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        "meleePostLaunchMacro": {
            "label": "PL1E.MeleePostLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        "rangeActivationMacro": {
            "label": "PL1E.RangeActivationMacro",
            "type": "text",
            "inDescription": false
        },
        "rangePreLaunchMacro": {
            "label": "PL1E.RangePreLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        "rangePostLaunchMacro": {
            "label": "PL1E.RangePostLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        "magicActivationMacro": {
            "label": "PL1E.MagicActivationMacro",
            "type": "text",
            "inDescription": false
        },
        "magicPreLaunchMacro": {
            "label": "PL1E.MagicPreLaunchMacro",
            "type": "text",
            "inDescription": false
        },
        "magicPostLaunchMacro": {
            "label": "PL1E.MagicPostLaunchMacro",
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
        "launchParentActiveAspects": {
            "label": "PL1E.LaunchParentActiveAspects",
            "type": "bool",
            "inDescription": false
        },
        "weaponMode": {
            "label": "PL1E.LaunchMode",
            "type": "string",
            "inDescription": false
        },
        "useParentRange": {
            "label": "PL1E.UseParentRange",
            "type": "bool",
            "inDescription": false
        },
        "useParentRoll": {
            "label": "PL1E.UseParentRoll",
            "type": "bool",
            "inDescription": false
        },
        "useParentOppositeRoll": {
            "label": "PL1E.UseParentOppositeRoll",
            "type": "bool",
            "inDescription": false
        },
        "useParentActivation": {
            "label": "PL1E.UseParentActivation",
            "type": "bool",
            "inDescription": false
        },
        "useParentPreLaunch": {
            "label": "PL1E.UseParentPreLaunch",
            "type": "bool",
            "inDescription": false
        },
        "useParentPostLaunch": {
            "label": "PL1E.UseParentPostLaunch",
            "type": "bool",
            "inDescription": false
        },
        "rollAdvantages": {
            "label": "PL1E.RollAdvantages",
            "type": "number",
            "inDescription": false
        },
        "oppositeRollAdvantages": {
            "label": "PL1E.OppositeRollAdvantages",
            "type": "number",
            "inDescription": false
        },
        "activation": {
            "label": "PL1E.Activation",
            "type": "select",
            "select": "activations",
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
        "healthGain": {
            "label": "PL1E.Health",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "health",
            "invertSign": false,
            "inDescription": true
        },
        "staminaGain": {
            "label": "PL1E.Stamina",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "stamina",
            "invertSign": false,
            "inDescription": true
        },
        "manaGain": {
            "label": "PL1E.Mana",
            "type": "number",
            "document": "actor",
            "dataGroup": "resources",
            "data": "mana",
            "invertSign": false,
            "inDescription": true
        },
        "hungerReduction": {
            "label": "PL1E.HungerReduction",
            "type": "number",
            "document": "actor",
            "dataGroup": "misc",
            "data": "hunger",
            "invertSign": false,
            "inDescription": true
        },
        "usageCost": {
            "label": "PL1E.UsageCost",
            "type": "number",
            "document": "item",
            "dataGroup": "itemBase",
            "data": "removedUses",
            "invertSign": false,
            "inDescription": true
        },
        "linkedUsageCost": {
            "label": "PL1E.LinkedUsageCost",
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
        // Commons
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
        },
        // Services
        "serviceType": {
            "label": "PL1E.ServiceType",
            "type": "select",
            "select": "serviceTypes",
            "inDescription": true
        },
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
        "occultism": "PL1E.Occultism",
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
        "none": "PL1E.None.M",
        "target": "PL1E.Target",
        "circle": "PL1E.Circle",
        "cone": "PL1E.Cone",
        "ray": "PL1E.Ray"
    }

    PL1E.resolutionTypes = {
        "fixed": "PL1E.Fixed",
        "ifSuccess" : "PL1E.IfSuccess",
        "multipliedBySuccess": "PL1E.MultipliedBySuccess"
    }

    PL1E.selfTargets = {
        "none": "PL1E.None.M",
        "add": "PL1E.Add",
        "remove": "PL1E.Remove"
    }

    PL1E.linkOverrides = {
        "none": "PL1E.None.M",
        "reach": "PL1E.Reach",
        "range": "PL1E.Range"
    }

    PL1E.featureTypes = {
        "historical": "PL1E.Historical",
        "mental": "PL1E.Mental",
        "personality": "PL1E.Personality",
        "physical": "PL1E.Physical",
        "social": "PL1E.Social",
        "special": "PL1E.Special"
    }

    PL1E.effectTypes = {
        "passive": "PL1E.Passive",
        "temporary": "PL1E.Temporary",
        "inactive": "PL1E.Inactive"
    }

    PL1E.weaponUsages = {
        "melee": "PL1E.Melee",
        "ranged": "PL1E.Ranged",
        "magic": "PL1E.Magic"
    }
}