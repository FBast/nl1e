import {Pl1eActor} from "./actor.mjs";

export class Pl1eCharacter extends Pl1eActor {

    /** @inheritDoc */
    async prepareData() {
        super.prepareData();

    }

    /** @inheritDoc */
    async prepareBaseData() {
        super.prepareBaseData();
        const actorGeneral = this.system.general;

        // Handle experience
        actorGeneral.slots = Math.floor(actorGeneral.experience / 3);
        for (let otherItem of this.items) {
            if (otherItem.type !== 'ability' || !otherItem.system.isMemorized) continue;
            actorGeneral.slots -= otherItem.system.attributes.level;
        }
        actorGeneral.ranks = actorGeneral.experience;
        actorGeneral.maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);
    }

    /** @inheritDoc */
    async prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();

    }

    /** @inheritDoc */
    prepareDerivedData() {
        super.prepareDerivedData();

    }

}