import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class RestManager extends FormApplication {

    constructor(actor, options = {}) {
        super(actor, options);

        /** @type {Pl1eActor} */
        this.actor = actor;
        this.system = actor.system;
        this.items = [];
        this.skills = deepClone(this.actor.system.skills);
        this.skills = Object.fromEntries(Object.entries(this.skills).filter(([key]) => !Pl1eHelpers.getConfig("skills", key, "fixedRank")));
        this.maxRank = this.actor.system.general.maxRank;
        this.ranks = this.actor.system.general.ranks;
        this.itemEaten = null;
        this.itemDrink = null;
    }

    /** @inheritDoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e"],
            template: "systems/pl1e/templates/apps/rest-manager.hbs",
            width: "auto",
            height: "auto",
            scrollY: [
                ".scroll-auto"
            ],
            resizable: true
        });
    }

    /** @inheritDoc */
    getData() {
        const data = super.getData();
        data.system = this.actor.system;
        
        return data;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

    }
}