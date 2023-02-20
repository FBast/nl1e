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
    "race": "FEATURETYPE.Race",
    "class": "FEATURETYPE.Class"
}

PL1E.masteries = {
    "none": "MASTERY.None",
    "crossbows": "MASTERY.Crossbows",
    "bows": "MASTERY.Bows",
    "poleArms": "MASTERY.PoleArms",
    "shields": "MASTERY.Shields",
    "shortAxes": "MASTERY.ShortAxes",
    "longAxes": "MASTERY.LongAxes",
    "shortBlades": "MASTERY.ShortBlades",
    "mediumBlades": "MASTERY.MediumBlades",
    "longBlades": "MASTERY.LongBlades",
    "shortHammers": "MASTERY.ShortHammers",
    "longHammers": "MASTERY.LongHammers",
    "arcana": "MASTERY.Arcana",
    "aramancia": "MASTERY.Aramancia",
    "biomancia": "MASTERY.Biomancia",
    "diastamancia": "MASTERY.Diastamancia",
    "goetia": "MASTERY.Goetia",
    "myalomancia": "MASTERY.Myalomancia",
    "necromancia": "MASTERY.Necromancia",
    "theurgy": "MASTERY.Theurgy"
}

PL1E.slots = {
    "none": "SLOT.None",
    "clothes": "SLOT.Clothes",
    "armor": "SLOT.Armor",
    "ring": "SLOT.Ring",
    "amulet": "SLOT.Amulet"
}

PL1E.activations = {
    "passive": "ACTIVATION.Passive",
    "reaction": "ACTIVATION.Reaction",
    "free": "ACTIVATION.Free",
    "action": "ACTIVATION.Action",
    "round": "ACTIVATION.Round",
    "special": "ACTIVATION.Special"
}

PL1E.abilitySkills = {
    "none": "CHARA.None",
    "parry": "CHARA.Parry",
    "dodge": "CHARA.Dodge",
    "vigor": "CHARA.Vigor",
    "reflex": "CHARA.Reflex",
    "resilience": "CHARA.Resilience",
    "intuition": "CHARA.Intuition",
    "handling": "CHARA.Handling",
    "throwing": "CHARA.Throwing",
    "athletics": "CHARA.Athletics",
    "acrobatics": "CHARA.Acrobatics",
    "accuracy": "CHARA.Accuracy",
    "search": "CHARA.Search",
    "vigilance": "CHARA.Vigilance",
    "discretion": "CHARA.Discretion",
    "performance": "CHARA.Performance",
    "diplomacy": "CHARA.Diplomacy",
    "intimidation": "CHARA.Intimidation",
    "bluff": "CHARA.Bluff",
    "craft": "CHARA.Craft",
    "erudition": "CHARA.Erudition",
    "divineMagic": "CHARA.DivineMagic",
    "secularMagic": "CHARA.SecularMagic",
}

PL1E.NPCTemplates = {
    "balanced": "NPCTEMPLATE.Balanced",
    "soldier": "NPCTEMPLATE.Soldier",
    "brute": "NPCTEMPLATE.Brute",
    "killer": "NPCTEMPLATE.Killer",
    "hunter": "NPCTEMPLATE.Hunter",
    "mystic": "NPCTEMPLATE.Mystic",
    "wizard": "NPCTEMPLATE.Wizard",
    "priest": "NPCTEMPLATE.Priest",
    "battleMage": "NPCTEMPLATE.BattleMage",
    "crusader": "NPCTEMPLATE.Crusader",
    "assassin": "NPCTEMPLATE.Assassin",
    "monk": "NPCTEMPLATE.Monk"
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
    "novice": "XPTEMPLATE.Novice",
    "apprentice": "XPTEMPLATE.Apprentice",
    "adept": "XPTEMPLATE.Adept",
    "expert": "XPTEMPLATE.Expert",
    "master": "XPTEMPLATE.Master",
    "grandMaster": "XPTEMPLATE.GrandMaster"
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
    "circle": "AREATYPE.Circle",
    "cone": "AREATYPE.Cone",
    "rect": "AREATYPE.Rect",
    "ray": "AREATYPE.Ray",
};

PL1E.targetingTypes = {
    "self": "TARGETINGTYPE.Self",
    "allies": "TARGETINGTYPE.Allies",
    "opponents": "TARGETINGTYPE.Opponents",
    "all": "TARGETINGTYPE.All"
}