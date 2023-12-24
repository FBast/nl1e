import {PL1E} from "./config.mjs";

export function getConfigActor() {
    PL1E.actorTypes = {
        "character": {
            "label": "PL1E.Character",
            "droppable": ["race", "culture", "class", "feature", "weapon", "wearable", "consumable", "common", "module"],
            "itemChildren": ["race", "culture", "class", "feature", "mastery", "ability", "weapon", "wearable", "consumable", "common"]
        },
        "npc": {
            "label": "PL1E.NPC",
            "droppable": ["race", "culture", "class", "feature", "weapon", "wearable", "consumable", "common", "module"],
            "itemChildren": ["race", "culture", "class", "feature", "mastery", "ability", "weapon", "wearable", "consumable", "common"]
        },
        "merchant": {
            "label": "PL1E.Merchant",
            "droppable": ["weapon", "wearable", "consumable", "common", "module"],
            "itemChildren": []
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
                "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "occultism"]
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
                "skills": ["resilience", "performance", "occultism"]
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
            "divider": 3,
            "weights": {
                "characteristics": ["perception", "constitution"],
                "misc": []
            }
        },
        "parry": {
            "label": "PL1E.Parry",
            "fixedRank": true,
            "divider": 3,
            "weights": {
                "characteristics": ["strength", "agility"],
                "misc": []
            }
        },
        "reflex": {
            "label": "PL1E.Reflex",
            "fixedRank": true,
            "divider": 2,
            "weights": {
                "characteristics": ["agility", "perception"],
                "misc": ["flexibility"]
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
        "occultism": {
            "label": "PL1E.Occultism",
            "fixedRank": false,
            "divider": 2,
            "weights": {
                "characteristics": ["cunning", "will"],
                "misc": []
            }
        }
    }

    PL1E.money = {
        "gold": {
            "label": "PL1E.Gold",
            "icon": "fa-cube",
            "type": "number",
            "path": "system.money.gold"
        },
        "silver": {
            "label": "PL1E.Silver",
            "icon": "fa-cube",
            "type": "number",
            "path": "system.money.silver"
        },
        "copper": {
            "label": "PL1E.Copper",
            "icon": "fa-cube",
            "type": "number",
            "path": "system.money.copper"
        }
    }

    PL1E.general = {
        "experience": {
            "label": "PL1E.Experience",
            "icon": "fa-cube",
            "type": "number",
            "path": "system.general.experience"
        },
        "advantages": {
            "label": "PL1E.Advantages",
            "icon": "fa-cube",
            "type": "number",
            "path": "system.general.advantages"
        },
        "statusImmunities": {
            "label": "PL1E.StatusImmunities",
            "icon": "fa-swords",
            "type": "array",
            "path": "system.misc.statusImmunities",
            "select": "statusImmunities"
        },
        "action": {
            "label": "PL1E.Action",
            "icon": "fa-clock",
            "type": "number",
            "path": "system.general.action"
        },
        "reaction": {
            "label": "PL1E.Reaction",
            "icon": "fa-reply-clock",
            "type": "number",
            "path": "system.general.reaction"
        },
        "quickAction": {
            "label": "PL1E.QuickAction",
            "icon": "fa-bell",
            "type": "number",
            "path": "system.general.quickAction"
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

    PL1E.misc = {
        "size": {
            "label": "PL1E.Size",
            "icon": "fa-arrow-up-big-small",
            "type": "select",
            "path": "system.misc.size",
            "select": "sizes"
        },
        "sizeMultiplier": {
            "label": "PL1E.SizeMultiplier",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.sizeMultiplier"
        },
        "tokenSize": {
            "label": "PL1E.TokenSize",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.tokenSize"
        },
        "speed": {
            "label": "PL1E.Speed",
            "icon": "fa-person-running",
            "type": "select",
            "path": "system.misc.speed",
            "select": "speeds"
        },
        "movement": {
            "label": "PL1E.Movement",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.movement"
        },
        "baseInitiative": {
            "label": "PL1E.BaseInitiative",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.baseInitiative"
        },
        "initiative": {
            "label": "PL1E.Initiative",
            "icon": "fa-person-running",
            "type": "number",
            "path": "system.misc.initiative"
        },
        "unconsciousDoor": {
            "label": "PL1E.UnconsciousDoor",
            "icon": "fa-face-sleeping",
            "type": "number",
            "path": "system.misc.unconsciousDoor"
        },
        "deathDoor": {
            "label": "PL1E.DeathDoor",
            "icon": "fa-skull",
            "type": "number",
            "path": "system.misc.deathDoor"
        },
        "flexibility": {
            "label": "PL1E.Flexibility",
            "icon": "fa-weight-hanging",
            "type": "number",
            "path": "system.misc.flexibility"
        },
        "nightVisionRange": {
            "label": "PL1E.NightVisionRange",
            "icon": "fa-eye",
            "type": "number",
            "path": "system.misc.nightVisionRange"
        }
    }

    PL1E.statuses = {
        "charmed": {
            "label": "PL1E.StatusCharmed",
            "img": "systems/pl1e/assets/icons/charmed.svg",
            "type": "number"
        },
        "paralysis": {
            "label": "PL1E.StatusParalysis",
            "img": "systems/pl1e/assets/icons/paralysis.svg",
            "type": "number"
        },
        "asleep": {
            "label": "PL1E.StatusAsleep",
            "img": "systems/pl1e/assets/icons/asleep.svg",
            "type": "number"
        },
        "restrained": {
            "label": "PL1E.StatusRestrained",
            "img": "systems/pl1e/assets/icons/restrained.svg",
            "type": "number"
        },
        "slow": {
            "label": "PL1E.StatusSlow",
            "img": "systems/pl1e/assets/icons/slow.svg",
            "type": "number"
        },
        "fast": {
            "label": "PL1E.StatusFast",
            "img": "systems/pl1e/assets/icons/fast.svg",
            "type": "number"
        },
        "stunned": {
            "label": "PL1E.StatusStunned",
            "img": "systems/pl1e/assets/icons/stunned.svg",
            "type": "number"
        },
        "invigorated": {
            "label": "PL1E.StatusInvigorated",
            "img": "systems/pl1e/assets/icons/invigorated.svg",
            "type": "number"
        },
        "sick": {
            "label": "PL1E.StatusSick",
            "img": "systems/pl1e/assets/icons/sick.svg",
            "type": "number"
        },
        "healthy": {
            "label": "PL1E.StatusHealthy",
            "img": "systems/pl1e/assets/icons/healthy.svg",
            "type": "number"
        },
        "confused": {
            "label": "PL1E.StatusConfused",
            "img": "systems/pl1e/assets/icons/confused.svg",
            "type": "number"
        },
        "composed": {
            "label": "PL1E.StatusComposed",
            "img": "systems/pl1e/assets/icons/composed.svg",
            "type": "number"
        },
        "bleeding": {
            "label": "PL1E.StatusBleeding",
            "img": "systems/pl1e/assets/icons/bleeding.svg",
            "type": "number"
        },
        "regenerate": {
            "label": "PL1E.StatusRegenerate",
            "img": "systems/pl1e/assets/icons/regenerate.svg",
            "type": "number"
        },
        "downgraded": {
            "label": "PL1E.StatusDowngraded",
            "img": "systems/pl1e/assets/icons/downgraded.svg",
            "type": "number"
        },
        "upgraded": {
            "label": "PL1E.StatusUpgraded",
            "img": "systems/pl1e/assets/icons/upgraded.svg",
            "type": "number"
        },
        "blind": {
            "label": "PL1E.StatusBlind",
            "img": "systems/pl1e/assets/icons/blind.svg",
            "type": "number"
        },
        "deaf": {
            "label": "PL1E.StatusDeaf",
            "img": "systems/pl1e/assets/icons/deaf.svg",
            "type": "number"
        },
        "invisible": {
            "label": "PL1E.StatusInvisible",
            "img": "systems/pl1e/assets/icons/invisible.svg",
            "type": "number"
        },
        "clairvoyant": {
            "label": "PL1E.StatusClairvoyant",
            "img": "systems/pl1e/assets/icons/clairvoyant.svg",
            "type": "number"
        },
        "tremorsense": {
            "label": "PL1E.StatusTremorsense",
            "img": "systems/pl1e/assets/icons/tremorsense.svg",
            "type": "number"
        },
        "focus": {
            "label": "PL1E.StatusFocus",
            "img": "systems/pl1e/assets/icons/focus.svg",
            "type": "number"
        },
        "slashingImmunity": {
            "label": "PL1E.StatusSlashingImmunity",
            "img": "systems/pl1e/assets/icons/slashingImmunity.svg",
            "type": "number"
        },
        "crushingImmunity": {
            "label": "PL1E.StatusCrushingImmunity",
            "img": "systems/pl1e/assets/icons/crushingImmunity.svg",
            "type": "number"
        },
        "piercingImmunity": {
            "label": "PL1E.StatusPiercingImmunity",
            "img": "systems/pl1e/assets/icons/piercingImmunity.svg",
            "type": "number"
        },
        "fireImmunity": {
            "label": "PL1E.StatusFireImmunity",
            "img": "systems/pl1e/assets/icons/fire-shield.svg",
            "type": "number"
        },
        "coldImmunity": {
            "label": "PL1E.StatusColdImmunity",
            "img": "systems/pl1e/assets/icons/ice-shield.svg",
            "type": "number"
        },
        "shockImmunity": {
            "label": "PL1E.StatusShockImmunity",
            "img": "systems/pl1e/assets/icons/shockImmunity.svg",
            "type": "number"
        },
        "acidImmunity": {
            "label": "PL1E.StatusAcidImmunity",
            "img": "systems/pl1e/assets/icons/acidImmunity.svg",
            "type": "number"
        },
        "immortal": {
            "label": "PL1E.StatusImmortal",
            "img": "systems/pl1e/assets/icons/immortal.svg",
            "type": "number"
        }
    }

}