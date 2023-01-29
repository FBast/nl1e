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
    "health": "PL1E.Health",
    "stamina": "PL1E.Stamina",
    "mana": "PL1E.Mana"
};

PL1E.characteristics = {
    "strength": "PL1E.CharacteristicStr",
    "agility": "PL1E.CharacteristicAgi",
    "perception": "PL1E.CharacteristicPer",
    "constitution": "PL1E.CharacteristicCon",
    "intellect": "PL1E.CharacteristicInt",
    "cunning": "PL1E.CharacteristicCun",
    "wisdom": "PL1E.CharacteristicWis",
    "will": "PL1E.CharacteristicWil"
};

PL1E.characteristicsAbbreviations = {
    "strength": "PL1E.CharacteristicStrAbbr",
    "agility": "PL1E.CharacteristicAgiAbbr",
    "perception": "PL1E.CharacteristicPerAbbr",
    "constitution": "PL1E.CharacteristicConAbbr",
    "intellect": "PL1E.CharacteristicIntAbbr",
    "cunning": "PL1E.CharacteristicCunAbbr",
    "wisdom": "PL1E.CharacteristicWisAbbr",
    "will": "PL1E.CharacteristicWilAbbr"
};

PL1E.skills = {
    "parry": "PL1E.DefensePar",
    "dodge": "PL1E.DefenseDod",
    "vigor": "PL1E.ResistanceVig",
    "reflex": "PL1E.ResistanceRef",
    "resilience": "PL1E.ResistanceRes",
    "intuition": "PL1E.ResistanceInt",
    "handling": "PL1E.SkillHan",
    "throwing": "PL1E.SkillThr",
    "athletics": "PL1E.SkillAth",
    "acrobatics": "PL1E.SkillAcr",
    "accuracy": "PL1E.SkillAcc",
    "search": "PL1E.SkillSea",
    "vigilance": "PL1E.SkillVig",
    "discretion": "PL1E.SkillDis",
    "performance": "PL1E.SkillPer",
    "diplomacy": "PL1E.SkillDip",
    "intimidation": "PL1E.SkillInt",
    "bluff": "PL1E.SkillBlu",
    "craft": "PL1E.SkillCra",
    "erudition": "PL1E.SkillEru",
    "divineMagic": "PL1E.SkillDiv",
    "secularMagic": "PL1E.SkillSec"
}

PL1E.sizes = {
    "small": "PL1E.SizeSmall",
    "medium": "PL1E.SizeMedium",
    "large": "PL1E.SizeLarge",
    "huge": "PL1E.SizeHuge",
    "gargantuan": "PL1E.SizeGargantuan"
};

PL1E.sizeMods = {
    "small": "10",
    "medium": "20",
    "large": "40",
    "huge": "80",
    "gargantuan": "160"
};

PL1E.sizeTokens = {
    "small": "1",
    "medium": "1",
    "large": "2",
    "huge": "3",
    "gargantuan": "4"
};

PL1E.currencies = {
    "gp": "PL1E.Gold",
    "sp": "PL1E.Silver",
    "cp": "PL1E.Copper"
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

PL1E.attributes = {
    // General
    "price": {
        "type": "number",
        "label": "PL1E.Price"
    },
    "rarity": {
        "type": "number",
        "label": "PL1E.Rarity"
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
    "mastery": {
        "type": "select",
        "label": "PL1E.Mastery",
        "select": "masteries"
    },
    "slot": {
        "type": "select",
        "label": "PL1E.Slot",
        "select": "slots"
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