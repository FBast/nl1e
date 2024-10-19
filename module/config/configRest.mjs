import {PL1E} from "../pl1e.mjs";

export function getConfigRest() {
    PL1E.environments = {
        "desert": {
            "img": "systems/pl1e/assets/rest/desert.jpg",
            "tooltip": "PL1E.DesertTooltip",
            "effects": {
                "temperature": 2,
                "tranquility": -1,
                "satiety": -1
            }
        },
        "savannah": {
            "img": "systems/pl1e/assets/rest/savannah.jpg",
            "tooltip": "PL1E.SavannahTooltip",
            "effects": {
                "temperature": 1,
                "tranquility": 0,
                "satiety": -1
            }
        },
        "jungle": {
            "img": "systems/pl1e/assets/rest/jungle.jpg",
            "tooltip": "PL1E.JungleTooltip",
            "effects": {
                "temperature": 1,
                "tranquility": -1,
                "satiety": -1
            }
        },
        "steppes": {
            "img": "systems/pl1e/assets/rest/steppes.jpg",
            "tooltip": "PL1E.SteppesTooltip",
            "effects": {
                "temperature": 0,
                "tranquility": 0,
                "satiety": -1
            }
        },
        "plain": {
            "img": "systems/pl1e/assets/rest/plain.jpg",
            "tooltip": "PL1E.PlainTooltip",
            "effects": {
                "temperature": 0,
                "tranquility": 0,
                "satiety": 0
            }
        },
        "forest": {
            "img": "systems/pl1e/assets/rest/forest.jpg",
            "tooltip": "PL1E.ForestTooltip",
            "effects": {
                "temperature": 0,
                "tranquility": 0,
                "satiety": 0
            }
        },
        "polar": {
            "img": "systems/pl1e/assets/rest/polar.jpg",
            "tooltip": "PL1E.PolarTooltip",
            "effects": {
                "temperature": -2,
                "tranquility": -1,
                "satiety": -1
            }
        },
        "tundra": {
            "img": "systems/pl1e/assets/rest/tundra.jpg",
            "tooltip": "PL1E.TundraTooltip",
            "effects": {
                "temperature": -1,
                "tranquility": -1,
                "satiety": -1
            }
        },
        "taiga": {
            "img": "systems/pl1e/assets/rest/taiga.jpg",
            "tooltip": "PL1E.TaigaTooltip",
            "effects": {
                "temperature": -1,
                "tranquility": 0,
                "satiety": -1
            }
        }
    };

    PL1E.beds = {
        "none": {
            "img": "systems/pl1e/assets/rest/bedNone.jpg",
            "tooltip": "PL1E.BedNoneTooltip",
            "effects": {
                "tranquility": 1
            }
        },
        "poor": {
            "img": "systems/pl1e/assets/rest/bedPoor.jpg",
            "tooltip": "PL1E.BedPoorTooltip",
            "effects": {
                "tranquility": 0,
                "life": 0,
                "mana": 0
            }
        },
        "normal": {
            "img": "systems/pl1e/assets/rest/bedNormal.jpg",
            "tooltip": "PL1E.BedNormalTooltip",
            "effects": {
                "tranquility": -1,
                "life": 5,
                "mana": 10
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/bedGood.jpg",
            "tooltip": "PL1E.BedGoodTooltip",
            "effects": {
                "tranquility": -2,
                "life": 10,
                "mana": 20
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/bedLuxurious.jpg",
            "tooltip": "PL1E.BedLuxuriousTooltip",
            "effects": {
                "tranquility": -2,
                "life": 20,
                "mana": 40
            }
        }
    };

    PL1E.meals = {
        "none": {
            "img": "systems/pl1e/assets/rest/mealNone.jpg",
            "tooltip": "PL1E.MealNoneTooltip",
            "effects": {
                "satiety": 1
            }
        },
        "frugal": {
            "img": "systems/pl1e/assets/rest/mealFrugal.jpg",
            "tooltip": "PL1E.MealFrugalTooltip",
            "effects": {
                "satiety": 0,
                "life": 0,
                "endurance": 0,
            }
        },
        "normal": {
            "img": "systems/pl1e/assets/rest/mealNormal.jpg",
            "tooltip": "PL1E.MealNormalTooltip",
            "effects": {
                "satiety": -1,
                "life": 5,
                "endurance": 10,
            }
        },
        "good": {
            "img": "systems/pl1e/assets/rest/mealGood.jpg",
            "tooltip": "PL1E.MealGoodTooltip",
            "effects": {
                "satiety": -2,
                "life": 10,
                "endurance": 20,
            }
        },
        "luxurious": {
            "img": "systems/pl1e/assets/rest/mealLuxurious.jpg",
            "tooltip": "PL1E.MealLuxuriousTooltip",
            "effects": {
                "satiety": -2,
                "life": 20,
                "endurance": 40,
            }
        }
    };
}