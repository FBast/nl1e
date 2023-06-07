import {PL1E} from "./config.mjs";

export function getConfigJournals() {
    PL1E.locationTypes = {
        "city": "PL1E.City",
        "town": "PL1E.Town",
        "village": "PL1E.Village",
        "fort": "PL1E.Fort",
        "temple": "PL1E.Temple",
        "area": "PL1E.Area"
    }

    PL1E.climates = {
        "special": "PL1E.Special",
        "polar": "PL1E.Polar",
        "subarctic": "PL1E.SubArctic",
        "temperate": "PL1E.Temperate",
        "arid": "PL1E.Arid",
        "subtropical": "PL1E.SubTropical",
        "tropical": "PL1E.Tropical",
    }

    PL1E.organizationType = {
        "nation": "PL1E.Nation",
        "guild": "PL1E.Guild",
        "cult": "PL1E.Cult",
        "family": "PL1E.Family"
    }

    PL1E.powers = {
        "null": "PL1E.Null",
        "trivial": "PL1E.Trivial",
        "weak": "PL1E.Weak",
        "real": "PL1E.Real",
        "substantial": "PL1E.Substantial",
        "mighty": "PL1E.Mighty",
        "extreme": "PL1E.Extreme",
        "divine": "PL1E.Divine",
        "unfathomable": "PL1E.Unfathomable"
    }
}