import { Pl1eActor } from "./actor.mjs";
import { PL1E } from "../../pl1e.mjs";

export class Pl1eNPC extends Pl1eActor {

    shouldAutoDistribute({ changed, item, reason } = {}) {
        if (this.type !== "npc") return false;
        if (!this.system.general?.autoDistribute) return false;

        if (reason === "enable") return true;
        if (reason === "experience" && changed?.system?.general?.experience !== undefined) return true;
        if (reason === "class") return true;

        return false;
    }

    async applyAutoDistribution() {
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

        // Initialize all characteristics with MIN value
        for (const key of allKeys) bases.set(key, MIN);

        let pool = TOTAL - allKeys.length * MIN;
        if (pool <= 0) return;

        const primary = [...new Set(attrs.primaryCharacteristics ?? [])];
        const secondary = [...new Set(attrs.secondaryCharacteristics ?? [])];

        // Primary attributes take priority over secondary ones
        const secondaryOnly = secondary.filter(k => !primary.includes(k));

        // Budget split (2/3 primary, 1/3 secondary)
        const primaryBudgetInitial = Math.floor((pool * 2) / 3);
        const secondaryBudgetInitial = pool - primaryBudgetInitial;

        // Step 1: Even distribution on primary attributes
        let primaryLeft = this._distributeCharacteristicsEvenly(
            bases,
            primary,
            primaryBudgetInitial,
            MAX
        );

        // Step 2 + 4: Primary leftover is added to secondary budget
        let secondaryBudget = secondaryBudgetInitial + primaryLeft;

        // Step 3: Even distribution on secondary attributes
        let secondaryLeft = this._distributeCharacteristicsEvenly(
            bases,
            secondaryOnly,
            secondaryBudget,
            MAX
        );

        // Step 5: Final stock
        let stock = secondaryLeft;

        // Step 6: Random distribution on remaining attributes
        const remaining = allKeys.filter(k => (bases.get(k) ?? 0) < MAX);
        this._fillRandom(bases, remaining, stock, MAX);

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
        const totalPool = this.system.general.experience;

        const ranks = new Map();

        const validSkills = Object.entries(skills)
            .filter(([id]) => {
                const cfg = PL1E.skills[id];
                return cfg && !cfg.fixedRank;
            })
            .map(([id]) => id);

        // Initialize all valid skills at rank 1
        for (const id of validSkills) ranks.set(id, 1);

        // Candidate skills (deduplicated and validated)
        const primary = [...new Set((attrs.primarySkills ?? []).filter(id => validSkills.includes(id)))];
        const secondary = [...new Set((attrs.secondarySkills ?? []).filter(id => validSkills.includes(id)))];

        // Primary skills take priority over secondary ones
        const secondaryOnly = secondary.filter(id => !primary.includes(id));

        // Budget split (2/3 primary, 1/3 secondary)
        const primaryBudgetInitial = Math.floor((totalPool * 2) / 3);
        const secondaryBudgetInitial = totalPool - primaryBudgetInitial;

        // Step 1: Even distribution on primary skills
        let primaryBudgetLeft = this._distributeSkillsEvenly(
            ranks,
            primary,
            primaryBudgetInitial,
            maxRank
        );

        // Step 2 + 4: Primary leftover is added to secondary budget
        let secondaryBudget = secondaryBudgetInitial + primaryBudgetLeft;

        // Step 3: Even distribution on secondary skills
        let secondaryBudgetLeft = this._distributeSkillsEvenly(
            ranks,
            secondaryOnly,
            secondaryBudget,
            maxRank
        );

        // Step 5: Final stock
        let stock = secondaryBudgetLeft;

        // Step 6: Random distribution on remaining skills
        const remainingSkills = validSkills.filter(id => (ranks.get(id) ?? 0) < maxRank);
        this._fillSkillRandom(ranks, remainingSkills, stock, maxRank);

        const updates = {};
        for (const [key, value] of ranks.entries()) {
            if (!skills[key]) continue;
            updates[`system.skills.${key}.rank`] = value;
        }

        if (Object.keys(updates).length) {
            await this.update(updates);
        }
    }

    /* -------------------------------------------- */
    /*  HELPERS                                     */
    /* -------------------------------------------- */

    /**
     * Even distribution with TRIANGULAR COST.
     * Cost to go from rank N to N+1 is (N+1).
     * Each skill can gain at most +1 per round.
     * @param {Map<string, number>} ranks
     * @param {string[]} candidates
     * @param {number} budget
     * @param {number} maxRank
     * @returns {number} remaining budget
     */
    _distributeSkillsEvenly(ranks, candidates, budget, maxRank) {
        if (!candidates?.length || budget <= 0) return budget;

        // Mutable working set (maxed skills are removed progressively)
        let active = [...candidates];

        // Safety guard against infinite loops
        while (budget > 0 && active.length) {
            let spentThisRound = 0;

            for (let i = 0; i < active.length && budget > 0; i++) {
                const id = active[i];
                const current = ranks.get(id) ?? 0;
                if (current >= maxRank) continue;

                const nextRank = current + 1;
                const cost = nextRank;

                if (budget < cost) continue;

                ranks.set(id, nextRank);
                budget -= cost;
                spentThisRound += cost;
            }

            // Remove fully maxed skills
            active = active.filter(id => (ranks.get(id) ?? 0) < maxRank);

            if (spentThisRound === 0) break;
        }

        return budget;
    }

    /**
     * Even distribution for characteristics (fixed cost = 1).
     * One point per characteristic per round.
     * @param {Map<string, number>} bases
     * @param {string[]} candidates
     * @param {number} budget
     * @param {number} max
     * @returns {number} remaining budget
     */
    _distributeCharacteristicsEvenly(bases, candidates, budget, max) {
        if (!candidates?.length || budget <= 0) return budget;

        let active = [...candidates];

        while (budget > 0 && active.length) {
            let spentThisRound = 0;

            for (let i = 0; i < active.length && budget > 0; i++) {
                const key = active[i];
                const current = bases.get(key) ?? 0;
                if (current >= max) continue;

                bases.set(key, current + 1);
                budget--;
                spentThisRound++;
            }

            // Remove fully maxed characteristics
            active = active.filter(k => (bases.get(k) ?? 0) < max);

            if (spentThisRound === 0) break;
        }

        return budget;
    }

    /**
     * Random skill distribution with TRIANGULAR COST.
     */
    _fillSkillRandom(map, keys, pool, maxRank) {
        if (!keys?.length || pool <= 0) return;

        const shuffled = [...keys].sort(() => Math.random() - 0.5);
        let i = 0;

        while (pool > 0 && shuffled.length) {
            const key = shuffled[i % shuffled.length];
            const current = map.get(key) ?? 0;

            if (current < maxRank) {
                const nextRank = current + 1;
                const cost = nextRank;

                if (pool < cost) break;

                map.set(key, nextRank);
                pool -= cost;
            }
            i++;
        }
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
