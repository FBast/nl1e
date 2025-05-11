import {PL1E} from "../pl1e.mjs";

const MODULE = "pl1e";
const FLAG_PATH = "filterCache";

/**
 *
 * Retrieves the filters for a given document (default empty).
 * @param {string} docId - The document ID (JournalEntryPage, Actor, etc.)
 * @param {string[]} categories - Filter categories (["weapons", "wearables", ...])
 * @returns {Promise<Object<string, Set>>}
 */
export async function getFilters(docId, categories) {
    const raw = foundry.utils.getProperty(game.user.flags, `${MODULE}.${FLAG_PATH}.${docId}`) || {};
    const filters = {};
    for (let cat of categories) {
        filters[cat] = new Set(raw[cat] || []);
    }
    return filters;
}

/**
 * Modifies a filter (adds or removes a value)
 * @param {string} docId - The id of the document.
 * @param {string} category - example : "weapons"
 * @param {string} value - example : "ranged"
 */
export async function toggleFilter(docId, category, value) {
    const path = `${MODULE}.${FLAG_PATH}.${docId}`;
    const raw = foundry.utils.duplicate(foundry.utils.getProperty(game.user.flags, path) || {});
    const set = new Set(raw[category] || []);
    set.has(value) ? set.delete(value) : set.add(value);
    raw[category] = Array.from(set);
    await game.user.setFlag(MODULE, `${FLAG_PATH}.${docId}`, raw);
}

export function filterDocuments(documents, filters) {
    if (!filters || filters.size === 0) return documents;

    return documents.filter(item => {
        switch (item.type) {
            case "race": return !filters.has("race");
            case "culture": return !filters.has("culture");
            case "class": return !filters.has("class");
            case "mastery": return !filters.has("mastery");
            case "feature":
                return !Object.keys(PL1E.featureTypes).some(ft => filters.has(ft) && item.system.attributes.featureType === ft);
            case "ability":
                return !Object.keys(PL1E.activations).some(act => filters.has(act) && item.system.attributes.activation === act);
            case "weapon":
                if (filters.has("melee") && item.system.attributes.meleeUse) return false;
                if (filters.has("ranged") && item.system.attributes.rangedUse) return false;
                if (filters.has("magic") && item.system.attributes.magicUse) return false;
                if (filters.has("equipped") && item.isEquipped) return false;
                return true;
            case "wearable":
                if (Object.keys(PL1E.slots).some(slot => filters.has(slot) && item.system.attributes.slot === slot)) return false;
                if (filters.has("equipped") && item.isEquipped) return false;
                return true;
            case "consumable":
                return !Object.keys(PL1E.consumableActivations).some(act => filters.has(act) && item.system.attributes.activation === act);
            case "common":
                return !Object.keys(PL1E.commonTypes).some(ct => filters.has(ct) && item.system.attributes.commonType === ct);
            case "module":
                return !Object.keys(PL1E.moduleTypes).some(mt => filters.has(mt) && item.system.attributes.moduleTypes.includes(mt));
            default:
                if (filters.has("passive") && item.flags?.pl1e?.permanent) return false;
                if (filters.has("temporary") && !item.flags?.pl1e?.permanent) return false;
                if (filters.has("inactive") && item.disabled) return false;
                return true;
        }
    });
}
