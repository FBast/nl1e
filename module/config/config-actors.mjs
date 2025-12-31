import {PL1E} from "../pl1e.mjs";

export function getConfigActor() {
    PL1E.actorTypes = {
        "character": {
            "label": "PL1E.Character",
            "droppable": ["race", "culture", "class", "feature", "weapon", "wearable", "consumable", "common", "module", "service"],
            "itemChildren": ["race", "culture", "class", "feature", "mastery", "ability", "weapon", "wearable", "consumable", "common"]
        },
        "npc": {
            "label": "PL1E.NPC",
            "droppable": ["race", "culture", "class", "feature", "weapon", "wearable", "consumable", "common", "module", "service"],
            "itemChildren": ["race", "culture", "class", "feature", "mastery", "ability", "weapon", "wearable", "consumable", "common"]
        }
    }

    PL1E.resources = {
        "health": {
            "label": "PL1E.Health",
            "multiplier": 10,
            "weights": {
                "characteristics": [
                    "constitution",
                    "will"
                ]
            },
            "icon": "fas fa-heart",
            "type": "number",
            "path": "system.resources.health.value"
        },
        "stamina": {
            "label": "PL1E.Stamina",
            "multiplier": 10,
            "weights": {
                "characteristics": [
                    "strength",
                    "constitution"
                ]
            },
            "icon": "fas fa-lungs",
            "type": "number",
            "path": "system.resources.stamina.value"
        },
        "mana": {
            "label": "PL1E.Mana",
            "multiplier": 10,
            "weights": {
                "characteristics": [
                    "intellect",
                    "will"
                ]
            },
            "icon": "fas fa-brain",
            "type": "number",
            "path": "system.resources.mana.value"
        }
    }

    PL1E.characteristics = {
        "strength": {
            "label": "PL1E.Strength",
            "short": "PL1E.StrengthShort",
            "weights": {
                "resources": ["stamina"],
                "skills": ["parry", "vigor", "handling", "throwing", "athletics"]
            },
            "icon": "far fa-fist-raised",
            "type": "number",
            "path": "system.characteristics.strength.mods"
        },
        "agility": {
            "label": "PL1E.Agility",
            "short": "PL1E.AgilityShort",
            "weights": {
                "resources": [],
                "skills": ["reflex", "handling", "acrobatics", "accuracy", "discretion", "craft"]
            },
            "icon": "far fa-running",
            "type": "number",
            "path": "system.characteristics.agility.mods"
        },
        "perception": {
            "label": "PL1E.Perception",
            "short": "PL1E.PerceptionShort",
            "weights": {
                "resources": [],
                "skills": ["reflex", "throwing", "acrobatics", "accuracy", "vigilance", "discretion"]
            },
            "icon": "far fa-eye",
            "type": "number",
            "path": "system.characteristics.perception.mods"
        },
        "constitution": {
            "label": "PL1E.Constitution",
            "short": "PL1E.ConstitutionShort",
            "weights": {
                "resources": ["health", "stamina"],
                "skills": ["parry", "vigor", "athletics"]
            },
            "icon": "far fa-fort",
            "type": "number",
            "path": "system.characteristics.constitution.mods"
        },
        "intellect": {
            "label": "PL1E.Intellect",
            "short": "PL1E.IntellectShort",
            "weights": {
                "resources": ["mana"],
                "skills": ["resilience", "diplomacy", "bluff", "erudition", "nature"]
            },
            "icon": "far fa-brain",
            "type": "number",
            "path": "system.characteristics.intellect.mods"
        },
        "cunning": {
            "label": "PL1E.Cunning",
            "short": "PL1E.CunningShort",
            "weights": {
                "resources": [],
                "skills": ["intuition", "search", "intimidation", "bluff", "craft", "erudition", "occultism"]
            },
            "icon": "far fa-user-secret",
            "type": "number",
            "path": "system.characteristics.cunning.mods"
        },
        "wisdom": {
            "label": "PL1E.Wisdom",
            "short": "PL1E.WisdomShort",
            "weights": {
                "resources": [],
                "skills": ["intuition", "search", "vigilance", "performance", "diplomacy", "intimidation", "nature"]
            },
            "icon": "far fa-book-open",
            "type": "number",
            "path": "system.characteristics.wisdom.mods"
        },
        "will": {
            "label": "PL1E.Will",
            "short": "PL1E.WillShort",
            "weights": {
                "resources": ["health", "mana"],
                "skills": ["resilience", "performance", "occultism"]
            },
            "icon": "far fa-anchor",
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
            "label": "PL1E.GoldCoins",
            "icon": "far fa-coins color-gold",
            "type": "number",
            "path": "system.money.gold",
            "img": "systems/pl1e/assets/coins/coins-crown-stack-gold.webp",
            "conversions": {
                "silver": 10,
                "copper": 100
            },
            "controls": {
                "convertUp": null,
                "convertDown": "silver"
            }
        },
        "silver": {
            "label": "PL1E.SilverCoins",
            "icon": "far fa-coins color-silver",
            "type": "number",
            "path": "system.money.silver",
            "img": "systems/pl1e/assets/coins/coins-shield-sword-stack-silver.webp",
            "conversions": {
                "gold": 0.1,
                "copper": 10
            },
            "controls": {
                "convertUp": "gold",
                "convertDown": "copper"
            }
        },
        "copper": {
            "label": "PL1E.CopperCoins",
            "icon": "far fa-coins color-copper",
            "type": "number",
            "path": "system.money.copper",
            "img": "systems/pl1e/assets/coins/coins-wheat-stack-copper.webp",
            "conversions": {
                "gold": 0.01,
                "silver": 0.1
            },
            "controls": {
                "convertUp": "silver",
                "convertDown": null
            }
        }
    };

    PL1E.general = {
        "level": {
            "label": "PL1E.Level",
            "icon": "far fa-trophy",
            "type": "number",
            "path": "system.general.level",
            "header": false
        },
        "experience": {
            "label": "PL1E.Experience",
            "icon": "far fa-cube",
            "type": "number",
            "path": "system.general.experience",
            "header": false
        },
        "remainingCharacteristics": {
            "label": "PL1E.RemainingCharacteristics",
            "icon": "far fa-puzzle-piece",
            "type": "number",
            "path": "system.general.remainingCharacteristics",
            "header": true,
            "default": 0
        },
        "ranks": {
            "label": "PL1E.Ranks",
            "icon": "far fa-circle-x",
            "type": "number",
            "path": "system.general.ranks",
            "header": true,
            "default": 0
        },
        "maxRank": {
            "label": "PL1E.MaxRank",
            "icon": "far fa-circle-chevron-up",
            "type": "number",
            "path": "system.general.maxRank",
            "header": true
        },
        "advantages": {
            "label": "PL1E.Advantages",
            "icon": "far fa-cube",
            "type": "number",
            "path": "system.general.advantages",
            "header": false
        },
        "statusImmunities": {
            "label": "PL1E.StatusImmunities",
            "icon": "far fa-swords",
            "type": "array",
            "path": "system.misc.statusImmunities",
            "select": "statusImmunities",
            "header": false
        },
        "action": {
            "label": "PL1E.Action",
            "icon": "far fa-clock",
            "type": "number",
            "path": "system.general.action",
            "header": true,
            "default": 2
        },
        "reaction": {
            "label": "PL1E.Reaction",
            "icon": "far fa-reply-clock",
            "type": "number",
            "path": "system.general.reaction",
            "header": true,
            "default": 1
        },
        "quickAction": {
            "label": "PL1E.QuickAction",
            "icon": "far fa-bell",
            "type": "number",
            "path": "system.general.quickAction",
            "header": true,
            "default": 1
        }
    }

    PL1E.reductions = {
        "slashing": {
            "label": "PL1E.SlashingReduction",
            "icon": "far fa-axe-battle",
            "type": "number",
            "path": "system.reductions.slashing",
            "header": true
        },
        "crushing": {
            "label": "PL1E.CrushingReduction",
            "icon": "far fa-hammer-war",
            "type": "number",
            "path": "system.reductions.crushing",
            "header": true
        },
        "piercing": {
            "label": "PL1E.PiercingReduction",
            "icon": "far fa-dagger",
            "type": "number",
            "path": "system.reductions.piercing",
            "header": true
        },
        "burn": {
            "label": "PL1E.BurnReduction",
            "icon": "far fa-fire",
            "type": "number",
            "path": "system.reductions.burn",
            "header": true
        },
        "cold": {
            "label": "PL1E.ColdReduction",
            "icon": "far fa-snowflake",
            "type": "number",
            "path": "system.reductions.cold",
            "header": true
        },
        "acid": {
            "label": "PL1E.AcidReduction",
            "icon": "far fa-droplet",
            "type": "number",
            "path": "system.reductions.acid",
            "header": true
        },
        "shock": {
            "label": "PL1E.ShockReduction",
            "icon": "far fa-bolt",
            "type": "number",
            "path": "system.reductions.shock",
            "header": true
        },
        "entropy": {
            "label": "PL1E.EntropyReduction",
            "icon": "far fa-ghost",
            "type": "number",
            "path": "system.reductions.entropy",
            "header": true
        },
    }

    PL1E.misc = {
        "size": {
            "label": "PL1E.Size",
            "icon": "far fa-arrow-up-big-small",
            "type": "select",
            "path": "system.misc.size",
            "select": "sizes",
            "header": false
        },
        "sizeMultiplier": {
            "label": "PL1E.SizeMultiplier",
            "icon": "far fa-arrow-up-big-small",
            "type": "number",
            "path": "system.misc.sizeMultiplier",
            "header": true,
            "default": 1
        },
        "tokenSize": {
            "label": "PL1E.TokenSize",
            "icon": "far fa-person-running",
            "type": "number",
            "path": "system.misc.tokenSize",
            "header": false
        },
        "speed": {
            "label": "PL1E.Speed",
            "icon": "far fa-person-running",
            "type": "select",
            "path": "system.misc.speed",
            "select": "speeds",
            "header": false
        },
        "movement": {
            "label": "PL1E.Movement",
            "icon": "far fa-person-running",
            "type": "number",
            "path": "system.misc.movement",
            "header": true,
            "default": 4
        },
        "baseInitiative": {
            "label": "PL1E.BaseInitiative",
            "icon": "far fa-flag",
            "type": "number",
            "path": "system.misc.baseInitiative",
            "header": false,
            "default": 10
        },
        "initiative": {
            "label": "PL1E.Initiative",
            "icon": "far fa-flag",
            "type": "number",
            "path": "system.misc.initiative",
            "header": true
        },
        "hunger": {
            "label": "PL1E.Hunger",
            "icon": "far fa-stomach",
            "type": "number",
            "path": "system.misc.hunger",
            "header": true,
            "default": 3
        },
        "intoxication": {
            "label": "PL1E.Intoxication",
            "icon": "far fa-skull-crossbones",
            "type": "number",
            "path": "system.misc.intoxication",
            "header": true,
            "default": 0
        },
        "unconsciousDoor": {
            "label": "PL1E.UnconsciousDoor",
            "icon": "far fa-face-sleeping",
            "type": "number",
            "path": "system.misc.unconsciousDoor",
            "header": true,
            "default": 0
        },
        "deathDoor": {
            "label": "PL1E.DeathDoor",
            "icon": "far fa-skull",
            "type": "number",
            "path": "system.misc.deathDoor",
            "header": true,
            "default": 10
        },
        "flexibility": {
            "label": "PL1E.Flexibility",
            "icon": "far fa-weight-hanging",
            "type": "number",
            "path": "system.misc.flexibility",
            "header": true,
            "default": 0
        },
        "nightVisionRange": {
            "label": "PL1E.NightVisionRange",
            "icon": "far fa-eye",
            "type": "number",
            "path": "system.misc.nightVisionRange",
            "header": true,
            "default": 0
        }
    }

    PL1E.statuses = {
        "charmed": {
            "label": "PL1E.StatusCharmed",
            "img": "systems/pl1e/assets/svg/charmed.svg",
            "type": "status"
        },
        "paralysis": {
            "label": "PL1E.StatusParalysis",
            "img": "systems/pl1e/assets/svg/paralysis.svg",
            "type": "status"
        },
        "asleep": {
            "label": "PL1E.StatusAsleep",
            "img": "systems/pl1e/assets/svg/asleep.svg",
            "type": "status"
        },
        "restrained": {
            "label": "PL1E.StatusRestrained",
            "img": "systems/pl1e/assets/svg/restrained.svg",
            "type": "status"
        },
        "slow": {
            "label": "PL1E.StatusSlow",
            "img": "systems/pl1e/assets/svg/slow.svg",
            "type": "status"
        },
        "fast": {
            "label": "PL1E.StatusFast",
            "img": "systems/pl1e/assets/svg/fast.svg",
            "type": "status"
        },
        "stunned": {
            "label": "PL1E.StatusStunned",
            "img": "systems/pl1e/assets/svg/stunned.svg",
            "type": "status"
        },
        "invigorated": {
            "label": "PL1E.StatusInvigorated",
            "img": "systems/pl1e/assets/svg/invigorated.svg",
            "type": "status"
        },
        "sick": {
            "label": "PL1E.StatusSick",
            "img": "systems/pl1e/assets/svg/sick.svg",
            "type": "status"
        },
        "healthy": {
            "label": "PL1E.StatusHealthy",
            "img": "systems/pl1e/assets/svg/healthy.svg",
            "type": "status"
        },
        "confused": {
            "label": "PL1E.StatusConfused",
            "img": "systems/pl1e/assets/svg/confused.svg",
            "type": "status"
        },
        "focused": {
            "label": "PL1E.StatusFocused",
            "img": "systems/pl1e/assets/svg/focused.svg",
            "type": "status"
        },
        "bleeding": {
            "label": "PL1E.StatusBleeding",
            "img": "systems/pl1e/assets/svg/bleeding.svg",
            "type": "status"
        },
        "regenerate": {
            "label": "PL1E.StatusRegenerate",
            "img": "systems/pl1e/assets/svg/regenerate.svg",
            "type": "status"
        },
        "downgraded": {
            "label": "PL1E.StatusDowngraded",
            "img": "systems/pl1e/assets/svg/downgraded.svg",
            "type": "status"
        },
        "upgraded": {
            "label": "PL1E.StatusUpgraded",
            "img": "systems/pl1e/assets/svg/upgraded.svg",
            "type": "status"
        },
        "blind": {
            "label": "PL1E.StatusBlind",
            "img": "systems/pl1e/assets/svg/blind.svg",
            "type": "status"
        },
        "deaf": {
            "label": "PL1E.StatusDeaf",
            "img": "systems/pl1e/assets/svg/deaf.svg",
            "type": "status"
        },
        "invisible": {
            "label": "PL1E.StatusInvisible",
            "img": "systems/pl1e/assets/svg/invisible.svg",
            "type": "status"
        },
        "clairvoyant": {
            "label": "PL1E.StatusClairvoyant",
            "img": "systems/pl1e/assets/svg/clairvoyant.svg",
            "type": "status"
        },
        "tremorsense": {
            "label": "PL1E.StatusTremorsense",
            "img": "systems/pl1e/assets/svg/tremorsense.svg",
            "type": "status"
        },
        "slashingImmunity": {
            "label": "PL1E.StatusSlashingImmunity",
            "img": "systems/pl1e/assets/svg/slashingImmunity.svg",
            "type": "status"
        },
        "crushingImmunity": {
            "label": "PL1E.StatusCrushingImmunity",
            "img": "systems/pl1e/assets/svg/crushingImmunity.svg",
            "type": "status"
        },
        "piercingImmunity": {
            "label": "PL1E.StatusPiercingImmunity",
            "img": "systems/pl1e/assets/svg/piercingImmunity.svg",
            "type": "status"
        },
        "fireImmunity": {
            "label": "PL1E.StatusFireImmunity",
            "img": "systems/pl1e/assets/svg/fire-shield.svg",
            "type": "status"
        },
        "coldImmunity": {
            "label": "PL1E.StatusColdImmunity",
            "img": "systems/pl1e/assets/svg/ice-shield.svg",
            "type": "status"
        },
        "shockImmunity": {
            "label": "PL1E.StatusShockImmunity",
            "img": "systems/pl1e/assets/svg/shockImmunity.svg",
            "type": "status"
        },
        "acidImmunity": {
            "label": "PL1E.StatusAcidImmunity",
            "img": "systems/pl1e/assets/svg/acidImmunity.svg",
            "type": "status"
        },
        "immortal": {
            "label": "PL1E.StatusImmortal",
            "img": "systems/pl1e/assets/svg/immortal.svg",
            "type": "status"
        }
    }
}