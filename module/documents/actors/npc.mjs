import { Pl1eActor } from "./actor.mjs";
import { PL1E } from "../../pl1e.mjs";

export class Pl1eNPC extends Pl1eActor {

    // Primaire : A
    // Secondaire : B C
    // A B C D
    // 2 2 2 2

    // A ->

    shouldAutoDistribute({ changed, item, reason } = {}) {
        if (this.type !== "npc") return false;
        if (!this.system.general?.autoDistribute) return false;

        if (reason === "enable") return true;
        if (reason === "experience" && changed?.system?.general?.experience !== undefined) return true;
        if (reason === "class") return true;

        return false;
    }

    async applyAutoDistribution() {
        await this._syncLockedStats();
        await this._applyAutoCharacteristicsFromClass();
        await this._applyAutoSkillsFromClass();
        await this.syncResourcesToMax();

    }

    /**
     * Collect attributes from ALL class items (multi-class support).
     */
    _getClassAttributes() {
        const classes = this.items.filter(i => i.type === "class");

        const out = {
            primaryCharacteristics: [],
            secondaryCharacteristics: [],
            primarySkills: [],
            secondarySkills: []
        };

        for (const cls of classes) {
            const a = cls.system.attributes ?? {};
            out.primaryCharacteristics.push(...(a.primaryCharacteristics ?? []));
            out.secondaryCharacteristics.push(...(a.secondaryCharacteristics ?? []));
            out.primarySkills.push(...(a.primarySkills ?? []));
            out.secondarySkills.push(...(a.secondarySkills ?? []));
        }

        // Deduplicate all collected attributes
        for (const k of Object.keys(out)) {
            out[k] = [...new Set(out[k])];
        }

        return out;
    }

    async _applyAutoCharacteristicsFromClass() {
        const attrs = this._getClassAttributes();
        const characteristics = this.system.characteristics;

        const MIN = 2;
        const MAX = 5;
        const TOTAL = 24;

        const allKeys = Object.keys(PL1E.characteristics);
        const bases = new Map();

        // Initialize all characteristics at MIN
        for (const key of allKeys) {
            bases.set(key, MIN);
        }

        let pool = TOTAL - allKeys.length * MIN;
        if (pool <= 0) return;

        const primary = [...new Set(attrs.primaryCharacteristics ?? [])];
        const secondary = [...new Set(attrs.secondaryCharacteristics ?? [])];
        const secondaryOnly = secondary.filter(k => !primary.includes(k));

        // Fixed budgets
        const primaryBudget = Math.floor((pool * 2) / 3);
        const secondaryBudget = pool - primaryBudget;

        let RESTE = 0;

        // 1) Distribute 2/3 on primary characteristics
        RESTE += this._distributeCharacteristicsEvenly(bases, primary, primaryBudget, MAX);

        // 2) Distribute 1/3 on secondary characteristics
        RESTE += this._distributeCharacteristicsEvenly(bases, secondaryOnly, secondaryBudget, MAX);

        // 3) Use remaining points to further maximize primaries
        if (RESTE > 0 && primary.length) {
            RESTE = this._distributeCharacteristicsEvenly(bases, primary, RESTE, MAX);
        }

        // 4) Then maximize secondaries with remaining points
        if (RESTE > 0 && secondaryOnly.length) {
            RESTE = this._distributeCharacteristicsEvenly(bases, secondaryOnly, RESTE, MAX);
        }

        // 5) Final random distribution if everything else is maxed
        if (RESTE > 0) {
            const remaining = allKeys.filter(k => (bases.get(k) ?? 0) < MAX);
            this._fillRandom(bases, remaining, RESTE, MAX);
        }

        const updates = {};
        for (const [key, value] of bases.entries()) {
            if (!characteristics[key]) continue;
            updates[`system.characteristics.${key}.base`] = value;
        }

        if (Object.keys(updates).length) {
            await this.update(updates);
        }
    }

    async _applyAutoSkillsFromClass() {
        const attrs = this._getClassAttributes();
        const skills = this.system.skills;

        const maxRank = this.system.general.maxRank;
        let pool = this.system.general.experience;

        const ranks = new Map();

        // Valid skills
        const validSkills = Object.entries(skills)
            .filter(([id]) => {
                const cfg = PL1E.skills[id];
                return cfg && !cfg.fixedRank;
            })
            .map(([id]) => id);

        // Init rank = 1
        for (const id of validSkills) {
            ranks.set(id, 1);
        }

        const primary = new Set(
            (attrs.primarySkills ?? []).filter(id => validSkills.includes(id))
        );

        const secondary = new Set(
            (attrs.secondarySkills ?? []).filter(
                id => validSkills.includes(id) && !primary.has(id)
            )
        );

        const getMin = (ids) => Math.min(...[...ids].map(id => ranks.get(id)));
        const getMax = (ids) => Math.max(...[...ids].map(id => ranks.get(id)));

        while (pool > 0) {

            const primaryMin = primary.size ? getMin(primary) : Infinity;
            const secondaryMin = secondary.size ? getMin(secondary) : Infinity;
            const secondaryMax = secondary.size ? getMax(secondary) : 0;

            let candidates = [];

            // Primaries: can go up to secondaryMax + 1
            for (const id of primary) {
                const r = ranks.get(id);
                if (r < maxRank && r < secondaryMax + 1) {
                    const cost = r + 1;
                    if (cost <= pool) {
                        candidates.push({ id, r, cost });
                    }
                }
            }

            // Secondaries: can go up to primaryMin
            for (const id of secondary) {
                const r = ranks.get(id);
                if (r < maxRank && r < primaryMin) {
                    const cost = r + 1;
                    if (cost <= pool) {
                        candidates.push({ id, r, cost });
                    }
                }
            }

            if (!candidates.length) break;

            // Pick lowest rank, then cheapest cost
            candidates.sort((a, b) =>
                a.r !== b.r ? a.r - b.r : a.cost - b.cost
            );

            const pick = candidates[0];

            ranks.set(pick.id, pick.r + 1);
            pool -= pick.cost;
        }

        // Apply
        const updates = {};
        for (const [id, value] of ranks.entries()) {
            if (!skills[id]) continue;
            updates[`system.skills.${id}.rank`] = value;
        }

        if (Object.keys(updates).length) {
            await this.update(updates);
        }
    }

    async _syncLockedStats() {
        const shouldLock = !!this.system.general?.autoDistribute;

        if (this.system.general.lockedStats !== shouldLock) {
            await this.update({
                "system.general.lockedStats": shouldLock
            });
        }
    }

    /* -------------------------------------------- */
    /*  HELPERS                                     */
    /* -------------------------------------------- */

    _distributeCharacteristicsEvenly(bases, candidates, budget, max) {
        if (!candidates?.length || budget <= 0) return budget;

        while (budget > 0) {
            // Find the lowest current value among candidates
            const minValue = Math.min(
                ...candidates.map(k => bases.get(k))
            );

            // All candidates at the current minimum level
            const tier = candidates.filter(
                k => bases.get(k) === minValue && bases.get(k) < max
            );

            if (!tier.length) break;

            // Raise the whole tier evenly
            for (const key of tier) {
                if (budget <= 0) break;
                bases.set(key, bases.get(key) + 1);
                budget--;
            }
        }

        return budget;
    }

    /**
     * Random distribution for characteristics (fixed cost = 1).
     */
    _fillRandom(map, keys, pool, max) {
        if (!keys?.length || pool <= 0) return;

        const shuffled = [...keys].sort(() => Math.random() - 0.5);
        let i = 0;

        while (pool > 0 && shuffled.length) {
            const key = shuffled[i % shuffled.length];
            if ((map.get(key) ?? 0) < max) {
                map.set(key, map.get(key) + 1);
                pool--;
            }
            i++;
        }
    }

    async syncResourcesToMax() {
        const updates = {};
        const resources = this.system.resources ?? {};

        for (const [key, res] of Object.entries(resources)) {
            if (typeof res?.value === "number" &&
                typeof res?.max === "number" &&
                res.max > res.value) {
                updates[`system.resources.${key}.value`] = res.max;
            }
        }

        if (Object.keys(updates).length) {
            await this.update(updates);
        }
    }
}
