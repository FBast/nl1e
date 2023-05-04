import {PL1E} from "./config.mjs";

export function getConfigTemplates() {
    PL1E.NPCTemplates = {
        "balanced": {
            "label": "PL1E.Balanced",
            "characteristics": {
                "strength": 3,
                "agility": 3,
                "perception": 3,
                "constitution": 3,
                "intellect": 3,
                "cunning": 3,
                "wisdom": 3,
                "will": 3
            },
            "skills": ["handling", "throwing", "accuracy", "nature", "magic", "athletics", "acrobatics", "vigilance"]
        },
        "soldier": {
            "label": "PL1E.Soldier",
            "characteristics": {
                "strength": 4,
                "agility": 4,
                "perception": 4,
                "constitution": 4,
                "intellect": 2,
                "cunning": 2,
                "wisdom": 2,
                "will": 2
            },
            "skills": ["handling", "throwing", "accuracy", "athletics", "vigilance"]
        },
        "brute": {
            "label": "PL1E.Brute",
            "characteristics": {
                "strength": 5,
                "agility": 3,
                "perception": 2,
                "constitution": 5,
                "intellect": 2,
                "cunning": 2,
                "wisdom": 2,
                "will": 3
            },
            "skills": ["handling", "athletics", "intimidation", "vigilance", "search"]
        },
        "killer": {
            "label": "PL1E.Killer",
            "characteristics": {
                "strength": 2,
                "agility": 5,
                "perception": 5,
                "constitution": 3,
                "intellect": 2,
                "cunning": 3,
                "wisdom": 2,
                "will": 2
            },
            "skills": ["accuracy", "acrobatics", "discretion", "bluff", "vigilance"]
        },
        "hunter": {
            "label": "PL1E.Hunter",
            "characteristics": {
                "strength": 5,
                "agility": 3,
                "perception": 5,
                "constitution": 3,
                "intellect": 2,
                "cunning": 2,
                "wisdom": 2,
                "will": 2
            },
            "skills": ["throwing", "acrobatics", "vigilance", "search", "craft"]
        },
        "wizard": {
            "label": "PL1E.Wizard",
            "characteristics": {
                "strength": 2,
                "agility": 2,
                "perception": 2,
                "constitution": 2,
                "intellect": 5,
                "cunning": 5,
                "wisdom": 3,
                "will": 3
            },
            "skills": ["magic", "erudition", "diplomacy", "craft", "search"]
        },
        "priest": {
            "label":  "PL1E.Priest",
            "characteristics": {
                "strength": 2,
                "agility": 2,
                "perception": 2,
                "constitution": 2,
                "intellect": 3,
                "cunning": 3,
                "wisdom": 5,
                "will": 5
            },
            "skills": ["nature", "performance", "diplomacy", "search", "vigilance"]
        },
        "mystic": {
            "label": "PL1E.Mystic",
            "characteristics": {
                "strength": 2,
                "agility": 2,
                "perception": 2,
                "constitution": 2,
                "intellect": 4,
                "cunning": 4,
                "wisdom": 4,
                "will": 4
            },
            "skills": ["magic", "nature", "erudition", "craft", "diplomacy", "performance"]
        },
        "battleMage": {
            "label": "PL1E.BattleMage",
            "characteristics": {
                "strength": 4,
                "agility": 4,
                "perception": 2,
                "constitution": 2,
                "intellect": 4,
                "cunning": 4,
                "wisdom": 2,
                "will": 2
            },
            "skills": ["handling", "magic", "diplomacy", "vigilance", "search"]
        },
        "crusader": {
            "label": "PL1E.Crusader",
            "characteristics": {
                "strength": 4,
                "agility": 4,
                "perception": 2,
                "constitution": 2,
                "intellect": 2,
                "cunning": 2,
                "wisdom": 4,
                "will": 4
            },
            "skills": ["handling", "nature", "intimidation", "search", "performance"]
        },
        "assassin": {
            "label": "PL1E.Assassin",
            "characteristics": {
                "strength": 2,
                "agility": 4,
                "perception": 4,
                "constitution": 2,
                "intellect": 4,
                "cunning": 4,
                "wisdom": 2,
                "will": 2
            },
            "skills": ["accuracy", "magic", "discretion", "bluff", "vigilance"]
        },
        "monk": {
            "label": "PL1E.Monk",
            "characteristics": {
                "strength": 2,
                "agility": 4,
                "perception": 4,
                "constitution": 2,
                "intellect": 2,
                "cunning": 2,
                "wisdom": 4,
                "will": 4
            },
            "skills": ["accuracy", "nature", "acrobatics", "performance", "vigilance"]
        }
    }

    PL1E.experienceTemplates = {
        "novice": {
            "label": "PL1E.Novice",
            "value": 10
        },
        "apprentice": {
            "label": "PL1E.Apprentice",
            "value": 20
        },
        "adept": {
            "label": "PL1E.Adept",
            "value": 30
        },
        "expert": {
            "label": "PL1E.Expert",
            "value": 40
        },
        "master": {
            "label": "PL1E.Master",
            "value": 50,
        },
        "grandMaster": {
            "label": "PL1E.GrandMaster",
            "value": 60
        }
    }
}