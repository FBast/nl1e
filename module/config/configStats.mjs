import {PL1E} from "./config.mjs";

export function getStats() {
    PL1E.resources = {
        "health": {
            "label": "PL1E.Health",
            "multiplier" : 10,
            "weights": {
                "characteristics": [
                    "constitution",
                    "will"
                ]
            },
            "icon": "fa-heart",
            "type": "number",
            "path": "system.resources.health.value"
        },
        "stamina": {
            "label": "PL1E.Stamina",
            "multiplier" : 10,
            "weights": {
                "characteristics": [
                    "strength",
                    "constitution"
                ]
            },
            "icon": "fa-wave-pulse",
            "type": "number",
            "path": "system.resources.stamina.value"
        },
        "mana": {
            "label": "PL1E.Mana",
            "multiplier" : 10,
            "weights": {
                "characteristics": [
                    "intellect",
                    "will"
                ]
            },
            "icon": "fa-sparkles",
            "type": "number",
            "path": "system.resources.mana.value"
        }
    }

    PL1E.characteristics = {
        "strength": {
            "label": "PL1E.Strength",
            "weights": {
                "resources": ["stamina"],
                "skills": ["parry", "vigor", "handling", "throwing", "athletics"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.strength.mods"
        },
        "agility": {
            "label": "PL1E.Agility",
            "weights": {
                "resources": [],
                "skills": ["dodge", "reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.agility.mods"
        },
        "perception": {
            "label": "PL1E.Perception",
            "weights": {
                "resources": [],
                "skills": ["dodge", "reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.perception.mods"
        },
        "constitution": {
            "label": "PL1E.Constitution",
            "weights": {
                "resources": ["health", "stamina"],
                "skills": ["parry", "vigor", "athletics"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.constitution.mods"
        },
        "intellect": {
            "label": "PL1E.Intellect",
            "weights": {
                "resources": ["mana"],
                "skills": ["resilience", "diplomacy", "bluff", "erudition", "secularMagic"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.intellect.mods"
        },
        "cunning": {
            "label": "PL1E.Cunning",
            "weights": {
                "resources": [],
                "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "secularMagic"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.cunning.mods"
        },
        "wisdom": {
            "label": "PL1E.Wisdom",
            "weights": {
                "resources": [],
                "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "divineMagic"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.wisdom.mods"
        },
        "will": {
            "label": "PL1E.Will",
            "weights": {
                "resources": ["health", "mana"],
                "skills": ["resilience", "performance", "handling", "divineMagic"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.will.mods"
        }
    }

    PL1E.skills = {
        "parry": {
            "label": "PL1E.Parry",
            "fixedRank": true,
            "divider": 3,
            "weights": {
                "characteristics": ["strength", "constitution"],
                "misc": ["parryBonuses"]
            }
        },
        "dodge": {
            "label": "PL1E.Dodge",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["dodgeBonuses", "movementPenalty"]
            }
        },
        "vigor": {
            "label": "PL1E.Vigor",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["strength", "constitution"]
            }
        },
        "reflex": {
            "label": "PL1E.Reflex",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["movementPenalty"]
            }
        },
        "resilience": {
            "label": "PL1E.Resilience",
            "fixedRank": true,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "will"]
            }
        },
        "intuition": {
            "label": "PL1E.Intuition",
            "fixedRank": true,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["cunning", "wisdom"]
            }
        },
        "handling": {
            "label": "PL1E.Handling",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["strength", "agility"]
            }
        },
        "throwing": {
            "label": "PL1E.Throwing",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["strength", "perception"]
            }
        },
        "athletics": {
            "label": "PL1E.Athletics",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["strength", "constitution"],
                "misc": ["movementPenalty"]
            }
        },
        "acrobatics": {
            "label": "PL1E.Acrobatics",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["movementPenalty"]
            }
        },
        "accuracy": {
            "label": "PL1E.Accuracy",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["movementPenalty"]
            }
        },
        "search": {
            "label": "PL1E.Search",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["cunning", "wisdom"]
            }
        },
        "vigilance": {
            "label": "PL1E.Vigilance",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["perception", "wisdom"]
            }
        },
        "discretion": {
            "label": "PL1E.Discretion",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["movementPenalty"]
            }
        },
        "performance": {
            "label": "PL1E.Performance",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["wisdom", "will"]
            }
        },
        "diplomacy": {
            "label": "PL1E.Diplomacy",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "wisdom"]
            }
        },
        "intimidation": {
            "label": "PL1E.Intimidation",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["cunning", "wisdom"]
            }
        },
        "bluff": {
            "label": "PL1E.Bluff",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "cunning"]
            }
        },
        "craft": {
            "label": "PL1E.Craft",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "cunning"]
            }
        },
        "erudition": {
            "label": "PL1E.Erudition",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "cunning"]
            }
        },
        "divineMagic": {
            "label": "PL1E.DivineMagic",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": true,
            "weights": {
                "characteristics": ["wisdom", "will"],
                "misc": ["movementPenalty"]
            }
        },
        "secularMagic": {
            "label": "PL1E.SecularMagic",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": true,
            "weights": {
                "characteristics": ["intellect", "cunning"],
                "misc": ["movementPenalty"]
            }
        }
    }

    PL1E.sizes = {
        "small": {
            "label": "PL1E.Small",
            "multiplier": "0.5",
            "token": "1"
        },
        "medium": {
            "label": "PL1E.Medium",
            "multiplier": "1",
            "token": "1"
        },
        "large": {
            "label": "PL1E.Large",
            "multiplier": "2",
            "token": "2",
        },
        "huge": {
            "label": "PL1E.Huge",
            "multiplier": "3",
            "token": "3"
        },
        "gargantuan": {
            "label": "PL1E.Gargantuan",
            "multiplier": "4",
            "token": "4"
        }
    }

    PL1E.misc = {
        "size": {
            "label": "PL1E.Size",
            "icon": "fa-arrow-up-big-small",
            "type": "select",
            "path": "system.misc.size",
            "select": "sizes"
        },
        "speed": {
            "label": "PL1E.Speed",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.speed"
        },
        "initiative": {
            "label": "PL1E.Initiative",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.initiative"
        },
        "movementPenalty": {
            "label": "PL1E.MovementPenalty",
            "icon": "fa-weight-hanging",
            "type": "number",
            "path": "system.misc.movementPenalty"
        },
        "parryBonuses": {
            "label": "PL1E.ParryBonuses",
            "icon": "fa-shield",
            "type": "number",
            "path": "system.misc.parryBonuses"
        },
        "dodgeBonuses": {
            "label": "PL1E.DodgeBonuses",
            "icon": "fa-eye",
            "type": "number",
            "path": "system.misc.dodgeBonuses"
        },
        "nightVision": {
            "label": "PL1E.NightVision",
            "icon": "fa-eye",
            "type": "number",
            "path": "system.misc.nightVision"
        }
    }

    PL1E.reductions = {
        "slashing": {
            "label": "PL1E.Slashing",
            "icon": "fa-axe-battle",
            "type": "number",
            "path": "system.reductions.slashing"
        },
        "crushing": {
            "label": "PL1E.Crushing",
            "icon": "fa-hammer-war",
            "type": "number",
            "path": "system.reductions.crushing"
        },
        "piercing": {
            "label": "PL1E.Piercing",
            "icon": "fa-dagger",
            "type": "number",
            "path": "system.reductions.piercing"
        },
        "burn": {
            "label": "PL1E.Burn",
            "icon": "fa-fire",
            "type": "number",
            "path": "system.reductions.burn"
        },
        "cold": {
            "label": "PL1E.Cold",
            "icon": "fa-snowflake",
            "type": "number",
            "path": "system.reductions.cold"
        },
        "acid": {
            "label": "PL1E.Acid",
            "icon": "fa-droplet",
            "type": "number",
            "path": "system.reductions.acid"
        },
        "shock": {
            "label": "PL1E.Shock",
            "icon": "fa-bolt",
            "type": "number",
            "path": "system.reductions.shock"
        },
    }
}