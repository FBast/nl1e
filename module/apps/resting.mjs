import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class AppResting extends FormApplication {

    constructor(actor, options = {}) {
        super(options);

        /** @type {Pl1eActor} */
        this.actor = actor;
        this.skills = mergeObject(deepClone(actor.system.skills), deepClone(CONFIG.PL1E.skills));
        this.skills = Object.fromEntries(Object.entries(this.skills).filter(([key]) => !CONFIG.PL1E.skills[key].fixedRank));
        this.maxRank = actor.system.general.maxRank;
        this.ranks = actor.system.general.ranks;
        this.updateSkills();
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

        // Initialize containers.
        const commons = [];
        const abilities = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        // Iterate through subItems, allocating to containers
        const sourceIdFlags = [];
        for (let item of this.actor.items) {
            const sourceIdFlag = item.flags.core ? item.flags.core.sourceId : null;
            if (item.type === 'common' && !sourceIdFlags.includes(sourceIdFlag)) {
                commons.push(item);
            }
            // Append to abilities.
            else if (item.type === 'ability' && !sourceIdFlags.includes(sourceIdFlag)) {
                abilities[item.system.attributes.level.value].push(item);
            }
            // Push sourceId flag to handle duplicates
            if (sourceIdFlag && !sourceIdFlags.includes(sourceIdFlag)) sourceIdFlags.push(sourceIdFlag);
        }

        data.commons = commons;
        data.abilities = abilities;
        data.skills = this.skills;
        data.maxRank = this.maxRank;
        data.ranks = this.ranks;

        // Placeholders data
        data.health = 5;
        data.stamina = 5;
        data.mana = 5;
        data.maxSlots = 5;
        data.currentSlots = 2;
        data.memorizedAbilities = ['Fireball', 'Healing Touch'];
        data.availableAbilities = ['Ice Storm', 'Invisibility', 'Resurrection'];

        data.availableSkills = ['Swordsmanship', 'Archery', 'Magic'];

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.rank-control').on("click", ev => this.onRankChange(ev));
        html.find('.rest-confirm').on("click", ev => this.onRestConfirm(ev));
        html.find('.rest-cancel').on("click", ev => this.onRestCancel(ev));
    }

    /** @override */
    async _updateObject(event, formData) {
        // Handle form submission here
    }

    /**
     * @param actor
     */
    static async createCamping(actor) {
        const app = new this(actor, {
            title: `${game.i18n.localize("PL1E.CampingTitle")} : ${actor.name}`,
        });
        app.render(true);
    }

    /**
     * @param actor
     */
    static async createLodging(actor) {
        const app = new this(actor, {
            title: `${game.i18n.localize("PL1E.LodgingTitle")} : ${actor.name}`,
        });
        app.render(true);
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async onRankChange(event) {
        event.preventDefault();
        event.stopPropagation();
        const skillId = $(event.currentTarget).closest(".skill").data("skill-id");
        let rank = $(event.currentTarget).data("rank");
        if (this.skills[skillId].nextRank === rank)
            rank = this.skills[skillId].rank;
        this.ranks -= Pl1eHelpers.rankCost(rank) - Pl1eHelpers.rankCost(this.skills[skillId].nextRank);
        this.skills[skillId].nextRank = rank;
        this.updateSkills();
        this.render(false);
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async onRestConfirm(event) {
        event.preventDefault();
        event.stopPropagation();
        for (const [id, skill] of Object.entries(this.skills)) {
            this.actor.system.skills[id].rank = skill.nextRank;
        }
        await this.actor.update({
            "system.skills": this.actor.system.skills,
            "system.general.ranks": this.ranks
        })
        await this.close();
    }

    /**
     * Handle rank changes
     * @param {Event} event The originating click event
     */
    async onRestCancel(event) {
        event.preventDefault();
        event.stopPropagation();
        await this.close();
    }

    /**
     * Update the skills to define ranks states
     * @private
     */
    updateSkills() {
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

}