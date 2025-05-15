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
        },
        "cursed": {
            "img": "systems/pl1e/assets/rest/volcano.jpg",
            "tooltip": "PL1E.EnvironmentCursedTooltip",
            "effects": {
                "stamina": -30,
                "mana": -30,
            }
        }
    };

    PL1E.rest = {
        "poor": {
            "img": "systems/pl1e/assets/rest/restPoor.jpg",
            "tooltip": "PL1E.RestPoorTooltip",
            "effects": {
                "health": 10
            }
        },
        "normal": {
            "img": "systems/pl1e/assets/rest/restNormal.jpg",
            "tooltip": "PL1E.RestNormalTooltip",
            "effects": {
                "health": 20
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/restGood.jpg",
            "tooltip": "PL1E.RestGoodTooltip",
            "effects": {
                "health": 40
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/restLuxurious.jpg",
            "tooltip": "PL1E.RestLuxuriousTooltip",
            "effects": {
                "health": 60
            }
        }
    };

    PL1E.meals = {
        "none": {
            "img": "systems/pl1e/assets/rest/mealNone.jpg",
            "tooltip": "PL1E.MealNoneTooltip",
            "effects": {}
        },
        "frugal": {
            "img": "systems/pl1e/assets/rest/mealFrugal.jpg",
            "tooltip": "PL1E.MealFrugalTooltip",
            "effects": {
                "stamina": 10,
                "mana": 10
            }
        },
        "normal": {
            "img": "systems/pl1e/assets/rest/mealNormal.jpg",
            "tooltip": "PL1E.MealNormalTooltip",
            "effects": {
                "stamina": 20,
                "mana": 20
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/mealGood.jpg",
            "tooltip": "PL1E.MealGoodTooltip",
            "effects": {
                "stamina": 40,
                "mana": 40
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/mealLuxurious.jpg",
            "tooltip": "PL1E.MealLuxuriousTooltip",
            "effects": {
                "stamina": 60,
                "mana": 60
            }
        }
    };
}