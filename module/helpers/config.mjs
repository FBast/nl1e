export const PL1E = {};

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

PL1E.resources = {
    "health": {
        "label": "PL1E.Health",
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "constitution",
                "will"
            ]
        }
    },
    "stamina": {
        "label": "PL1E.Stamina",
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "strength",
                "constitution"
            ]
        }
    },
    "mana": {
        "label": "PL1E.Mana",
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "intellect",
                "will"
            ]
        }
    }
}

PL1E.characteristics = {
    "strength": {
        "label": "PL1E.Strength",
        "weights": {
            "resources": ["stamina"],
            "skills": ["parry", "vigor", "handling", "throwing", "athletics"]
        }
    },
    "agility": {
        "label": "PL1E.Agility",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
        }
    },
    "perception": {
        "label": "PL1E.Perception",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
        }
    },
    "constitution": {
        "label": "PL1E.Constitution",
        "weights": {
            "resources": ["health", "stamina"],
            "skills": ["parry", "vigor", "athletics"]
        }
    },
    "intellect": {
        "label": "PL1E.Intellect",
        "weights": {
            "resources": ["mana"],
            "skills": ["resilience", "diplomacy", "bluff", "erudition", "secularMagic"]
        }
    },
    "cunning": {
        "label": "PL1E.Cunning",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "secularMagic"]
        }
    },
    "wisdom": {
        "label": "PL1E.Wisdom",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "divineMagic"]
        }
    },
    "will": {
        "label": "PL1E.Will",
        "weights": {
            "resources": ["health", "mana"],
            "skills": ["resilience", "performance", "handling", "divineMagic"]
        }
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

PL1E.reductions = {
    "slashing": "PL1E.Slashing",
    "crushing": "PL1E.Crushing",
    "piercing": "PL1E.Piercing",
    "burn": "PL1E.Burn",
    "cold": "PL1E.Cold",
    "acid": "PL1E.Acid",
    "shock": "PL1E.Shock",
}

PL1E.misc = {
    "size": "PL1E.Size",
    "speed": "PL1E.Speed",
    "movementPenalty": "PL1E.MovementPenalty",
    "parry": "PL1E.Parry",
    "dodge": "PL1E.Dodge",
    "slashingReduction": "PL1E.SlashingReduction",
    "crushingReduction": "PL1E.CrushingReduction",
    "piercingReduction": "PL1E.PiercingReduction",
    "burnReduction": "PL1E.BurnReduction",
    "coldReduction": "PL1E.ColdReduction",
    "shockReduction": "PL1E.ShockReduction",
    "acidReduction": "PL1E.AcidReduction"
}

PL1E.sizes = {
    "small": "PL1E.Small",
    "medium": "PL1E.Medium",
    "large": "PL1E.Large",
    "huge": "PL1E.Huge",
    "gargantuan": "PL1E.Gargantuan"
};

PL1E.sizeMultipliers = {
    "small": "0.5",
    "medium": "1",
    "large": "2",
    "huge": "3",
    "gargantuan": "4"
};

PL1E.sizeTokens = {
    "small": "1",
    "medium": "1",
    "large": "2",
    "huge": "3",
    "gargantuan": "4"
};

PL1E.featureTypes = {
    "race": "PL1E.Race",
    "class": "PL1E.Class",
    "mastery": "PL1E.Mastery"
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
    "novice": "PL1E.Novice",
    "apprentice": "PL1E.Apprentice",
    "adept": "PL1E.Adept",
    "expert": "PL1E.Expert",
    "master": "PL1E.Master",
    "grandMaster": "PL1E.GrandMaster"
}

PL1E.experienceTemplatesValues = {
    "novice": 10,
    "apprentice": 20,
    "adept": 30,
    "expert": 40,
    "master": 50,
    "grandMaster": 60
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

PL1E.reductionsPath = {
    "slashing": "misc.slashingReduction",
    "crushing": "misc.crushingReduction",
    "piercing": "misc.piercingReduction",
    "burn": "misc.burnReduction",
    "cold": "misc.coldReduction",
    "acid": "misc.acidReduction",
    "shock": "misc.shockReduction",
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

PL1E.attributeLinks = {
    "feature": {
        "passive": "PL1E.Passive"
    },
    "ability": {
        "passive": "PL1E.Passive",
        "active": "PL1E.Active"
    },
    "weapon": {
        "passive": "PL1E.Passive",
        "child": "PL1E.Child"
    },
    "wearable": {
        "passive": "PL1E.Passive",
        "child": "PL1E.Child"
    },
    "consumable": {
        "active": "PL1E.Active"
    }
}

PL1E.attributeGroups = {
    "feature": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    },
    "ability": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set",
        "transfer": "PL1E.Transfer",
        "effect": "PL1E.Effect"
    },
    "weapon": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set",
        "transfer": "PL1E.Transfer"
    },
    "wearable": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    },
    "consumable": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    }
}

PL1E.attributeGroupsValues = {
    "increase": {
        "value": 0,
        "label": "PL1E.Increase",
        "targets": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        },
        "target": "characteristics",
        "subTarget": "strength",
        "function": "increase"
    },
    "decrease": {
        "value": 0,
        "label": "PL1E.Decrease",
        "reduction": "none",
        "targets": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        },
        "target": "characteristics",
        "subTarget": "strength",
        "function": "decrease"
    },
    "override": {
        "value": 0,
        "label": "PL1E.Override",
        "targets": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        },
        "target": "characteristics",
        "subTarget": "strength",
        "function": "override"
    },
    "transfer": {
        "value": 0,
        "label": "PL1E.Transfer",
        "reduction": "none",
        "targets": {
            "resources": "PL1E.Resources",
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        },
        "target": "resources",
        "subTarget": "health",
        "function": "transfer"
    },
    "effect": {
        "value": 0,
        "label": "PL1E.Effect",
        "targets": {
            "characteristics": "PL1E.Characteristics",
            "misc": "PL1E.Misc",
        },
        "target": "characteristics",
        "subTarget": "strength",
        "function": "effect"
    }
}

PL1E.attributeSubTargets = {
    "health": {
        "label": "PL1E.Health",
        "icon": "fa-heart",
        "type": "number",
        "path": "resources.health.value"
    },
    "stamina": {
        "label": "PL1E.Stamina",
        "icon": "fa-wave-pulse",
        "type": "number",
        "path": "resources.stamina.value"
    },
    "mana": {
        "label": "PL1E.Mana",
        "icon": "fa-sparkles",
        "type": "number",
        "path": "resources.mana.value"
    },
    "strength": {
        "label": "PL1E.Strength",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.strength.mods"
    },
    "agility": {
        "label": "PL1E.Agility",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.agility.mods"
    },
    "perception": {
        "label": "PL1E.Perception",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.perception.mods"
    },
    "constitution": {
        "label": "PL1E.Constitution",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.constitution.mods"
    },
    "intellect": {
        "label": "PL1E.Intellect",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.intellect.mods"
    },
    "cunning": {
        "label": "PL1E.Cunning",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.cunning.mods"
    },
    "wisdom": {
        "label": "PL1E.Wisdom",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.wisdom.mods"
    },
    "will": {
        "label": "PL1E.Will",
        "icon": "fa-dumbbell",
        "type": "number",
        "path": "characteristics.will.mods"
    },
    "size": {
        "label": "PL1E.Size",
        "icon": "fa-arrow-up-big-small",
        "type": "select",
        "path": "misc.size",
        "select": "sizes"
    },
    "speed": {
        "label": "PL1E.Speed",
        "icon": "fa-person-running",
        "type": "number",
        "path": "misc.speed"
    },
    "movementPenalty": {
        "label": "PL1E.MovementPenalty",
        "icon": "fa-weight-hanging",
        "type": "number",
        "path": "misc.movementPenalty"
    },
    "parry": {
        "label": "PL1E.Parry",
        "icon": "fa-shield",
        "type": "number",
        "path": "misc.parry"
    },
    "dodge": {
        "label": "PL1E.Dodge",
        "icon": "fa-eye",
        "type": "number",
        "path": "misc.dodge"
    },
    "slashingReduction": {
        "label": "PL1E.SlashingReduction",
        "icon": "fa-axe-battle",
        "type": "number",
        "path": "misc.slashingReduction"
    },
    "crushingReduction": {
        "label": "PL1E.CrushingReduction",
        "icon": "fa-hammer-war",
        "type": "number",
        "path": "misc.crushingReduction"
    },
    "piercingReduction": {
        "label": "PL1E.PiercingReduction",
        "icon": "fa-dagger",
        "type": "number",
        "path": "misc.piercingReduction"
    },
    "burnReduction": {
        "label": "PL1E.BurnReduction",
        "icon": "fa-fire",
        "type": "number",
        "path": "misc.burnReduction"
    },
    "coldReduction": {
        "label": "PL1E.ColdReduction",
        "icon": "fa-snowflake",
        "type": "number",
        "path": "misc.coldReduction"
    },
    "shockReduction": {
        "label": "PL1E.ShockReduction",
        "icon": "fa-bolt",
        "type": "number",
        "path": "misc.shockReduction"
    },
    "acidReduction": {
        "label": "PL1E.AcidReduction",
        "icon": "fa-droplet",
        "type": "number",
        "path": "misc.acidReduction"
    }
}