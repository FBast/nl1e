import {PL1E} from "./config.mjs";

export function getConfigActor() {
    PL1E.actors = {
        "character": {
            "droppable": ["feature", "ability", "weapon", "wearable", "consumable", "common"]
        },
        "npc": {
            "droppable": ["feature", "ability", "weapon", "wearable", "consumable", "common"]
        },
        "merchant": {
            "droppable": ["feature", "ability", "weapon", "wearable", "consumable", "common"]
        }
    }

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
                "skills": ["reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.agility.mods"
        },
        "perception": {
            "label": "PL1E.Perception",
            "weights": {
                "resources": [],
                "skills": ["reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
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
                "skills": ["resilience", "diplomacy", "bluff", "erudition", "nature"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.intellect.mods"
        },
        "cunning": {
            "label": "PL1E.Cunning",
            "weights": {
                "resources": [],
                "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "magic"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.cunning.mods"
        },
        "wisdom": {
            "label": "PL1E.Wisdom",
            "weights": {
                "resources": [],
                "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "nature"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.wisdom.mods"
        },
        "will": {
            "label": "PL1E.Will",
            "weights": {
                "resources": ["health", "mana"],
                "skills": ["resilience", "performance", "magic"]
            },
            "icon": "fa-dumbbell",
            "type": "number",
            "path": "system.characteristics.will.mods"
        }
    }

    PL1E.skills = {
        "cover": {
            "label": "PL1E.Cover",
            "fixedRank": true,
            "divider": 1,
            "weights": {
                "characteristics": [],
                "misc": ["coverBonuses"]
            }
        },
        "parry": {
            "label": "PL1E.Parry",
            "fixedRank": true,
            "divider": 3,
            "weights": {
                "characteristics": ["strength", "constitution"],
                "misc": ["parryBonuses"]
            }
        },
        "reflex": {
            "label": "PL1E.Reflex",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["reflexBonuses", "flexibility"]
            }
        },
        "vigor": {
            "label": "PL1E.Vigor",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["strength", "constitution"],
                "misc": []
            }
        },
        "resilience": {
            "label": "PL1E.Resilience",
            "fixedRank": true,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "will"],
                "misc": []
            }
        },
        "intuition": {
            "label": "PL1E.Intuition",
            "fixedRank": true,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["cunning", "wisdom"],
                "misc": []
            }
        },
        "handling": {
            "label": "PL1E.Handling",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["strength", "agility"],
                "misc": []
            }
        },
        "throwing": {
            "label": "PL1E.Throwing",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["strength", "perception"],
                "misc": []
            }
        },
        "athletics": {
            "label": "PL1E.Athletics",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["strength", "constitution"],
                "misc": ["flexibility"]
            }
        },
        "acrobatics": {
            "label": "PL1E.Acrobatics",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
            }
        },
        "accuracy": {
            "label": "PL1E.Accuracy",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
            }
        },
        "search": {
            "label": "PL1E.Search",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["cunning", "wisdom"],
                "misc": []
            }
        },
        "vigilance": {
            "label": "PL1E.Vigilance",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["perception", "wisdom"],
                "misc": []
            }
        },
        "discretion": {
            "label": "PL1E.Discretion",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
            }
        },
        "performance": {
            "label": "PL1E.Performance",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["wisdom", "will"],
                "misc": []
            }
        },
        "diplomacy": {
            "label": "PL1E.Diplomacy",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "wisdom"],
                "misc": []
            }
        },
        "intimidation": {
            "label": "PL1E.Intimidation",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["cunning", "wisdom"],
                "misc": []
            }
        },
        "bluff": {
            "label": "PL1E.Bluff",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "cunning"],
                "misc": []
            }
        },
        "craft": {
            "label": "PL1E.Craft",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["agility", "cunning"],
                "misc": []
            }
        },
        "erudition": {
            "label": "PL1E.Erudition",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": false,
            "weights": {
                "characteristics": ["intellect", "cunning"],
                "misc": []
            }
        },
        "nature": {
            "label": "PL1E.Nature",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": true,
            "weights": {
                "characteristics": ["intellect", "wisdom"],
                "misc": []
            }
        },
        "magic": {
            "label": "PL1E.Magic",
            "fixedRank": false,
            "divider": 2,
            "magicPenalty": true,
            "weights": {
                "characteristics": ["cunning", "will"],
                "misc": ["flexibility"]
            }
        }
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
            "movement": 1.5,
            "baseInitiative": 0
        },
        "slow": {
            "label": "PL1E.Slow",
            "movement": 3,
            "baseInitiative": 5
        },
        "medium": {
            "label": "PL1E.Medium",
            "movement": 4.5,
            "baseInitiative": 10
        },
        "fast": {
            "label": "PL1E.Fast",
            "movement": 6,
            "baseInitiative": 15
        },
        "veryFast": {
            "label": "PL1E.VeryFast",
            "movement": 7.5,
            "baseInitiative": 20
        }
    }

    PL1E.misc = {
        "size": {
            "label": "PL1E.Size",
            "icon": "fa-arrow-up-big-small",
            "type": "select",
            "path": "system.misc.size",
            "select": "sizes",
            "hidden": false
        },
        "sizeMultiplier": {
            "label": "PL1E.SizeMultiplier",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.sizeMultiplier",
            "hidden": false
        },
        "tokenSize": {
            "label": "PL1E.TokenSize",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.tokenSize",
            "hidden": false
        },
        "speed": {
            "label": "PL1E.Speed",
            "icon": "fa-person-running",
            "type": "select",
            "path": "system.misc.speed",
            "select": "speeds",
            "hidden": false
        },
        "movement": {
            "label": "PL1E.Movement",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.movement",
            "hidden": false
        },
        "baseInitiative": {
            "label": "PL1E.BaseInitiative",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.baseInitiative",
            "hidden": false
        },
        "initiative": {
            "label": "PL1E.Initiative",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.initiative",
            "hidden": false
        },
        "remainingMovement": {
            "label": "PL1E.RemainingMovement",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.remainingMovement",
            "hidden": false
        },
        "flexibility": {
            "label": "PL1E.Flexibility",
            "icon": "fa-weight-hanging",
            "type": "number",
            "path": "system.misc.flexibility",
            "hidden": false
        },
        "coverBonuses": {
            "label": "PL1E.CoverBonuses",
            "icon": "fa-shield",
            "type": "number",
            "path": "system.misc.coverBonuses",
            "hidden": false
        },
        "parryBonuses": {
            "label": "PL1E.ParryBonuses",
            "icon": "fa-swords",
            "type": "number",
            "path": "system.misc.parryBonuses",
            "hidden": false
        },
        "reflexBonuses": {
            "label": "PL1E.ReflexBonuses",
            "icon": "fa-eye",
            "type": "number",
            "path": "system.misc.reflexBonuses",
            "hidden": false
        },
        "nightVisionRange": {
            "label": "PL1E.NightVisionRange",
            "icon": "fa-eye",
            "type": "number",
            "path": "system.misc.nightVisionRange",
            "hidden": false
        },
        // "feelTremorRange": {
        //     "label": "PL1E.FeelTremor",
        //     "icon": "fa-eye",
        //     "type": "number",
        //     "path": "system.misc.feelTremorRange",
        //     "hidden": false
        // },
        "action": {
            "label": "PL1E.Action",
            "icon": "fa-clock",
            "type": "number",
            "path": "system.misc.action",
            "hidden": false
        },
        "reaction": {
            "label": "PL1E.Reaction",
            "icon": "fa-reply-clock",
            "type": "number",
            "path": "system.misc.reaction",
            "hidden": false
        },
        "faithPower": {
            "label": "PL1E.FaithPower",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.faithPower",
            "hidden": true
        }
    }

    PL1E.reductions = {
        "slashing": {
            "label": "PL1E.SlashingReduction",
            "icon": "fa-axe-battle",
            "type": "number",
            "path": "system.reductions.slashing"
        },
        "crushing": {
            "label": "PL1E.CrushingReduction",
            "icon": "fa-hammer-war",
            "type": "number",
            "path": "system.reductions.crushing"
        },
        "piercing": {
            "label": "PL1E.PiercingReduction",
            "icon": "fa-dagger",
            "type": "number",
            "path": "system.reductions.piercing"
        },
        "burn": {
            "label": "PL1E.BurnReduction",
            "icon": "fa-fire",
            "type": "number",
            "path": "system.reductions.burn"
        },
        "cold": {
            "label": "PL1E.ColdReduction",
            "icon": "fa-snowflake",
            "type": "number",
            "path": "system.reductions.cold"
        },
        "acid": {
            "label": "PL1E.AcidReduction",
            "icon": "fa-droplet",
            "type": "number",
            "path": "system.reductions.acid"
        },
        "shock": {
            "label": "PL1E.ShockReduction",
            "icon": "fa-bolt",
            "type": "number",
            "path": "system.reductions.shock"
        }
    }

    PL1E.status = {
        "dead": {
            "label": "PL1E.Dead",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.dead"
        },
        "unconscious": {
            "label": "PL1E.Unconscious",
            "img": "icons/svg/unconscious.svg",
            "type": "bool",
            "path": "system.status.unconscious"
        },
        "asleep": {
            "label": "PL1E.Asleep",
            "img": "icons/svg/sleep.svg",
            "type": "bool",
            "path": "system.status.asleep"
        },
        "stunned": {
            "label": "PL1E.Stunned",
            "img": "icons/svg/daze.svg",
            "type": "bool",
            "path": "system.status.stunned"
        },
        "prone": {
            "label": "PL1E.Prone",
            "img": "icons/svg/falling.svg",
            "type": "bool",
            "path": "system.status.prone"
        },
        "restrained": {
            "label": "PL1E.Restrained",
            "img": "icons/svg/net.svg",
            "type": "bool",
            "path": "system.status.restrained"
        },
        "paralysed": {
            "label": "PL1E.Paralysed",
            "img": "icons/svg/paralysis.svg",
            "type": "bool",
            "path": "system.status.paralysed"
        },
        "flying": {
            "label": "PL1E.Flying",
            "img": "icons/svg/wing.svg",
            "type": "bool",
            "path": "system.status.flying"
        },
        "blind": {
            "label": "PL1E.Blind",
            "img": "icons/svg/blind.svg",
            "type": "bool",
            "path": "system.status.blind"
        },
        "deaf": {
            "label": "PL1E.Deaf",
            "img": "icons/svg/deaf.svg",
            "type": "bool",
            "path": "system.status.deaf"
        },
        "silenced": {
            "label": "PL1E.Silenced",
            "img": "icons/svg/silenced.svg",
            "type": "bool",
            "path": "system.status.silenced"
        },
        "frightened": {
            "label": "PL1E.Frightened",
            "img": "icons/svg/terror.svg",
            "type": "bool",
            "path": "system.status.frightened"
        },
        "cursed": {
            "label": "PL1E.Cursed",
            "img": "icons/svg/sun.svg",
            "type": "bool",
            "path": "system.status.cursed"
        },
        "invisible": {
            "label": "PL1E.Invisible",
            "img": "icons/svg/invisible.svg",
            "type": "bool",
            "path": "system.status.invisible"
        },
        "targeted": {
            "label": "PL1E.Targeted",
            "img": "icons/svg/target.svg",
            "type": "bool",
            "path": "system.status.targeted"
        },
        "marked": {
            "label": "PL1E.Marked",
            "img": "icons/svg/eye.svg",
            "type": "bool",
            "path": "system.status.marked"
        },
        "blessed": {
            "label": "PL1E.Blessed",
            "img": "icons/svg/angel.svg",
            "type": "bool",
            "path": "system.status.blessed"
        },
        "slashingImmunity": {
            "label": "PL1E.SlashingImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.slashingImmunity"
        },
        "piercingImmunity": {
            "label": "PL1E.PiercingImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.piercingImmunity"
        },
        "crushingImmunity": {
            "label": "PL1E.CrushingImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.crushingImmunity"
        },
        "burnImmunity": {
            "label": "PL1E.BurnImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.burnImmunity"
        },
        "coldImmunity": {
            "label": "PL1E.ColdImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.coldImmunity"
        },
        "acidImmunity": {
            "label": "PL1E.AcidImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.acidImmunity"
        },
        "shockImmunity": {
            "label": "PL1E.ShockImmunity",
            "img": "icons/svg/skull.svg",
            "type": "bool",
            "path": "system.status.shockImmunity"
        }
    }
}