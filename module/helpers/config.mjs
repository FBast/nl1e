export const PL1E = {};

/**
 * Merged Objects
 */

PL1E.resources = {
    "health": {
        "label": "PL1E.Health",
        "min": 0,
        "max": 0,
        "temp": 0,
        "tempMax": 0,
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
        "min": 0,
        "max": 0,
        "temp": 0,
        "tempMax": 0,
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
        "min": 0,
        "max": 0,
        "temp": 0,
        "tempMax": 0,
        "multiplier" : 10,
        "weights": {
            "characteristics": [
                "intellect",
                "will"
            ]
        }
    }
};

PL1E.characteristics = {
    "strength": {
        "label": "PL1E.CharacteristicStr",
        "tooltip": "PL1E.TooltipStr",
        "weights": {
            "resources": ["stamina"],
            "skills": ["parry", "vigor", "handling", "throwing", "athletics"]
        }
    },
    "agility": {
        "label": "PL1E.CharacteristicAgi",
        "tooltip": "PL1E.TooltipAgi",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
        }
    },
    "perception": {
        "label": "PL1E.CharacteristicPer",
        "tooltip": "PL1E.TooltipPer",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
        }
    },
    "constitution": {
        "label": "PL1E.CharacteristicCon",
        "tooltip": "PL1E.TooltipCon",
        "weights": {
            "resources": ["health", "stamina"],
            "skills": ["parry", "vigor", "athletics"]
        }
    },
    "intellect": {
        "label": "PL1E.CharacteristicInt",
        "tooltip": "PL1E.TooltipInt",
        "weights": {
            "resources": ["mana"],
            "skills": ["resilience", "diplomacy", "bluff", "erudition", "secularMagic"]
        }
    },
    "cunning": {
        "label": "PL1E.CharacteristicCun",
        "tooltip": "PL1E.TooltipCun",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "secularMagic"]
        }
    },
    "wisdom": {
        "label": "PL1E.CharacteristicWis",
        "tooltip": "PL1E.TooltipWis",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "divineMagic"]
        }
    },
    "will": {
        "label": "PL1E.CharacteristicWil",
        "tooltip": "PL1E.TooltipWil",
        "weights": {
            "resources": ["health", "mana"],
            "skills": ["resilience", "performance", "handling", "divineMagic"]
        }
    }
};

PL1E.skills = {
    "parry": {
        "label": "PL1E.DefensePar",
        "fixedRank": true,
        "divider": 3,
        "weights": {
            "characteristics": ["strength", "constitution"],
            "attributes": ["parryBonuses"]
        }
    },
    "dodge": {
        "label": "PL1E.DefenseDod",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["dodgeBonuses", "movementPenalty"]
        }
    },
    "vigor": {
        "label": "PL1E.ResistanceVig",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["strength", "constitution"]
        }
    },
    "reflex": {
        "label": "PL1E.ResistanceRef",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "resilience": {
        "label": "PL1E.ResistanceRes",
        "fixedRank": true,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "will"]
        }
    },
    "intuition": {
        "label": "PL1E.ResistanceInt",
        "fixedRank": true,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "handling": {
        "label": "PL1E.SkillHan",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "agility"]
        }
    },
    "throwing": {
        "label": "PL1E.SkillThr",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "perception"]
        }
    },
    "athletics": {
        "label": "PL1E.SkillAth",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "constitution"],
            "attributes": ["movementPenalty"]
        }
    },
    "acrobatics": {
        "label": "PL1E.SkillAcr",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "accuracy": {
        "label": "PL1E.SkillAcc",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "search": {
        "label": "PL1E.SkillSea",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "vigilance": {
        "label": "PL1E.SkillVig",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["perception", "wisdom"]
        }
    },
    "discretion": {
        "label": "PL1E.SkillDis",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "performance": {
        "label": "PL1E.SkillPer",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["wisdom", "will"]
        }
    },
    "diplomacy": {
        "label": "PL1E.SkillDip",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "wisdom"]
        }
    },
    "intimidation": {
        "label": "PL1E.SkillInt",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "bluff": {
        "label": "PL1E.SkillBlu",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "cunning"]
        }
    },
    "craft": {
        "label": "PL1E.SkillCra",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "cunning"]
        }
    },
    "erudition": {
        "label": "PL1E.SkillEru",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "cunning"]
        }
    },
    "divineMagic": {
        "label": "PL1E.SkillDiv",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": true,
        "weights": {
            "characteristics": ["wisdom", "will"],
            "attributes": ["movementPenalty"]
        }
    },
    "secularMagic": {
        "label": "PL1E.SkillSec",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": true,
        "weights": {
            "characteristics": ["intellect", "cunning"],
            "attributes": ["movementPenalty"]
        }
    }
}

PL1E.attributes = {
    // General
    "rarity": {
        "type": "number",
        "label": "PL1E.Rarity"
    },
    "mastery": {
        "type": "select",
        "label": "PL1E.Mastery",
        "select": "masteries"
    },
    "level": {
        "type": "number",
        "label": "PL1E.Level"
    },
    "slot": {
        "type": "select",
        "label": "PL1E.Slot",
        "select": "slots"
    },
    "activation": {
        "type": "select",
        "label": "PL1E.Activation",
        "select": "activations"
    },
    "size": {
        "type": "select",
        "label": "PL1E.Size",
        "path": "attributes.size",
        "operator": "set",
        "select": "sizes"
    },
    "speed": {
        "type": "number",
        "label": "PL1E.Speed",
        "path": "attributes.speed",
        "operator": "set"
    },
    "uses": {
        "type": "number",
        "label": "PL1E.Uses"
    },
    "reloadable": {
        "type": "bool",
        "label": "PL1E.Reloadable"
    },
    // Modificators
    "movementPenalty": {
        "type": "number",
        "label": "PL1E.MovementPenalty",
        "path": "attributes.movementPenalties",
        "operator": "push"
    },
    "strengthMod": {
        "type": "number",
        "label": "PL1E.StrengthMod",
        "path": "characteristics.strength.mods",
        "operator": "push"
    },
    "agilityMod": {
        "type": "number",
        "label": "PL1E.AgilityMod",
        "path": "characteristics.agility.mods",
        "operator": "push"
    },
    "perceptionMod": {
        "type": "number",
        "label": "PL1E.PerceptionMod",
        "path": "characteristics.perception.mods",
        "operator": "push"
    },
    "constitutionMod": {
        "type": "number",
        "label": "PL1E.ConstitutionMod",
        "path": "characteristics.constitution.mods",
        "operator": "push"
    },
    "intellectMod": {
        "type": "number",
        "label": "PL1E.IntellectMod",
        "path": "characteristics.intellect.mods",
        "operator": "push"
    },
    "cunningMod": {
        "type": "number",
        "label": "PL1E.CunningMod",
        "path": "characteristics.cunning.mods",
        "operator": "push"
    },
    "wisdomMod": {
        "type": "number",
        "label": "PL1E.WisdomMod",
        "path": "characteristics.wisdom.mods",
        "operator": "push"
    },
    "willMod": {
        "type": "number",
        "label": "PL1E.WillMod",
        "path": "characteristics.will.mods",
        "operator": "push"
    },
    // Defense
    "parry": {
        "type": "number",
        "label": "PL1E.Parry"
    },
    "dodge": {
        "type": "number",
        "label": "PL1E.Dodge"
    },
    "slashingReduction": {
        "type": "number",
        "label": "PL1E.SlashingReduction",
        "path": "attributes.slashingReductions",
        "operator": "push"
    },
    "crushingReduction": {
        "type": "number",
        "label": "PL1E.CrushingReduction",
        "path": "attributes.crushingReductions",
        "operator": "push"
    },
    "piercingReduction": {
        "type": "number",
        "label": "PL1E.PiercingReduction",
        "path": "attributes.piercingReductions",
        "operator": "push"
    },
    "fireReduction": {
        "type": "number",
        "label": "PL1E.FireReduction",
        "path": "attributes.fireReductions",
        "operator": "push"
    },
    "coldReduction": {
        "type": "number",
        "label": "PL1E.ColdReduction",
        "path": "attributes.coldReductions",
        "operator": "push"
    },
    "acidReduction": {
        "type": "number",
        "label": "PL1E.AcidReduction",
        "path": "attributes.acidReductions",
        "operator": "push"
    },
    "shockReduction": {
        "type": "number",
        "label": "PL1E.ShockReduction",
        "path": "attributes.shockReductions",
        "operator": "push"
    },
    // Attack
    "contactAttackRange": {
        "type": "number",
        "label": "PL1E.ContactAttackRange"
    },
    "rangedAttackRange": {
        "type": "number",
        "label": "PL1E.RangedAttackRange"
    },
    "parryProjectiles": {
        "type": "bool",
        "label": "PL1E.ParryProjectiles"
    },
    "slashing": {
        "type": "number",
        "label": "PL1E.Slashing"
    },
    "crushing": {
        "type": "number",
        "label": "PL1E.Crushing"
    },
    "piercing": {
        "type": "number",
        "label": "PL1E.Piercing"
    },
    "hands": {
        "type": "number",
        "label": "PL1E.Hands"
    },
    "ammo": {
        "type": "number",
        "label": "PL1E.Ammo"
    },
    // Recovery
    "healthRecovery": {
        "type": "number",
        "label": "PL1E.HealthRecovery",
        "path": "resources.health.value",
        "operator": "add"
    },
    "staminaRecovery": {
        "type": "number",
        "label": "PL1E.StaminaRecovery",
        "path": "resources.stamina.value",
        "operator": "add"
    },
    "manaRecovery": {
        "type": "number",
        "label": "PL1E.ManaRecovery",
        "path": "resources.mana.value",
        "operator": "add"
    }
}

PL1E.currency = {
    "gold": {
        "label": "PL1E.Gold"
    },
    "silver": {
        "label": "PL1E.Silver"
    },
    "copper": {
        "label": "PL1E.Copper"
    }
}

/**
 * Not Merged Objects
 */

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

PL1E.sizes = {
    "small": "PL1E.SizeSmall",
    "medium": "PL1E.SizeMedium",
    "large": "PL1E.SizeLarge",
    "huge": "PL1E.SizeHuge",
    "gargantuan": "PL1E.SizeGargantuan"
};

PL1E.sizeMultiplier = {
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
    "none": "PL1E.None",
    "race": "PL1E.Race",
    "class": "PL1E.Class"
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

PL1E.NPCTemplates = {
    "balanced": "PL1E.Balanced",
    "soldier": "PL1E.Soldier",
    "brute": "PL1E.Brute",
    "killer": "PL1E.Killer",
    "hunter": "PL1E.Hunter",
    "mystic": "PL1E.Mystic",
    "wizard": "PL1E.Wizard",
    "priest": "PL1E.Priest",
    "battleMage": "PL1E.BattleMage",
    "crusader": "PL1E.Crusader",
    "assassin": "PL1E.Assassin",
    "monk": "PL1E.Monk"
}

PL1E.NPCTemplatesValues = {
    "balanced": {
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