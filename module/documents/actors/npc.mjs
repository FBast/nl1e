import { Pl1eActor } from "./actor.mjs";
import { PL1E } from "../../pl1e.mjs";

export class Pl1eNPC extends Pl1eActor {

    /** @inheritDoc */
    async prepareBaseData() {
        super.prepareBaseData();
    }

    async _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
        await super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

        if (collection !== "items") return;
        if (!this.system.general?.autoDistribute) return;

        if (documents.some(d => d.type === "class")) {
            await this.applyAutoDistribution();
        }
    }

    async applyAutoDistribution() {
        await this._applyAutoCharacteristicsFromClass();
        await this._applyAutoSkillsFromClass();
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

        // Init min
        for (const key of allKeys) {
            bases.set(key, MIN);
        }

        let pool = TOTAL - allKeys.length * MIN;
        if (pool <= 0) return;

        const primary = attrs.primaryCharacteristics ?? [];
        const secondary = attrs.secondaryCharacteristics ?? [];

        // Step 1: primary
        pool = this._fillUntilMax(bases, primary, pool, MAX);

        // Step 2: secondary
        pool = this._fillUntilMax(bases, secondary, pool, MAX);

        // Step 3: random
        const randomKeys = allKeys.filter(k => bases.get(k) < MAX);
        this._fillRandom(bases, randomKeys, pool, MAX);

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

        const validSkills = Object.entries(skills)
            .filter(([id]) => {
                const cfg = PL1E.skills[id];
                return cfg && !cfg.fixedRank;
            })
            .map(([id]) => id);

        for (const id of validSkills) {
            ranks.set(id, 1);
        }

        const primary = attrs.primarySkills ?? [];
        const secondary = attrs.secondarySkills ?? [];

        // Step 1: primary
        pool = this._fillSkillUntilMax(ranks, primary, pool, maxRank);

        // Step 2: secondary
        pool = this._fillSkillUntilMax(ranks, secondary, pool, maxRank);

        // Step 3: random
        const randomSkills = validSkills.filter(k => ranks.get(k) < maxRank);
        this._fillSkillRandom(ranks, randomSkills, pool, maxRank);

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
     * Generic fill (used for characteristics).
     */
    _fillUntilMax(map, keys, pool, max) {
        if (!keys?.length || pool <= 0) return pool;

        for (const key of keys) {
            while (pool > 0 && (map.get(key) ?? 0) < max) {
                map.set(key, (map.get(key) ?? 0) + 1);
                pool--;
            }
            if (pool <= 0) break;
        }
        return pool;
    }

    /**
     * Skill fill with TRIANGULAR COST.
     * Cost to go from rank N → N+1 = N+1
     */
    _fillSkillUntilMax(map, keys, pool, maxRank) {
        if (!keys?.length || pool <= 0) return pool;

        for (const key of keys) {
            while (true) {
                const current = map.get(key) ?? 0;
                if (current >= maxRank) break;

                const nextRank = current + 1;
                const cost = nextRank;

                if (pool < cost) break;

                map.set(key, nextRank);
                pool -= cost;
            }
            if (pool <= 0) break;
        }

        return pool;
    }

    /**
     * Random skill fill with TRIANGULAR COST.
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
     * Random fill for characteristics.
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
}