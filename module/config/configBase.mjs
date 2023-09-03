import {PL1E} from "./config.mjs";

export function getConfigBase() {
    PL1E.featureTypes = {
        "race": "PL1E.Race",
        "bodyClass": "PL1E.BodyClass",
        "mindClass": "PL1E.MindClass",
        "faith": "PL1E.Faith",
        "trait": "PL1E.Trait"
    }

    PL1E.money = {
        "gold": "PL1E.Gold",
        "silver": "PL1E.Silver",
        "copper": "PL1E.Copper"
    }

    PL1E.rangeOverrides = {
        "none": "PL1E.None",
        "melee": "PL1E.Melee",
        "range": "PL1E.Range"
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
        "necklace": "PL1E.Necklace"
    }

    PL1E.activations = {
        "action": "PL1E.Action",
        "reaction": "PL1E.Reaction",
        "quickAction": "PL1E.QuickAction"
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

    PL1E.visionMode = {

    }

    PL1E.sizes = {
        "small": {
            "label": "PL1E.Small",
            "multiplier": 0.5,
            "token": 1
        },
        "medium": {
            "label": "PL1E.Medium",
            "multiplier": 1,
            "token": 1
        },
        "large": {
            "label": "PL1E.Large",
            "multiplier": 2,
            "token": 2,
        },
        "huge": {
            "label": "PL1E.Huge",
            "multiplier": 3,
            "token": 3
        },
        "gargantuan": {
            "label": "PL1E.Gargantuan",
            "multiplier": 4,
            "token": 4
        }
    }

    PL1E.speeds = {
        "verySlow": {
            "label": "PL1E.VerySlow",
            "movement": 2,
            "baseInitiative": 0
        },
        "slow": {
            "label": "PL1E.Slow",
            "movement": 3,
            "baseInitiative": 5
        },
        "medium": {
            "label": "PL1E.Medium",
            "movement": 4,
            "baseInitiative": 10
        },
        "fast": {
            "label": "PL1E.Fast",
            "movement": 5,
            "baseInitiative": 15
        },
        "veryFast": {
            "label": "PL1E.VeryFast",
            "movement": 6,
            "baseInitiative": 20
        }
    }

}