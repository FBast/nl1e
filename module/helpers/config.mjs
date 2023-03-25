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

PL1E.sizes = {
    "small": "PL1E.Small",
    "medium": "PL1E.Medium",
    "large": "PL1E.Large",
    "huge": "PL1E.Huge",
    "gargantuan": "PL1E.Gargantuan"
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

PL1E.areaTypes = {
    "target": "PL1E.Target",
    "circle": "PL1E.Circle",
    "cone": "PL1E.Cone",
    "rect": "PL1E.Rect",
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

PL1E.resources = {
    "health": {
        "label": "PL1E.Health",
        "icon": "fas fa-heart",
        "type": "number",
        "path": "resources.health.value",
        "operator": "add"
    },
    "stamina": {
        "label": "PL1E.Stamina",
        "icon": "fas fa-wave-pulse",
        "type": "number",
        "path": "resources.stamina.value",
        "operator": "add"
    },
    "mana": {
        "label": "PL1E.Mana",
        "icon": "fas fa-sparkles",
        "type": "number",
        "path": "resources.mana.value",
        "operator": "add"
    }
}

PL1E.characteristics = {
    "health": {
        "label": "PL1E.Health",
        "icon": "fas fa-heart",
        "type": "number",
        "path": "resources.health.value",
        "operator": "add"
    },
    "stamina": {
        "label": "PL1E.Stamina",
        "icon": "fas fa-wave-pulse",
        "type": "number",
        "path": "resources.stamina.value",
        "operator": "add",
    },
    "mana": {
        "label": "PL1E.Mana",
        "icon": "fas fa-sparkles",
        "type": "number",
        "path": "resources.mana.value",
        "operator": "add",
    }
}

PL1E.skills = {
    "strength": {
        "label": "PL1E.Strength",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.strength.mods",
        "operator": "push",
    },
    "agility": {
        "label": "PL1E.Agility",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.agility.mods",
        "operator": "push",
    },
    "perception": {
        "label": "PL1E.Perception",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.perception.mods",
        "operator": "push"
    },
    "constitution": {
        "label": "PL1E.Constitution",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.constitution.mods",
        "operator": "push"
    },
    "intellect": {
        "label": "PL1E.Intellect",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.intellect.mods",
        "operator": "push"
    },
    "cunning": {
        "label": "PL1E.Cunning",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.cunning.mods",
        "operator": "push"
    },
    "wisdom": {
        "label": "PL1E.Wisdom",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.wisdom.mods",
        "operator": "push"
    },
    "will": {
        "label": "PL1E.Will",
        "icon": "fas fa-dumbbell",
        "type": "number",
        "path": "characteristics.will.mods",
        "operator": "push"
    }
}

PL1E.misc = {
    "size": {
        "label": "PL1E.Size",
        "icon": "fas fa-arrow-up-big-small",
        "type": "select",
        "path": "misc.size",
        "select": "sizes",
        "operator": "set"
    },
    "speed": {
        "label": "PL1E.Speed",
        "icon": "fas fa-person-running",
        "type": "number",
        "path": "misc.speed",
        "operator": "set"
    },
    "movementPenalty": {
        "label": "PL1E.MovementPenalty",
        "icon": "fas fa-weight-hanging",
        "type": "number",
        "path": "misc.movementPenalty",
        "operator": "add"
    },
    "parry": {
        "label": "PL1E.Parry",
        "icon": "fas fa-shield",
        "type": "number",
        "path": "misc.parry",
        "operator": "add"
    },
    "dodge": {
        "label": "PL1E.Dodge",
        "icon": "fas fa-eye",
        "type": "number",
        "path": "misc.dodge",
        "operator": "add"
    },
    "slashingReduction": {
        "label": "PL1E.SlashingReduction",
        "icon": "far fa-axe-battle",
        "type": "number",
        "path": "misc.slashingReduction",
        "operator": "add"
    },
    "crushingReduction": {
        "label": "PL1E.CrushingReduction",
        "icon": "far fa-hammer-war",
        "type": "number",
        "path": "misc.crushingReduction",
        "operator": "add"
    },
    "piercingReduction": {
        "label": "PL1E.PiercingReduction",
        "icon": "far fa-dagger",
        "type": "number",
        "path": "misc.piercingReduction",
        "operator": "add"
    },
    "burnReduction": {
        "label": "PL1E.BurnReduction",
        "icon": "far fa-fire",
        "type": "number",
        "path": "misc.burnReduction",
        "operator": "add"
    },
    "coldReduction": {
        "label": "PL1E.ColdReduction",
        "icon": "far fa-snowflake",
        "type": "number",
        "path": "misc.coldReduction",
        "operator": "push"
    },
    "shockReduction": {
        "label": "PL1E.ShockReduction",
        "icon": "far fa-bolt",
        "type": "number",
        "path": "misc.shockReduction",
        "operator": "push"
    },
    "acidReduction": {
        "label": "PL1E.AcidReduction",
        "icon": "far fa-droplet",
        "type": "number",
        "path": "misc.acidReduction",
        "operator": "push"
    }
}

PL1E.optionalAttributes = {
    "feature": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    },
    "ability": {
        "damage": "PL1E.Damage",
        "heal": "PL1E.Heal",
        "transfer": "PL1E.Transfer",
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    },
    "weapon": {
        "damage": "PL1E.Damage",
        "heal": "PL1E.Heal",
        "transfer": "PL1E.Transfer",
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    },
    "wearable": {
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    },
    "consumable": {
        "damage": "PL1E.Damage",
        "heal": "PL1E.Heal",
        "increase": "PL1E.Increase",
        "decrease": "PL1E.Decrease",
        "set": "PL1E.Set"
    }
    // "feature": {
    //     "size": "PL1E.Size",
    //     "speed": "PL1E.Speed",
    //     "health": "PL1E.Health",
    //     "stamina": "PL1E.Stamina",
    //     "mana": "PL1E.Mana",
    //     "strengthMod": "PL1E.StrengthMod",
    //     "agilityMod": "PL1E.AgilityMod",
    //     "perceptionMod": "PL1E.PerceptionMod",
    //     "constitutionMod": "PL1E.ConstitutionMod",
    //     "intellectMod": "PL1E.IntellectMod",
    //     "cunningMod": "PL1E.CunningMod",
    //     "wisdomMod": "PL1E.WisdomMod",
    //     "willMod": "PL1E.WillMod"
    // },
    // "ability": {
    //     "health": "PL1E.Health",
    //     "stamina": "PL1E.Stamina",
    //     "mana": "PL1E.Mana",
    //     "strengthMod": "PL1E.StrengthMod",
    //     "agilityMod": "PL1E.AgilityMod",
    //     "perceptionMod": "PL1E.PerceptionMod",
    //     "constitutionMod": "PL1E.ConstitutionMod",
    //     "intellectMod": "PL1E.IntellectMod",
    //     "cunningMod": "PL1E.CunningMod",
    //     "wisdomMod": "PL1E.WisdomMod",
    //     "willMod": "PL1E.WillMod"
    // },
    // "weapon": {
    //     "movementPenalty": "PL1E.MovementPenalty",
    //     "parry": "PL1E.Parry",
    //     "dodge": "PL1E.Dodge",
    //     "health": "PL1E.Health",
    //     "stamina": "PL1E.Stamina",
    //     "mana": "PL1E.Mana",
    //     "strengthMod": "PL1E.StrengthMod",
    //     "agilityMod": "PL1E.AgilityMod",
    //     "perceptionMod": "PL1E.PerceptionMod",
    //     "constitutionMod": "PL1E.ConstitutionMod",
    //     "intellectMod": "PL1E.IntellectMod",
    //     "cunningMod": "PL1E.CunningMod",
    //     "wisdomMod": "PL1E.WisdomMod",
    //     "willMod": "PL1E.WillMod"
    // },
    // "wearable": {
    //     "movementPenalty": "PL1E.MovementPenalty",
    //     "parry": "PL1E.Parry",
    //     "dodge": "PL1E.Dodge",
    //     "slashingReduction": "PL1E.SlashingReduction",
    //     "crushingReduction": "PL1E.CrushingReduction",
    //     "piercingReduction": "PL1E.PiercingReduction",
    //     "burnReduction": "PL1E.BurnReduction",
    //     "coldReduction": "PL1E.ColdReduction",
    //     "acidReduction": "PL1E.AcidReduction",
    //     "shockReduction": "PL1E.ShockReduction",
    //     "strengthMod": "PL1E.StrengthMod",
    //     "agilityMod": "PL1E.AgilityMod",
    //     "perceptionMod": "PL1E.PerceptionMod",
    //     "constitutionMod": "PL1E.ConstitutionMod",
    //     "intellectMod": "PL1E.IntellectMod",
    //     "cunningMod": "PL1E.CunningMod",
    //     "wisdomMod": "PL1E.WisdomMod",
    //     "willMod": "PL1E.WillMod"
    // },
    // "consumable": {
    //     "size": "PL1E.Size",
    //     "speed": "PL1E.Speed",
    //     "parry": "PL1E.Parry",
    //     "dodge": "PL1E.Dodge",
    //     "burnReduction": "PL1E.BurnReduction",
    //     "coldReduction": "PL1E.ColdReduction",
    //     "acidReduction": "PL1E.AcidReduction",
    //     "shockReduction": "PL1E.ShockReduction",
    //     "burn": "PL1E.Burn",
    //     "cold": "PL1E.Cold",
    //     "shock": "PL1E.Shock",
    //     "acid": "PL1E.Acid",
    //     "health": "PL1E.Health",
    //     "stamina": "PL1E.Stamina",
    //     "mana": "PL1E.Mana"
    // }
}

PL1E.optionalAttributesValues = {
    "damage": {
        "value": 0,
        "targets": ["resources"],
        "target": "health",
        "reduction": "none"
    },
    "heal": {
        "value": 0,
        "targets": ["resources"],
        "target": "health"
    },
    "transfer": {
        "value": 0,
        "reduction": "none",
        "targets": ["resources"],
        "target": "health"
    },
    "increase": {
        "value": 0,
        "reduction": "none",
        "targets": ["characteristics", "misc"],
        "target": "health"
    },
    "decrease": {
        "value": 0,
        "reduction": "none",
        "targets": ["characteristics", "misc"],
        "target": "health"
    },
    "set": {
        "value": 0,
        "reduction": "none",
        "targets": ["characteristics", "misc"],
        "target": "health"
    }
    // "size": {
    //     "value": "medium",
    //     "label": "PL1E.Size",
    //     "icon": "fas fa-arrow-up-big-small",
    //     "type": "select",
    //     "operator": "",
    //     "path": "misc.size",
    //     "select": "sizes"
    // },
    // "speed": {
    //     "value": 4.5,
    //     "label": "PL1E.Speed",
    //     "icon": "fas fa-person-running",
    //     "type": "number",
    //     "operator": "set",
    //     "path": "misc.speed"
    // },
    // "movementPenalty": {
    //     "value": 0,
    //     "label": "PL1E.MovementPenalty",
    //     "icon": "fas fa-weight-hanging",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.movementPenalty"
    // },
    // "parry": {
    //     "value": 0,
    //     "label": "PL1E.Parry",
    //     "icon": "fas fa-shield",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.parry"
    // },
    // "dodge": {
    //     "value": 0,
    //     "label": "PL1E.Dodge",
    //     "icon": "fas fa-eye",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.dodge"
    // },
    // "health": {
    //     "value": 0,
    //     "label": "PL1E.Health",
    //     "icon": "fas fa-heart",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "resources.health.value",
    //     "reduction": "none"
    // },
    // "stamina": {
    //     "value": 0,
    //     "label": "PL1E.Stamina",
    //     "icon": "fas fa-wave-pulse",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "resources.stamina.value",
    //     "reduction": "none"
    // },
    // "mana": {
    //     "value": 0,
    //     "label": "PL1E.Mana",
    //     "icon": "fas fa-sparkles",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "resources.mana.value",
    //     "reduction": "none"
    // },
    // "slashingReduction": {
    //     "value": 0,
    //     "label": "PL1E.SlashingReduction",
    //     "icon": "far fa-axe-battle",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.slashingReduction"
    // },
    // "crushingReduction": {
    //     "value": 0,
    //     "label": "PL1E.CrushingReduction",
    //     "icon": "far fa-hammer-war",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.crushingReduction"
    // },
    // "piercingReduction": {
    //     "value": 0,
    //     "label": "PL1E.PiercingReduction",
    //     "icon": "far fa-dagger",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.piercingReduction"
    // },
    // "burnReduction": {
    //     "value": 0,
    //     "label": "PL1E.BurnReduction",
    //     "icon": "far fa-fire",
    //     "type": "number",
    //     "operator": "add",
    //     "path": "misc.burnReduction"
    // },
    // "coldReduction": {
    //     "value": 0,
    //     "label": "PL1E.ColdReduction",
    //     "icon": "far fa-snowflake",
    //     "type": "number",
    //     "path": "misc.coldReduction",
    //     "operator": "push"
    // },
    // "shockReduction": {
    //     "value": 0,
    //     "label": "PL1E.ShockReduction",
    //     "icon": "far fa-bolt",
    //     "type": "number",
    //     "path": "misc.shockReduction",
    //     "operator": "push"
    // },
    // "acidReduction": {
    //     "value": 0,
    //     "label": "PL1E.AcidReduction",
    //     "icon": "far fa-droplet",
    //     "type": "number",
    //     "path": "misc.acidReduction",
    //     "operator": "push"
    // },
    // "strengthMod": {
    //     "value": 0,
    //     "label": "PL1E.StrengthMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.strength.mods",
    //     "operator": "push",
    // },
    // "agilityMod": {
    //     "value": 0,
    //     "label": "PL1E.AgilityMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.agility.mods",
    //     "operator": "push",
    // },
    // "perceptionMod": {
    //     "value": 0,
    //     "label": "PL1E.PerceptionMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.perception.mods",
    //     "operator": "push"
    // },
    // "constitutionMod": {
    //     "value": 0,
    //     "label": "PL1E.ConstitutionMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.constitution.mods",
    //     "operator": "push"
    // },
    // "intellectMod": {
    //     "value": 0,
    //     "label": "PL1E.IntellectMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.intellect.mods",
    //     "operator": "push"
    // },
    // "cunningMod": {
    //     "value": 0,
    //     "label": "PL1E.CunningMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.cunning.mods",
    //     "operator": "push"
    // },
    // "wisdomMod": {
    //     "value": 0,
    //     "label": "PL1E.WisdomMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.wisdom.mods",
    //     "operator": "push"
    // },
    // "willMod": {
    //     "value": 0,
    //     "label": "PL1E.WillMod",
    //     "icon": "fas fa-dumbbell",
    //     "type": "number",
    //     "path": "characteristics.will.mods",
    //     "operator": "push"
    // }
}