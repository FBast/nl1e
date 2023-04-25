import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";

export class AppResting extends FormApplication {

    constructor(actor, options = {}) {
        super(options);

        /** @type {Pl1eActor} */
        this.actor = actor;
        this.slots = this.actor.system.general.slots;
        this.items = [];
        this.skills = deepClone(this.actor.system.skills);
        this.skills = Object.fromEntries(Object.entries(this.skills).filter(([key]) => !CONFIG.PL1E.skills[key].fixedRank));
        this.maxRank = this.actor.system.general.maxRank;
        this.ranks = this.actor.system.general.ranks;
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // classes: ["my-apps"],
            template: "systems/pl1e/templates/apps/app-resting.hbs",
            width: 400,
            height: "auto",
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "rest"}],
            resizable: true
        });
    }

    /** @override */
    getData() {
        const data = super.getData();

        // Update all items
        this._updateItems();

        // Container filters
        const commons = [];
        const abilities = {1: [], 2: [], 3: [], 4: [], 5: []};
        const sourceUuidFlags = [];
        for (let item of this.items) {
            const sourceUuidFlag = item.flags.core ? item.flags.core.sourceUuid : null;
            if (item.type === 'common' && !sourceUuidFlags.includes(sourceUuidFlag)) {
                commons.push(item);
            }
            // Append to abilities.
            else if (item.type === 'ability' && !sourceUuidFlags.includes(sourceUuidFlag)) {
                abilities[item.system.attributes.level.value].push(item);
            }
            // Push sourceId flag to handle duplicates
            if (sourceUuidFlag && !sourceUuidFlags.includes(sourceUuidFlag)) sourceUuidFlags.push(sourceUuidFlag);
        }

        // Rest part
        data.commons = commons;

        // Abilities part
        data.slots = this.slots;
        data.abilities = abilities;

        // Skills part
        this._updateSkills(this.skills);
        data.skills = this.skills;
        data.maxRank = this.maxRank;
        data.ranks = this.ranks;

        // Placeholders data
        data.health = 5;
        data.stamina = 5;
        data.mana = 5;

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.item-edit').on("click", ev => Pl1eEvent.onItemEdit(ev, this.actor));
        html.find('.rank-control').on("click", ev => this._onRankChange(ev));
        html.find(".item-toggle").on("click", ev => this._onItemMemorize(ev, this.actor));

        html.find('.rest-confirm').on("click", ev => this._onRestConfirm(ev));
        html.find('.rest-cancel').on("click", ev => this._onRestCancel(ev));
    }

    /** @override */
    async _updateObject(event, formData) {
        // Handle form submission here
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async _onRankChange(event) {
        event.preventDefault();
        event.stopPropagation();
        const skillId = $(event.currentTarget).closest(".skill").data("skill-id");
        let rank = $(event.currentTarget).data("rank");
        if (this.skills[skillId].nextRank === rank)
            rank = this.skills[skillId].rank;
        this.ranks -= Pl1eHelpers.rankCost(rank) - Pl1eHelpers.rankCost(this.skills[skillId].nextRank);
        this.skills[skillId].nextRank = rank;
        this.render();
    }

    async _onItemMemorize(event) {
        event.preventDefault();
        event.stopPropagation();
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = this.items.find(item => item._id === itemId);
        item.system.isMemorized = !item.system.isMemorized;
        this.slots -= (item.system.isMemorized ? 1 : -1) * item.system.attributes.level.value
        this.render();
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async _onRestConfirm(event) {
        event.preventDefault();
        event.stopPropagation();
        await this.close();
        // Skills
        for (const [id, skill] of Object.entries(this.skills)) {
            this.actor.system.skills[id].rank = skill.nextRank;
        }
        // Update
        await this.actor.update({
            "items": this.items,
            "system.skills": this.actor.system.skills,
            "system.general.ranks": this.ranks
        })
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async _onRestCancel(event) {
        event.preventDefault();
        event.stopPropagation();
        await this.close();
    }

    /**
     * Update the skills to define ranks state
     * @private
     */
    _updateSkills() {
        for (const [id, skill] of Object.entries(this.skills)) {
            skill.ranks = [];
            skill.nextRank = skill.nextRank || skill.rank;
            skill.dice = 2 + skill.nextRank * 2;
            for (const rank of [1, 2, 3, 4, 5]) {
                skill.ranks[rank] = {
                    dice: 2 + rank * 2
                };
                let rankCost = ((rank * (rank + 1) / 2) - 1) - skill.nextRank;
                // acquired, affordable, bought, notAffordable
                if (skill.rank >= rank) skill.ranks[rank].state = "acquired";
                else if (skill.nextRank && skill.nextRank >= rank) skill.ranks[rank].state = "bought";
                else if (rankCost <= this.ranks && rank <= this.maxRank) skill.ranks[rank].state = "affordable"
                else skill.ranks[rank].state = "notAffordable";
            }
        }
    }

    /**
     * Update the items based on the original data
     * @private
     */
    _updateItems() {
        // Retrieve items and copy
        for (let item of this.actor.items) {
            const sourceIdFlag = item.flags.core ? item.flags.core.sourceId : null;
            if (this.items.find(item => item.flags.core ? item.flags.core.sourceId === sourceIdFlag : null)) continue;
            this.items.push(item.toObject());
        }

        // Get sourceUuids of items in origin
        const originSourceIds = this.actor.items.map(item => item.flags.core?.sourceId);

        // Filter items to only keep those in origin
        this.items = this.items.filter(item => {
            const sourceId = item.flags.core?.sourceId;
            return originSourceIds.includes(sourceId);
        });
    }

}