import {PL1E} from "../pl1e.mjs";

export function getConfigRest() {
    PL1E.environments = {
        "normal": {
            "img": "systems/pl1e/assets/rest/plain.jpg",
            "tooltip": "PL1E.EnvironmentNormalTooltip",
            "effects": {}
        },
        "hostile": {
            "img": "systems/pl1e/assets/rest/taiga.jpg",
            "tooltip": "PL1E.EnvironmentHostileTooltip",
            "effects": {
                "stamina": -10,
                "mana": -10,
            }
        },
        "extreme": {
            "img": "systems/pl1e/assets/rest/desert.jpg",
            "tooltip": "PL1E.EnvironmentExtremeTooltip",
            "effects": {
                "stamina": -20,
                "mana": -20,
            }
        }
    };

    PL1E.beds = {
        "none": {
            "img": "systems/pl1e/assets/rest/bedNone.jpg",
            "tooltip": "PL1E.BedNoneTooltip",
            "effects": {
                "health": -10
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
                "health": 20
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/bedGood.jpg",
            "tooltip": "PL1E.BedGoodTooltip",
            "effects": {
                "health": 30
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/bedLuxurious.jpg",
            "tooltip": "PL1E.BedLuxuriousTooltip",
            "effects": {
                "health": 40
            }
        }
    };

    PL1E.meals = {
        "none": {
            "img": "systems/pl1e/assets/rest/mealNone.jpg",
            "tooltip": "PL1E.MealNoneTooltip",
            "effects": {
                "stamina": -5,
                "mana": -5
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
                "stamina": 10,
                "mana": 10
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/mealGood.jpg",
            "tooltip": "PL1E.MealGoodTooltip",
            "effects": {
                "stamina": 20,
                "mana": 20
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/mealLuxurious.jpg",
            "tooltip": "PL1E.MealLuxuriousTooltip",
            "effects": {
                "health": 40,
                "stamina": 40
            }
        }
    };
}