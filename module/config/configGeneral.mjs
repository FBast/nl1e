import {PL1E} from "./config.mjs";

export function getConfigGeneral() {
    PL1E.defaultIcons = {
        "character": "systems/pl1e/assets/icons/elf-helmet.svg",
        "npc": "systems/pl1e/assets/icons/goblin-head.svg",
        "merchant": "systems/pl1e/assets/icons/shop.svg",
        "feature": "systems/pl1e/assets/icons/skills.svg",
        "ability": "systems/pl1e/assets/icons/power-lightning.svg",
        "weapon": "systems/pl1e/assets/icons/combat.svg",
        "wearable": "systems/pl1e/assets/icons/armor-vest.svg",
        "consumable": "systems/pl1e/assets/icons/round-potion.svg",
        "common": "systems/pl1e/assets/icons/key.svg"
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
        "common": "PL1E.NewCommon"
    }

    PL1E.featureTypes = {
        "race": "PL1E.Race",
        "class": "PL1E.Class",
        "mastery": "PL1E.Mastery",
        "faith": "PL1E.Faith",
        "trait": "PL1E.Trait"
    }

    PL1E.money = {
        "gold": "PL1E.Gold",
        "silver": "PL1E.Silver",
        "copper": "PL1E.Copper"
    }

    PL1E.itemLinks = {
        "none": "PL1E.None",
        "parent": "PL1E.Parent",
        "mastery": "PL1E.Mastery",
        "multiple": "PL1E.Multiple"
    }

    PL1E.masters = {
        "hands": "PL1E.Hands",
        "mouth": "PL1E.Mouth",
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
        "action": "PL1E.Action",
        "reaction": "PL1E.Reaction"
    }

    PL1E.activationLink = {
        "passive": "PL1E.Passive",
        "child": "PL1E.Child"
    }

    PL1E.commonTypes = {
        "scrap": "PL1E.Scrap",
        "food": "PL1E.Food",
        "drink": "PL1E.Drink"
    }
}