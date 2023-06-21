import {PL1E} from "./config.mjs";

export function getConfigJournals() {
    PL1E.locationTypes = {
        "area": "PL1E.Area",
        "settlement": "PL1E.Settlement",
        "building": "PL1E.Building"
    }

    PL1E.areaTypes = {
        "none": "PL1E.None",
        "forest": "PL1E.Forest",
        "mountains": "PL1E.Mountains",
        "mesa": "PL1E.Mesa",
        "plain": "PL1E.Plain",
        "swamp": "PL1E.Swamp",
        "dunes": "PL1E.Dunes",
        "bay": "PL1E.Bay",
        "coastline": "PL1E.Coastline",
        "strait": "PL1E.Strait",
        "island": "PL1E.Island",
        "archipelago": "PL1E.Archipelago",
        "sea": "PL1E.Sea",
        "wall": "PL1E.Wall",
        "anomaly": "PL1E.Anomaly"
    }

    PL1E.settlementTypes = {
        "city": "PL1E.City",
        "town": "PL1E.Town",
        "village": "PL1E.Village",
        "fort": "PL1E.Fort",
        "temple": "PL1E.Temple"
    }

    PL1E.buildingTypes = {
        "tavern": "PL1E.Tavern",
        "inn": "PL1E.Inn",
        "smithy": "PL1E.Smithy",
        "armory": "PL1E.Armory",
        "carpentry": "PL1E.Carpentry",
        "alchemy": "PL1E.Alchemy",
        "jewelry": "PL1E.Jewelry",
        "market": "PL1E.Market",
        "shop": "PL1E.Shop",
        "guardhouse": "PL1E.Guardhouse",
        "barrack": "PL1E.Barrack",
        "stable": "PL1E.Stable",
        "temple": "PL1E.Temple",
        "administrative": "PL1E.Administrative",
        "service": "PL1E.Service",
        "district": "PL1E.District",
        "access": "PL1E.Access",
        "ship": "PL1E.Ship",
        "other": "PL1E.Other"
    }

    PL1E.climates = {
        "special": "PL1E.Special",
        "polar": "PL1E.Polar",
        "subarctic": "PL1E.Subarctic",
        "temperate": "PL1E.Temperate",
        "arid": "PL1E.Arid",
        "subtropical": "PL1E.SubTropical",
        "tropical": "PL1E.Tropical",
    }

    PL1E.organizationTypes = {
        "nation": "PL1E.Nation",
        "guild": "PL1E.Guild",
        "cult": "PL1E.Cult",
        "family": "PL1E.Family",
        "firm": "PL1E.Firm"
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