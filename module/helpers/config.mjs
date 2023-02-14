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
        "label": "CHARA.Str",
        "tooltip": "TOOLTIP.Str",
        "weights": {
            "resources": ["stamina"],
            "skills": ["parry", "vigor", "handling", "throwing", "athletics"]
        }
    },
    "agility": {
        "label": "CHARA.Agi",
        "tooltip": "TOOLTIP.Agi",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
        }
    },
    "perception": {
        "label": "CHARA.Per",
        "tooltip": "TOOLTIP.Per",
        "weights": {
            "resources": [],
            "skills": ["dodge", "reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
        }
    },
    "constitution": {
        "label": "CHARA.Con",
        "tooltip": "TOOLTIP.Con",
        "weights": {
            "resources": ["health", "stamina"],
            "skills": ["parry", "vigor", "athletics"]
        }
    },
    "intellect": {
        "label": "CHARA.Int",
        "tooltip": "TOOLTIP.Int",
        "weights": {
            "resources": ["mana"],
            "skills": ["resilience", "diplomacy", "bluff", "erudition", "secularMagic"]
        }
    },
    "cunning": {
        "label": "CHARA.Cun",
        "tooltip": "TOOLTIP.Cun",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "secularMagic"]
        }
    },
    "wisdom": {
        "label": "CHARA.Wis",
        "tooltip": "TOOLTIP.Wis",
        "weights": {
            "resources": [],
            "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "divineMagic"]
        }
    },
    "will": {
        "label": "CHARA.Wil",
        "tooltip": "TOOLTIP.Wil",
        "weights": {
            "resources": ["health", "mana"],
            "skills": ["resilience", "performance", "handling", "divineMagic"]
        }
    }
};

PL1E.skills = {
    "parry": {
        "label": "DEFENSE.Par",
        "fixedRank": true,
        "divider": 3,
        "weights": {
            "characteristics": ["strength", "constitution"],
            "attributes": ["parryBonuses"]
        }
    },
    "dodge": {
        "label": "DEFENSE.Dod",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["dodgeBonuses", "movementPenalty"]
        }
    },
    "vigor": {
        "label": "DEFENSE.Vig",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["strength", "constitution"]
        }
    },
    "reflex": {
        "label": "DEFENSE.Ref",
        "fixedRank": true,
        "divider": 2,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "resilience": {
        "label": "DEFENSE.Res",
        "fixedRank": true,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "will"]
        }
    },
    "intuition": {
        "label": "DEFENSE.Int",
        "fixedRank": true,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "handling": {
        "label": "SKILL.Han",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "agility"]
        }
    },
    "throwing": {
        "label": "SKILL.Thr",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "perception"]
        }
    },
    "athletics": {
        "label": "SKILL.Ath",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["strength", "constitution"],
            "attributes": ["movementPenalty"]
        }
    },
    "acrobatics": {
        "label": "SKILL.Acr",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "accuracy": {
        "label": "SKILL.Acc",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "search": {
        "label": "SKILL.Sea",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "vigilance": {
        "label": "SKILL.Vig",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["perception", "wisdom"]
        }
    },
    "discretion": {
        "label": "SKILL.Dis",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "perception"],
            "attributes": ["movementPenalty"]
        }
    },
    "performance": {
        "label": "SKILL.Per",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["wisdom", "will"]
        }
    },
    "diplomacy": {
        "label": "SKILL.Dip",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "wisdom"]
        }
    },
    "intimidation": {
        "label": "SKILL.Int",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["cunning", "wisdom"]
        }
    },
    "bluff": {
        "label": "SKILL.Blu",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "cunning"]
        }
    },
    "craft": {
        "label": "SKILL.Cra",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["agility", "cunning"]
        }
    },
    "erudition": {
        "label": "SKILL.Eru",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": false,
        "weights": {
            "characteristics": ["intellect", "cunning"]
        }
    },
    "divineMagic": {
        "label": "SKILL.Div",
        "fixedRank": false,
        "divider": 2,
        "magicPenalty": true,
        "weights": {
            "characteristics": ["wisdom", "will"],
            "attributes": ["movementPenalty"]
        }
    },
    "secularMagic": {
        "label": "SKILL.Sec",
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
    // Header
    "level": {
        "type": "number",
        "label": "PL1E.Level",
        "hide": true
    },
    "cost": {
        "type": "number",
        "label": "PL1E.Level",
        "hide": true
    },
    "featureType": {
        "type": "number",
        "label": "PL1E.FeatureType",
        "select": "featureTypes",
        "hide": true
    },
    "mastery": {
        "type": "select",
        "label": "PL1E.Mastery",
        "select": "masteries",
        "hide": true
    },
    "slot": {
        "type": "select",
        "label": "PL1E.Slot",
        "select": "slots",
        "hide": true
    },
    // General
    "rarity": {
        "type": "number",
        "label": "PL1E.Rarity",
        "hide": false
    },
    "activation": {
        "type": "select",
        "label": "PL1E.Activation",
        "select": "activations",
        "hide": false
    },
    "size": {
        "type": "select",
        "label": "PL1E.Size",
        "path": "attributes.size",
        "operator": "set",
        "select": "sizes",
        "hide": false
    },
    "speed": {
        "type": "number",
        "label": "PL1E.Speed",
        "path": "attributes.speed",
        "operator": "set",
        "hide": false
    },
    "uses": {
        "type": "number",
        "label": "PL1E.Uses",
        "hide": false
    },
    "reloadable": {
        "type": "bool",
        "label": "PL1E.Reloadable",
        "hide": false
    },
    // Damages
    "contactAttackRange": {
        "type": "number",
        "label": "PL1E.ContactAttackRange",
        "hide": false
    },
    "rangedAttackRange": {
        "type": "number",
        "label": "PL1E.RangedAttackRange",
        "hide": false
    },
    "slashing": {
        "type": "number",
        "label": "PL1E.Slashing",
        "hide": false
    },
    "crushing": {
        "type": "number",
        "label": "PL1E.Crushing",
        "hide": false
    },
    "piercing": {
        "type": "number",
        "label": "PL1E.Piercing",
        "hide": false
    },
    "fire": {
        "type": "number",
        "label": "PL1E.Fire",
        "hide": false
    },
    "cold": {
        "type": "number",
        "label": "PL1E.Cold",
        "hide": false
    },
    "shock": {
        "type": "number",
        "label": "PL1E.Shock",
        "hide": false
    },
    "acid": {
        "type": "number",
        "label": "PL1E.Acid",
        "hide": false
    },
    // Modificators
    "movementPenalty": {
        "type": "number",
        "label": "PL1E.MovementPenalty",
        "path": "attributes.movementPenalties",
        "operator": "push",
        "hide": false
    },
    "strengthMod": {
        "type": "number",
        "label": "PL1E.StrengthMod",
        "path": "characteristics.strength.mods",
        "operator": "push",
        "hide": false
    },
    "agilityMod": {
        "type": "number",
        "label": "PL1E.AgilityMod",
        "path": "characteristics.agility.mods",
        "operator": "push",
        "hide": false
    },
    "perceptionMod": {
        "type": "number",
        "label": "PL1E.PerceptionMod",
        "path": "characteristics.perception.mods",
        "operator": "push",
        "hide": false
    },
    "constitutionMod": {
        "type": "number",
        "label": "PL1E.ConstitutionMod",
        "path": "characteristics.constitution.mods",
        "operator": "push",
        "hide": false
    },
    "intellectMod": {
        "type": "number",
        "label": "PL1E.IntellectMod",
        "path": "characteristics.intellect.mods",
        "operator": "push",
        "hide": false
    },
    "cunningMod": {
        "type": "number",
        "label": "PL1E.CunningMod",
        "path": "characteristics.cunning.mods",
        "operator": "push",
        "hide": false
    },
    "wisdomMod": {
        "type": "number",
        "label": "PL1E.WisdomMod",
        "path": "characteristics.wisdom.mods",
        "operator": "push",
        "hide": false
    },
    "willMod": {
        "type": "number",
        "label": "PL1E.WillMod",
        "path": "characteristics.will.mods",
        "operator": "push",
        "hide": false
    },
    // Defense
    "parry": {
        "type": "number",
        "label": "PL1E.Parry",
        "hide": false
    },
    "dodge": {
        "type": "number",
        "label": "PL1E.Dodge",
        "hide": false
    },
    "parryProjectiles": {
        "type": "bool",
        "label": "PL1E.ParryProjectiles",
        "hide": false
    },
    "slashingReduction": {
        "type": "number",
        "label": "PL1E.SlashingReduction",
        "path": "attributes.slashingReductions",
        "operator": "push",
        "hide": false
    },
    "crushingReduction": {
        "type": "number",
        "label": "PL1E.CrushingReduction",
        "path": "attributes.crushingReductions",
        "operator": "push",
        "hide": false
    },
    "piercingReduction": {
        "type": "number",
        "label": "PL1E.PiercingReduction",
        "path": "attributes.piercingReductions",
        "operator": "push",
        "hide": false
    },
    "fireReduction": {
        "type": "number",
        "label": "PL1E.FireReduction",
        "path": "attributes.fireReductions",
        "operator": "push",
        "hide": false
    },
    "coldReduction": {
        "type": "number",
        "label": "PL1E.ColdReduction",
        "path": "attributes.coldReductions",
        "operator": "push",
        "hide": false
    },
    "acidReduction": {
        "type": "number",
        "label": "PL1E.AcidReduction",
        "path": "attributes.acidReductions",
        "operator": "push",
        "hide": false
    },
    "shockReduction": {
        "type": "number",
        "label": "PL1E.ShockReduction",
        "path": "attributes.shockReductions",
        "operator": "push",
        "hide": false
    },
    // Weapons
    "hands": {
        "type": "number",
        "label": "PL1E.Hands",
        "hide": false
    },
    "ammo": {
        "type": "number",
        "label": "PL1E.Ammo",
        "hide": false
    },
    // Abilities
    "rollSkill": {
        "type": "select",
        "label": "PL1E.RollSkill",
        "path": "attributes.rollSkill",
        "operator": "set",
        "select": "abilitySkills",
        "hide": false
    },
    "defenseSkill": {
        "type": "select",
        "label": "PL1E.DefenseSkill",
        "path": "attributes.defenseSkill",
        "operator": "set",
        "select": "abilitySkills",
        "hide": false
    },
    "targetNumber": {
        "type": "number",
        "label": "PL1E.TargetNumber",
        "hide": false
    },
    // Recovery
    "healthRecovery": {
        "type": "number",
        "label": "PL1E.HealthRecovery",
        "path": "resources.health.value",
        "operator": "add",
        "hide": false
    },
    "staminaRecovery": {
        "type": "number",
        "label": "PL1E.StaminaRecovery",
        "path": "resources.stamina.value",
        "operator": "add",
        "hide": false
    },
    "manaRecovery": {
        "type": "number",
        "label": "PL1E.ManaRecovery",
        "path": "resources.mana.value",
        "operator": "add",
        "hide": false
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
    "character": "SHEET.NewCharacter",
    "npc": "SHEET.NewNPC",
    "merchant": "SHEET.NewMerchant",
    "feature": "SHEET.NewFeature",
    "ability": "SHEET.NewAbility",
    "weapon": "SHEET.NewWeapon",
    "wearable": "SHEET.NewWearable",
    "consumable": "SHEET.NewConsumable",
    "common": "SHEET.NewCommon",
}

PL1E.sizes = {
    "small": "SIZE.Small",
    "medium": "SIZE.Medium",
    "large": "SIZE.Large",
    "huge": "SIZE.Huge",
    "gargantuan": "SIZE.Gargantuan"
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
    "clothes": "SLOT.Clothes",
    "armor": "SLOT.Armor",
    "ring": "SLOT.Ring",
    "amulet": "SLOT.Amulet"
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
    "parry": "DEFENSE.Par",
    "dodge": "DEFENSE.Dod",
    "vigor": "DEFENSE.Vig",
    "reflex": "DEFENSE.Ref",
    "resilience": "DEFENSE.Res",
    "intuition": "DEFENSE.Int",
    "handling": "SKILL.Han",
    "throwing": "SKILL.Thr",
    "athletics": "SKILL.Ath",
    "acrobatics": "SKILL.Acr",
    "accuracy": "SKILL.Acc",
    "search": "SKILL.Sea",
    "vigilance": "SKILL.Vig",
    "discretion": "SKILL.Dis",
    "performance": "SKILL.Per",
    "diplomacy": "SKILL.Dip",
    "intimidation": "SKILL.Int",
    "bluff": "SKILL.Blu",
    "craft": "SKILL.Cra",
    "erudition": "SKILL.Eru",
    "magic": "SKILL.Magic",
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