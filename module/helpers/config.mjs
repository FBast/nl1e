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
    "circle": "PL1E.Circle",
    "cone": "PL1E.Cone",
    "rect": "PL1E.Rect",
    "ray": "PL1E.Ray"
}

PL1E.targetGroups = {
    "self": "PL1E.Self",
    "allies": "PL1E.Allies",
    "opponents": "PL1E.Opponents",
    "all": "PL1E.All"
}

PL1E.resolutionTypes = {
    "valueIfSuccess" : "PL1E.ValueIfSuccess",
    "multiplyBySuccess": "PL1E.MultiplyBySuccess"
}

PL1E.optionalAttributes = {
    "feature": {
        "size": "PL1E.Size",
        "speed": "PL1E.Speed",
        "health": "PL1E.Health",
        "stamina": "PL1E.Stamina",
        "mana": "PL1E.Mana",
        "strengthMod": "PL1E.StrengthMod",
        "agilityMod": "PL1E.AgilityMod",
        "perceptionMod": "PL1E.PerceptionMod",
        "constitutionMod": "PL1E.ConstitutionMod",
        "intellectMod": "PL1E.IntellectMod",
        "cunningMod": "PL1E.CunningMod",
        "wisdomMod": "PL1E.WisdomMod",
        "willMod": "PL1E.WillMod"
    },
    "ability": {
        "slashing": "PL1E.Slashing",
        "crushing": "PL1E.Crushing",
        "piercing": "PL1E.Piercing",
        "burn": "PL1E.Burn",
        "cold": "PL1E.Cold",
        "shock": "PL1E.Shock",
        "acid": "PL1E.Acid",
        "health": "PL1E.Health",
        "stamina": "PL1E.Stamina",
        "mana": "PL1E.Mana",
        "strengthMod": "PL1E.StrengthMod",
        "agilityMod": "PL1E.AgilityMod",
        "perceptionMod": "PL1E.PerceptionMod",
        "constitutionMod": "PL1E.ConstitutionMod",
        "intellectMod": "PL1E.IntellectMod",
        "cunningMod": "PL1E.CunningMod",
        "wisdomMod": "PL1E.WisdomMod",
        "willMod": "PL1E.WillMod"
    },
    "weapon": {
        "movementPenalty": "PL1E.MovementPenalty",
        "parry": "PL1E.Parry",
        "dodge": "PL1E.Dodge",
        "slashing": "PL1E.Slashing",
        "crushing": "PL1E.Crushing",
        "piercing": "PL1E.Piercing",
        "burn": "PL1E.Burn",
        "cold": "PL1E.Cold",
        "shock": "PL1E.Shock",
        "acid": "PL1E.Acid",
        "strengthMod": "PL1E.StrengthMod",
        "agilityMod": "PL1E.AgilityMod",
        "perceptionMod": "PL1E.PerceptionMod",
        "constitutionMod": "PL1E.ConstitutionMod",
        "intellectMod": "PL1E.IntellectMod",
        "cunningMod": "PL1E.CunningMod",
        "wisdomMod": "PL1E.WisdomMod",
        "willMod": "PL1E.WillMod"
    },
    "wearable": {
        "movementPenalty": "PL1E.MovementPenalty",
        "parry": "PL1E.Parry",
        "dodge": "PL1E.Dodge",
        "slashingReduction": "PL1E.SlashingReduction",
        "crushingReduction": "PL1E.CrushingReduction",
        "piercingReduction": "PL1E.PiercingReduction",
        "burnReduction": "PL1E.BurnReduction",
        "coldReduction": "PL1E.ColdReduction",
        "acidReduction": "PL1E.AcidReduction",
        "shockReduction": "PL1E.ShockReduction",
        "strengthMod": "PL1E.StrengthMod",
        "agilityMod": "PL1E.AgilityMod",
        "perceptionMod": "PL1E.PerceptionMod",
        "constitutionMod": "PL1E.ConstitutionMod",
        "intellectMod": "PL1E.IntellectMod",
        "cunningMod": "PL1E.CunningMod",
        "wisdomMod": "PL1E.WisdomMod",
        "willMod": "PL1E.WillMod"
    },
    "consumable": {
        "size": "PL1E.Size",
        "speed": "PL1E.Speed",
        "parry": "PL1E.Parry",
        "dodge": "PL1E.Dodge",
        "burnReduction": "PL1E.BurnReduction",
        "coldReduction": "PL1E.ColdReduction",
        "acidReduction": "PL1E.AcidReduction",
        "shockReduction": "PL1E.ShockReduction",
        "burn": "PL1E.Burn",
        "cold": "PL1E.Cold",
        "shock": "PL1E.Shock",
        "acid": "PL1E.Acid",
        "health": "PL1E.Health",
        "stamina": "PL1E.Stamina",
        "mana": "PL1E.Mana"
    }
}

PL1E.optionalAttributesValues = {
    "size": {
        "value": "medium",
        "category": "optional",
        "type": "select",
        "label": "PL1E.Size",
        "path": "attributes.size",
        "operator": "set",
        "select": "sizes"
    },
    "speed": {
        "value": 4.5,
        "category": "optional",
        "type": "number",
        "label": "PL1E.Speed",
        "path": "attributes.speed",
        "operator": "set"
    },
    "movementPenalty": {
        "value": 0,
        "type": "number",
        "label": "PL1E.MovementPenalty",
        "path": "attributes.movementPenalties",
        "operator": "push",
    },
    "parry": {
        "value": 0,
        "category": "optional",
        "type": "number",
        "path": "attributes.parry",
        "label": "PL1E.Parry"
    },
    "dodge": {
        "value": 0,
        "category": "optional",
        "type": "number",
        "path": "attributes.dodge",
        "label": "PL1E.Dodge"
    },
    "slashing": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Slashing",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.slashingReduction"
    },
    "crushing": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Crushing",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.crushingReduction"
    },
    "piercing": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Piercing",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.piercingReduction"
    },
    "burn": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Burn",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.burnReduction"
    },
    "cold": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Cold",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.coldReduction"
    },
    "shock": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Shock",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.shockReduction"
    },
    "acid": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Acid",
        "path": "resources.health.value",
        "operator": "add",
        "reduction": "attributes.acidReduction"
    },
    "health": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Health",
        "path": "resources.health.value",
        "operator": "add"
    },
    "stamina": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Stamina",
        "path": "resources.stamina.value",
        "operator": "add"
    },
    "mana": {
        "value": 0,
        "type": "number",
        "label": "PL1E.Mana",
        "path": "resources.mana.value",
        "operator": "add"
    },
    "slashingReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.SlashingReduction",
        "path": "attributes.slashingReductions",
        "operator": "push"
    },
    "crushingReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.CrushingReduction",
        "path": "attributes.crushingReductions",
        "operator": "push"
    },
    "piercingReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.PiercingReduction",
        "path": "attributes.piercingReductions",
        "operator": "push"
    },
    "burnReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.BurnReduction",
        "path": "attributes.burnReductions",
        "operator": "push"
    },
    "coldReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.ColdReduction",
        "path": "attributes.coldReductions",
        "operator": "push"
    },
    "acidReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.AcidReduction",
        "path": "attributes.acidReductions",
        "operator": "push"
    },
    "shockReduction": {
        "value": 0,
        "type": "number",
        "label": "PL1E.ShockReduction",
        "path": "attributes.shockReductions",
        "operator": "push"
    },
    "strengthMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.StrengthMod",
        "path": "characteristics.strength.mods",
        "operator": "push",
    },
    "agilityMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.AgilityMod",
        "path": "characteristics.agility.mods",
        "operator": "push",
    },
    "perceptionMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.PerceptionMod",
        "path": "characteristics.perception.mods",
        "operator": "push"
    },
    "constitutionMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.ConstitutionMod",
        "path": "characteristics.constitution.mods",
        "operator": "push"
    },
    "intellectMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.IntellectMod",
        "path": "characteristics.intellect.mods",
        "operator": "push"
    },
    "cunningMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.CunningMod",
        "path": "characteristics.cunning.mods",
        "operator": "push"
    },
    "wisdomMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.WisdomMod",
        "path": "characteristics.wisdom.mods",
        "operator": "push"
    },
    "willMod": {
        "value": 0,
        "type": "number",
        "label": "PL1E.WillMod",
        "path": "characteristics.will.mods",
        "operator": "push"
    }
}