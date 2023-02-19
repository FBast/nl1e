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
    "none": "PL1E.None",
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
    "divineMagic": "SKILL.Div",
    "secularMagic": "SKILL.Sec",
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

PL1E.areaTargetTypes = {
    "single": "circle",
    "circle": "circle",
    "cone": "cone",
    "square": "rect",
    "line": "ray",
};