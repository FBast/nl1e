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

    PL1E.skillsAttributes = {
        "numberMod": {
            "label": "PL1E.NumberMod",
            "type": "number"
        },
        "diceMod": {
            "label": "PL1E.DiceMod",
            "type": "number"
        },
        "explode": {
            "label": "PL1E.Explode",
            "type": "bool"
        }
    }

    PL1E.general = {
        "advantages": {
            "label": "PL1E.Advantages",
            "icon": "fa-cube",
            "type": "number",
            "path": "system.general.advantages",
            "hidden": false
        },
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
        "quickAction": {
            "label": "PL1E.QuickAction",
            "icon": "fa-bell",
            "type": "number",
            "path": "system.misc.quickAction",
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

    PL1E.misc = {
        "statusImmunities": {
            "label": "PL1E.StatusImmunities",
            "icon": "fa-swords",
            "type": "array",
            "path": "system.misc.statusImmunities",
            "select": "statusImmunities"
        },
        "masters": {
            "label": "PL1E.Masters",
            "icon": "fa-swords",
            "type": "array",
            "path": "system.misc.masters",
            "select": "masters"
        },
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
        },
        "faithPower": {
            "label": "PL1E.FaithPower",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.faithPower"
        },
        "gesturalMagic": {
            "label": "PL1E.GesturalMagic",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.gesturalMagic"
        },
        "vocalMagic": {
            "label": "PL1E.VocalMagic",
            "icon": "fa-reply-clock",
            "type": "bool",
            "path": "system.misc.vocalMagic"
        }
    }

    PL1E.statuses = {
        "charmed": {
            "label": "PL1E.StatusCharmed",
            "img": "systems/pl1e/assets/icons/charmed.svg"
        },
        "paralysis": {
            "label": "PL1E.StatusParalysis",
            "img": "systems/pl1e/assets/icons/paralysis.svg",
        },
        "asleep": {
            "label": "PL1E.StatusAsleep",
            "img": "systems/pl1e/assets/icons/asleep.svg",
        },
        "restrained": {
            "label": "PL1E.StatusRestrained",
            "img": "systems/pl1e/assets/icons/restrained.svg",
        },
        "slow": {
            "label": "PL1E.StatusSlow",
            "img": "systems/pl1e/assets/icons/slow.svg",
        },
        "fast": {
            "label": "PL1E.StatusFast",
            "img": "systems/pl1e/assets/icons/fast.svg",
        },
        "stunned": {
            "label": "PL1E.StatusStunned",
            "img": "systems/pl1e/assets/icons/stunned.svg",
        },
        "invigorated": {
            "label": "PL1E.StatusInvigorated",
            "img": "systems/pl1e/assets/icons/invigorated.svg",
        },
        "sick": {
            "label": "PL1E.StatusSick",
            "img": "systems/pl1e/assets/icons/sick.svg",
        },
        "healthy": {
            "label": "PL1E.StatusHealthy",
            "img": "systems/pl1e/assets/icons/healthy.svg",
        },
        "confused": {
            "label": "PL1E.StatusConfused",
            "img": "systems/pl1e/assets/icons/confused.svg",
        },
        "composed": {
            "label": "PL1E.StatusComposed",
            "img": "systems/pl1e/assets/icons/composed.svg",
        },
        "bleeding": {
            "label": "PL1E.StatusBleeding",
            "img": "systems/pl1e/assets/icons/bleeding.svg",
        },
        "regenerate": {
            "label": "PL1E.StatusRegenerate",
            "img": "systems/pl1e/assets/icons/regenerate.svg",
        },
        "downgraded": {
            "label": "PL1E.StatusDowngraded",
            "img": "systems/pl1e/assets/icons/downgraded.svg",
        },
        "upgraded": {
            "label": "PL1E.StatusUpgraded",
            "img": "systems/pl1e/assets/icons/upgraded.svg",
        },
        "blind": {
            "label": "PL1E.StatusBlind",
            "img": "systems/pl1e/assets/icons/blind.svg",
        },
        "deaf": {
            "label": "PL1E.StatusDeaf",
            "img": "systems/pl1e/assets/icons/deaf.svg",
        },
        "invisible": {
            "label": "PL1E.StatusInvisible",
            "img": "systems/pl1e/assets/icons/invisible.svg",
        },
        "clairvoyant": {
            "label": "PL1E.StatusClairvoyant",
            "img": "systems/pl1e/assets/icons/clairvoyant.svg",
        },
        "tremorsense": {
            "label": "PL1E.StatusTremorsense",
            "img": "systems/pl1e/assets/icons/tremorsense.svg",
        },
        "focus": {
            "label": "PL1E.StatusFocus",
            "img": "systems/pl1e/assets/icons/focus.svg",
        },
        "slashingImmunity": {
            "label": "PL1E.StatusSlashingImmunity",
            "img": "systems/pl1e/assets/icons/slashingImmunity.svg"
        },
        "crushingImmunity": {
            "label": "PL1E.StatusCrushingImmunity",
            "img": "systems/pl1e/assets/icons/crushingImmunity.svg"
        },
        "piercingImmunity": {
            "label": "PL1E.StatusPiercingImmunity",
            "img": "systems/pl1e/assets/icons/piercingImmunity.svg"
        },
        "fireImmunity": {
            "label": "PL1E.StatusFireImmunity",
            "img": "systems/pl1e/assets/icons/fire-shield.svg"
        },
        "coldImmunity": {
            "label": "PL1E.StatusColdImmunity",
            "img": "systems/pl1e/assets/icons/ice-shield.svg"
        },
        "shockImmunity": {
            "label": "PL1E.StatusShockImmunity",
            "img": "systems/pl1e/assets/icons/shockImmunity.svg"
        },
        "acidImmunity": {
            "label": "PL1E.StatusAcidImmunity",
            "img": "systems/pl1e/assets/icons/acidImmunity.svg"
        },
        "immortal": {
            "label": "PL1E.StatusImmortal",
            "img": "systems/pl1e/assets/icons/immortal.svg"
        }
    }

}