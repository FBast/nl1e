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
            "weights": {
                "characteristics": ["intellect", "will"],
                "misc": []
            }
        },
        "intuition": {
            "label": "PL1E.Intuition",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["cunning", "wisdom"],
                "misc": []
            }
        },
        "handling": {
            "label": "PL1E.Handling",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["strength", "agility"],
                "misc": []
            }
        },
        "throwing": {
            "label": "PL1E.Throwing",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["strength", "perception"],
                "misc": []
            }
        },
        "athletics": {
            "label": "PL1E.Athletics",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["strength", "constitution"],
                "misc": ["flexibility"]
            }
        },
        "acrobatics": {
            "label": "PL1E.Acrobatics",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
            }
        },
        "accuracy": {
            "label": "PL1E.Accuracy",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
            }
        },
        "search": {
            "label": "PL1E.Search",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["cunning", "wisdom"],
                "misc": []
            }
        },
        "vigilance": {
            "label": "PL1E.Vigilance",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["perception", "wisdom"],
                "misc": []
            }
        },
        "discretion": {
            "label": "PL1E.Discretion",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
            }
        },
        "performance": {
            "label": "PL1E.Performance",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["wisdom", "will"],
                "misc": []
            }
        },
        "diplomacy": {
            "label": "PL1E.Diplomacy",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["intellect", "wisdom"],
                "misc": []
            }
        },
        "intimidation": {
            "label": "PL1E.Intimidation",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["cunning", "wisdom"],
                "misc": []
            }
        },
        "bluff": {
            "label": "PL1E.Bluff",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["intellect", "cunning"],
                "misc": []
            }
        },
        "craft": {
            "label": "PL1E.Craft",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "cunning"],
                "misc": []
            }
        },
        "erudition": {
            "label": "PL1E.Erudition",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["intellect", "cunning"],
                "misc": []
            }
        },
        "nature": {
            "label": "PL1E.Nature",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["intellect", "wisdom"],
                "misc": []
            }
        },
        "magic": {
            "label": "PL1E.Magic",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["cunning", "will"],
                "misc": []
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

    PL1E.misc = {
        "masters": {
            "label": "PL1E.Masters",
            "icon": "fa-swords",
            "type": "array",
            "path": "system.misc.masters",
            "select": "masters",
            "hidden": false
        },
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
        "comaDoor": {
            "label": "PL1E.ComaDoor",
            "icon": "fa-face-sleeping",
            "type": "number",
            "path": "system.misc.comaDoor",
            "hidden": false
        },
        "deathDoor": {
            "label": "PL1E.DeathDoor",
            "icon": "fa-skull",
            "type": "number",
            "path": "system.misc.deathDoor",
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
            "hidden": false
        },
        "gesturalMagic": {
            "label": "PL1E.GesturalMagic",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.gesturalMagic",
            "hidden": false
        },
        "vocalMagic": {
            "label": "PL1E.VocalMagic",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.vocalMagic",
            "hidden": false
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

    PL1E.statuses = {
        "stun": {
            "label": "PL1E.StatusStunned",
            "img": "icons/svg/daze.svg"
        },
        "prone": {
            "label": "PL1E.StatusProne",
            "img": "icons/svg/falling.svg",
        },
        "restrain": {
            "label": "PL1E.StatusRestrained",
            "img": "icons/svg/net.svg",
        },
        "paralysis": {
            "label": "PL1E.StatusParalysis",
            "img": "icons/svg/paralysis.svg",
        },
        // "fly": {
        //     "label": "PL1E.StatusFlying",
        //     "img": "icons/svg/wing.svg",
        // },
        "blind": {
            "label": "PL1E.StatusBlind",
            "img": "icons/svg/blind.svg",
        },
        // "deaf": {
        //     "label": "PL1E.StatusDeaf",
        //     "img": "icons/svg/deaf.svg",
        // },
        // "silence": {
        //     "label": "PL1E.StatusSilenced",
        //     "img": "icons/svg/silenced.svg",
        // },
        "fear": {
            "label": "PL1E.StatusFear",
            "img": "icons/svg/terror.svg",
        },
        "disease": {
            "label": "PL1E.StatusDisease",
            "img": "icons/svg/biohazard.svg",
        },
        "upgrade": {
            "label": "PL1E.StatusUpgrade",
            "img": "icons/svg/target.svg"
        },
        "downgrade": {
            "label": "PL1E.StatusDowngrade",
            "img": "icons/svg/downgrade.svg"
        },
        "invisible": {
            "label": "PL1E.StatusInvisible",
            "img": "icons/svg/invisible.svg",
        },
        // "target": {
        //     "label": "PL1E.StatusTarget",
        //     "img": "icons/svg/target.svg",
        // },
        // "eye": {
        //     "label": "PL1E.StatusMarked",
        //     "img": "icons/svg/eye.svg",
        // },
        "bless": {
            "label": "PL1E.StatusBlessed",
            "img": "icons/svg/angel.svg"
        },
        "curse": {
            "label": "PL1E.StatusCursed",
            "img": "icons/svg/sun.svg"
        },
        "slashingImmunity": {
            "label": "PL1E.StatusSlashingImmunity",
            "img": "systems/pl1e/assets/icons/crossed-axes.svg"
        },
        "crushingImmunity": {
            "label": "PL1E.StatusCrushingImmunity",
            "img": "systems/pl1e/assets/icons/trample.svg"
        },
        "piercingImmunity": {
            "label": "PL1E.StatusPiercingImmunity",
            "img": "systems/pl1e/assets/icons/arrow-cluster.svg"
        },
        "fireImmunity": {
            "label": "PL1E.StatusFireImmunity",
            "img": "icons/svg/fire-shield.svg"
        },
        "coldImmunity": {
            "label": "PL1E.StatusColdImmunity",
            "img": "icons/svg/ice-shield.svg"
        },
        "shockImmunity": {
            "label": "PL1E.StatusShockImmunity",
            "img": "systems/pl1e/assets/icons/lightning-shield.svg"
        },
        "acidImmunity": {
            "label": "PL1E.StatusAcidImmunity",
            "img": "systems/pl1e/assets/icons/rosa-shield.svg"
        }
    }

    PL1E.movements = {
        "standard": {
            "label": "PL1E.Standard"
        },
        "teleportation": {
            "label": "PL1E.Teleportation"
        }
    }

    PL1E.invocations = {
        "standard": {
            "label": "PL1E.Standard"
        }
    }
}