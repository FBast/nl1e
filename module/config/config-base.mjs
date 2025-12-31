import {PL1E} from "../pl1e.mjs";

export function getConfigBase() {
    PL1E.featureSubTypes = {
        "destiny": "PL1E.Destiny",
        "mental": "PL1E.Mental",
        "personality": "PL1E.Personality",
        "physical": "PL1E.Physical",
        "resource": "PL1E.Resource",
        "social": "PL1E.Social"
    }

    PL1E.classTypes = {
        "mind": "PL1E.Mind",
        "body": "PL1E.Body"
    }

    PL1E.weaponModes = {
        "none": "PL1E.None.M",
        "melee": "PL1E.Melee",
        "range": "PL1E.Range",
        "magic": "PL1E.Magic"
    }

    PL1E.slots = {
        "none": "PL1E.None.M",
        "garment": "PL1E.Garment",
        "armor": "PL1E.Armor",
        "ring": "PL1E.Ring",
        "necklace": "PL1E.Necklace"
    }

    PL1E.moduleTypes = {
        "weapon": "PL1E.Weapon",
        "garment": "PL1E.Garment",
        "armor": "PL1E.Armor",
        "ring": "PL1E.Ring",
        "necklace": "PL1E.Necklace"
    }

    PL1E.activations = {
        "passive": "PL1E.Passive",
        "action": "PL1E.Action",
        "quickAction": "PL1E.QuickAction",
        "reaction": "PL1E.Reaction",
        "outOfCombat": "PL1E.OutOfCombat"
    }

    PL1E.consumableActivations = {
        "action": "PL1E.Action",
        "quickAction": "PL1E.QuickAction",
        "reaction": "PL1E.Reaction",
        "outOfCombat": "PL1E.OutOfCombat"
    }

    PL1E.commonTypes = {
        "scrap": "PL1E.Scrap",
        "food": "PL1E.Food",
        "rest": "PL1E.Rest"
    }

    PL1E.serviceTypes = {
        "food": "PL1E.Food",
        "substance": "PL1E.Substance",
        "rest": "PL1E.Rest"
    }

    PL1E.consumableTypes = {
        "potion": "PL1E.Potion",
        "bomb": "PL1E.Bomb",
        "alcohol": "PL1E.Alcohol",
        "stimulant": "PL1E.Stimulant",
        "drug": "PL1E.Drug"
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