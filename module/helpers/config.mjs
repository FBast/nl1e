export const PL1E = {};

//region Stats

PL1E.resources = {
    "health": {
        "label": "PL1E.Health",
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "constitution",
                "will"
            ]
        },
        "icon": "fa-heart",
        "type": "number",
        "path": "system.resources.health.value"
    },
    "stamina": {
        "label": "PL1E.Stamina",
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "strength",
                "constitution"
            ]
        },
        "icon": "fa-wave-pulse",
        "type": "number",
        "path": "system.resources.stamina.value"
    },
    "mana": {
        "label": "PL1E.Mana",
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "intellect",
                "will"
            ]
        },
        "icon": "fa-sparkles",
        "type": "number",
        "path": "system.resources.mana.value"
    }
}

PL1E.characteristics = {
    "strength": {
        "label": "PL1E.Strength",
        "weights": {
            "resources": ["stamina"],
            "skills": ["parry", "vigor", "handling", "throwing", "athletics"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.strength.mods"
    },
    "agility": {
        "label": "PL1E.Agility",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.agility.mods"
    },
    "perception": {
        "label": "PL1E.Perception",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.perception.mods"
    },
    "constitution": {
        "label": "PL1E.Constitution",
        "weights": {
            "resources": ["health", "stamina"],
            "skills": ["parry", "vigor", "athletics"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.constitution.mods"
    },
    "intellect": {
        "label": "PL1E.Intellect",
        "weights": {
            "resources": ["mana"],
            "skills": ["resilience", "diplomacy", "bluff", "erudition", "secularMagic"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.intellect.mods"
    },
    "cunning": {
        "label": "PL1E.Cunning",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "secularMagic"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.cunning.mods"
    },
    "wisdom": {
        "label": "PL1E.Wisdom",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "divineMagic"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.wisdom.mods"
    },
    "will": {
        "label": "PL1E.Will",
        "weights": {
            "resources": ["health", "mana"],
            "skills": ["resilience", "performance", "handling", "divineMagic"]
        },
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "system.characteristics.will.mods"
    }
}

PL1E.skills = {
    "parry": {
        "label": "PL1E.Parry",
        "fixedRank": true,
        "divider": 3,
        "weights": {
            "characteristics": ["strength", "constitution"],
            "misc": ["parryBonuses"]
        }
    },
    "dodge": {
        "label": "PL1E.Dodge",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["agility", "perception"],
            "misc": ["dodgeBonuses", "movementPenalty"]
        }
    },
    "vigor": {
        "label": "PL1E.Vigor",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["strength", "constitution"]
        }
    },
    "reflex": {
        "label": "PL1E.Reflex",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["agility", "perception"],
            "misc": ["movementPenalty"]
        }
    },
    "resilience": {
        "label": "PL1E.Resilience",
        "fixedRank": true,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "will"]
        }
    },
    "intuition": {
        "label": "PL1E.Intuition",
        "fixedRank": true,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "handling": {
        "label": "PL1E.Handling",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "agility"]
        }
    },
    "throwing": {
        "label": "PL1E.Throwing",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "perception"]
        }
    },
    "athletics": {
        "label": "PL1E.Athletics",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "constitution"],
            "misc": ["movementPenalty"]
        }
    },
    "acrobatics": {
        "label": "PL1E.Acrobatics",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "misc": ["movementPenalty"]
        }
    },
    "accuracy": {
        "label": "PL1E.Accuracy",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "misc": ["movementPenalty"]
        }
    },
    "search": {
        "label": "PL1E.Search",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "vigilance": {
        "label": "PL1E.Vigilance",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["perception", "wisdom"]
        }
    },
    "discretion": {
        "label": "PL1E.Discretion",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "misc": ["movementPenalty"]
        }
    },
    "performance": {
        "label": "PL1E.Performance",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["wisdom", "will"]
        }
    },
    "diplomacy": {
        "label": "PL1E.Diplomacy",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "wisdom"]
        }
    },
    "intimidation": {
        "label": "PL1E.Intimidation",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "bluff": {
        "label": "PL1E.Bluff",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "cunning"]
        }
    },
    "craft": {
        "label": "PL1E.Craft",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "cunning"]
        }
    },
    "erudition": {
        "label": "PL1E.Erudition",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "cunning"]
        }
    },
    "divineMagic": {
        "label": "PL1E.DivineMagic",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": true,
        "weights": {
            "characteristics": ["wisdom", "will"],
            "misc": ["movementPenalty"]
        }
    },
    "secularMagic": {
        "label": "PL1E.SecularMagic",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": true,
        "weights": {
            "characteristics": ["intellect", "cunning"],
            "misc": ["movementPenalty"]
        }
    }
}

PL1E.misc = {
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
        "type": "number",
        "path": "system.misc.speed"
    },
    "initiative": {
        "label": "PL1E.Initiative",
        "icon": "fa-person-running",
        "type": "number",
        "path": "system.misc.initiative"
    },
    "movementPenalty": {
        "label": "PL1E.MovementPenalty",
        "icon": "fa-weight-hanging",
        "type": "number",
        "path": "system.misc.movementPenalty"
    },
    "parryBonuses": {
        "label": "PL1E.ParryBonuses",
        "icon": "fa-shield",
        "type": "number",
        "path": "system.misc.parryBonuses"
    },
    "dodgeBonuses": {
        "label": "PL1E.DodgeBonuses",
        "icon": "fa-eye",
        "type": "number",
        "path": "system.misc.dodgeBonuses"
    },
    "nightVision": {
        "label": "PL1E.NightVision",
        "icon": "fa-eye",
        "type": "number",
        "path": "system.misc.nightVision"
    }
}

PL1E.reductions = {
    "slashing": {
        "label": "PL1E.Slashing",
        "icon": "fa-axe-battle",
        "type": "number",
        "path": "system.reductions.slashing"
    },
    "crushing": {
        "label": "PL1E.Crushing",
        "icon": "fa-hammer-war",
        "type": "number",
        "path": "system.reductions.crushing"
    },
    "piercing": {
        "label": "PL1E.Piercing",
        "icon": "fa-dagger",
        "type": "number",
        "path": "system.s.piercing"
    },
    "burn": {
        "label": "PL1E.Burn",
        "icon": "fa-fire",
        "type": "number",
        "path": "system.reductions.burn"
    },
    "cold": {
        "label": "PL1E.Cold",
        "icon": "fa-snowflake",
        "type": "number",
        "path": "system.reductions.cold"
    },
    "acid": {
        "label": "PL1E.Acid",
        "icon": "fa-droplet",
        "type": "number",
        "path": "system.reductions.acid"
    },
    "shock": {
        "label": "PL1E.Shock",
        "icon": "fa-bolt",
        "type": "number",
        "path": "system.reductions.shock"
    },
}

//endregion

//region Templates

PL1E.NPCTemplates = {
    "balanced": {
        "label": "PL1E.Balanced",
        "characteristics": {
            "strength": 3,
            "agility": 3,
            "perception": 3,
            "constitution": 3,
            "intellect": 3,
            "cunning": 3,
            "wisdom": 3,
            "will": 3
        },
        "skills": ["handling", "throwing", "accuracy", "divineMagic", "secularMagic", "athletics", "acrobatics", "vigilance"]
    },
    "soldier": {
        "label": "PL1E.Soldier",
        "characteristics": {
            "strength": 4,
            "agility": 4,
            "perception": 4,
            "constitution": 4,
            "intellect": 2,
            "cunning": 2,
            "wisdom": 2,
            "will": 2
        },
        "skills": ["handling", "throwing", "accuracy", "athletics", "vigilance"]
    },
    "brute": {
        "label": "PL1E.Brute",
        "characteristics": {
            "strength": 5,
            "agility": 3,
            "perception": 2,
            "constitution": 5,
            "intellect": 2,
            "cunning": 2,
            "wisdom": 2,
            "will": 3
        },
        "skills": ["handling", "athletics", "intimidation", "vigilance", "search"]
    },
    "killer": {
        "label": "PL1E.Killer",
        "characteristics": {
            "strength": 2,
            "agility": 5,
            "perception": 5,
            "constitution": 3,
            "intellect": 2,
            "cunning": 3,
            "wisdom": 2,
            "will": 2
        },
        "skills": ["accuracy", "acrobatics", "discretion", "bluff", "vigilance"]
    },
    "hunter": {
        "label": "PL1E.Hunter",
        "characteristics": {
            "strength": 5,
            "agility": 3,
            "perception": 5,
            "constitution": 3,
            "intellect": 2,
            "cunning": 2,
            "wisdom": 2,
            "will": 2
        },
        "skills": ["throwing", "acrobatics", "vigilance", "search", "craft"]
    },
    "wizard": {
        "label": "PL1E.Wizard",
        "characteristics": {
            "strength": 2,
            "agility": 2,
            "perception": 2,
            "constitution": 2,
            "intellect": 5,
            "cunning": 5,
            "wisdom": 3,
            "will": 3
        },
        "skills": ["secularMagic", "erudition", "diplomacy", "craft", "search"]
    },
    "priest": {
        "label":  "PL1E.Priest",
        "characteristics": {
            "strength": 2,
            "agility": 2,
            "perception": 2,
            "constitution": 2,
            "intellect": 3,
            "cunning": 3,
            "wisdom": 5,
            "will": 5
        },
        "skills": ["divineMagic", "performance", "diplomacy", "search", "vigilance"]
    },
    "mystic": {
        "label": "PL1E.Mystic",
        "characteristics": {
            "strength": 2,
            "agility": 2,
            "perception": 2,
            "constitution": 2,
            "intellect": 4,
            "cunning": 4,
            "wisdom": 4,
            "will": 4
        },
        "skills": ["secularMagic", "divineMagic", "erudition", "craft", "diplomacy", "performance"]
    },
    "battleMage": {
        "label": "PL1E.BattleMage",
        "characteristics": {
            "strength": 4,
            "agility": 4,
            "perception": 2,
            "constitution": 2,
            "intellect": 4,
            "cunning": 4,
            "wisdom": 2,
            "will": 2
        },
        "skills": ["handling", "secularMagic", "diplomacy", "vigilance", "search"]
    },
    "crusader": {
        "label": "PL1E.Crusader",
        "characteristics": {
            "strength": 4,
            "agility": 4,
            "perception": 2,
            "constitution": 2,
            "intellect": 2,
            "cunning": 2,
            "wisdom": 4,
            "will": 4
        },
        "skills": ["handling", "divineMagic", "intimidation", "search", "performance"]
    },
    "assassin": {
        "label": "PL1E.Assassin",
        "characteristics": {
            "strength": 2,
            "agility": 4,
            "perception": 4,
            "constitution": 2,
            "intellect": 4,
            "cunning": 4,
            "wisdom": 2,
            "will": 2
        },
        "skills": ["accuracy", "secularMagic", "discretion", "bluff", "vigilance"]
    },
    "monk": {
        "label": "PL1E.Monk",
        "characteristics": {
            "strength": 2,
            "agility": 4,
            "perception": 4,
            "constitution": 2,
            "intellect": 2,
            "cunning": 2,
            "wisdom": 4,
            "will": 4
        },
        "skills": ["accuracy", "divineMagic", "acrobatics", "performance", "vigilance"]
    }
}

PL1E.experienceTemplates = {
    "novice": {
        "label": "PL1E.Novice",
        "value": 10
    },
    "apprentice": {
        "label": "PL1E.Apprentice",
        "value": 20
    },
    "adept": {
        "label": "PL1E.Adept",
        "value": 30
    },
    "expert": {
        "label": "PL1E.Expert",
        "value": 40
    },
    "master": {
        "label": "PL1E.Master",
        "value": 50,
    },
    "grandMaster": {
        "label": "PL1E.GrandMaster",
        "value": 60
    }
}

//endregion

//region Attributes

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
        "icon": "far fa-wave-pulse",
        "category": "fixed",
        "type": "number",
        "dataGroup": "resources",
        "data": "health",
        "name": "decrease"
    },
    "staminaCost": {
        "label": "PL1E.StaminaCost",
        "icon": "far fa-wave-pulse",
        "category": "fixed",
        "type": "number",
        "dataGroup": "resources",
        "data": "stamina",
        "name": "decrease"
    },
    "manaCost": {
        "label": "PL1E.ManaCost",
        "icon": "far fa-sparkles",
        "category": "fixed",
        "type": "number",
        "dataGroup": "resources",
        "data": "mana",
        "name": "decrease"
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
    },
    // Optionals
    "increase": {
        "label": "PL1E.Increase",
        "dataGroups": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        }
    },
    "decrease": {
        "label": "PL1E.Decrease",
        "dataGroups": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        }
    },
    "override": {
        "label": "PL1E.Override",
        "dataGroups": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        }
    },
    "transfer": {
        "label": "PL1E.Transfer",
        "dataGroups": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        }
    },
    "effect": {
        "label": "PL1E.Effect",
        "dataGroups": {
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        }
    }
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

PL1E.dynamicAttributes = {
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

PL1E.damageType = {
    "raw": "PL1E.Raw",
    "slashing": "PL1E.Slashing",
    "crushing": "PL1E.Crushing",
    "piercing": "PL1E.Piercing",
    "burn": "PL1E.Burn",
    "cold": "PL1E.Cold",
    "acid": "PL1E.Acid",
    "shock": "PL1E.Shock",
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

//endregion

//region Others

PL1E.defaultIcons = {
    "character": "systems/pl1e/assets/icons/elf-helmet.svg",
    "npc": "systems/pl1e/assets/icons/goblin-head.svg",
    "merchant": "systems/pl1e/assets/icons/shop.svg",
    "feature": "systems/pl1e/assets/icons/skills.svg",
    "ability": "systems/pl1e/assets/icons/power-lightning.svg",
    "weapon": "systems/pl1e/assets/icons/combat.svg",
    "wearable": "systems/pl1e/assets/icons/armor-vest.svg",
    "consumable": "systems/pl1e/assets/icons/round-potion.svg",
    "common": "systems/pl1e/assets/icons/key.svg",
}

PL1E.defaultNames = {
    "character": "PL1E.NewCharacter",
    "npc": "PL1E.NewNPC",
    "merchant": "PL1E.NewMerchant",
    "feature": "PL1E.NewFeature",
    "ability": "PL1E.NewAbility",
    "weapon": "PL1E.NewWeapon",
    "wearable": "PL1E.NewWearable",
    "consumable": "PL1E.NewConsumable",
    "common": "PL1E.NewCommon",
}

PL1E.featureTypes = {
    "race": "PL1E.Race",
    "class": "PL1E.Class",
    "mastery": "PL1E.Mastery"
}

PL1E.sizes = {
    "small": {
        "label": "PL1E.Small",
        "multiplier": "0.5",
        "token": "1"
    },
    "medium": {
        "label": "PL1E.Medium",
        "multiplier": "1",
        "token": "1"
    },
    "large": {
        "label": "PL1E.Large",
        "multiplier": "2",
        "token": "2",
    },
    "huge": {
        "label": "PL1E.Huge",
        "multiplier": "3",
        "token": "3"
    },
    "gargantuan": {
        "label": "PL1E.Gargantuan",
        "multiplier": "4",
        "token": "4"
    }
}

PL1E.money = {
    "gold": "PL1E.Gold",
    "silver": "PL1E.Silver",
    "copper": "PL1E.Copper"
}

PL1E.masteries = {
    "none": "PL1E.None",
    "crossbows": "PL1E.Crossbows",
    "bows": "PL1E.Bows",
    "poleArms": "PL1E.PoleArms",
    "shields": "PL1E.Shields",
    "shortAxes": "PL1E.ShortAxes",
    "longAxes": "PL1E.LongAxes",
    "shortBlades": "PL1E.ShortBlades",
    "mediumBlades": "PL1E.MediumBlades",
    "longBlades": "PL1E.LongBlades",
    "shortHammers": "PL1E.ShortHammers",
    "longHammers": "PL1E.LongHammers",
    "arcana": "PL1E.Arcana",
    "aramancia": "PL1E.Aramancia",
    "biomancia": "PL1E.Biomancia",
    "diastamancia": "PL1E.Diastamancia",
    "goetia": "PL1E.Goetia",
    "myalomancia": "PL1E.Myalomancia",
    "necromancia": "PL1E.Necromancia",
    "theurgy": "PL1E.Theurgy"
}

PL1E.slots = {
    "none": "PL1E.None",
    "clothes": "PL1E.Clothes",
    "armor": "PL1E.Armor",
    "ring": "PL1E.Ring",
    "amulet": "PL1E.Amulet"
}

PL1E.activations = {
    "passive": "PL1E.Passive",
    "reaction": "PL1E.Reaction",
    "free": "PL1E.Free",
    "action": "PL1E.Action",
    "round": "PL1E.Round",
    "special": "PL1E.Special"
}

//endregion