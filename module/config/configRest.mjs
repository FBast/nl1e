import {PL1E} from "../pl1e.mjs";

export function getConfigRest() {
    PL1E.beds = {
        "none": {
            "img": "systems/pl1e/assets/rest/bedNone.jpg",
            "tooltip": "PL1E.BedNoneTooltip",
            "effects": {
                "health": -5,
                "mana": -10
            }
        },
        "poor": {
            "img": "systems/pl1e/assets/rest/bedPoor.jpg",
            "tooltip": "PL1E.BedPoorTooltip",
            "effects": {}
        },
        "normal": {
            "img": "systems/pl1e/assets/rest/bedNormal.jpg",
            "tooltip": "PL1E.BedNormalTooltip",
            "effects": {
                "health": 5,
                "mana": 10
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/bedGood.jpg",
            "tooltip": "PL1E.BedGoodTooltip",
            "effects": {
                "health": 10,
                "mana": 20
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/bedLuxurious.jpg",
            "tooltip": "PL1E.BedLuxuriousTooltip",
            "effects": {
                "health": 15,
                "mana": 30
            }
        }
    };

    PL1E.meals = {
        "none": {
            "img": "systems/pl1e/assets/rest/mealNone.jpg",
            "tooltip": "PL1E.MealNoneTooltip",
            "effects": {
                "health": -5,
                "stamina": -10
            }
        },
        "frugal": {
            "img": "systems/pl1e/assets/rest/mealFrugal.jpg",
            "tooltip": "PL1E.MealFrugalTooltip",
            "effects": {}
        },
        "normal": {
            "img": "systems/pl1e/assets/rest/mealNormal.jpg",
            "tooltip": "PL1E.MealNormalTooltip",
            "effects": {
                "health": 5,
                "stamina": 10
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/mealGood.jpg",
            "tooltip": "PL1E.MealGoodTooltip",
            "effects": {
                "health": 10,
                "stamina": 20
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/mealLuxurious.jpg",
            "tooltip": "PL1E.MealLuxuriousTooltip",
            "effects": {
                "health": 15,
                "stamina": 30
            }
        }
    };
}