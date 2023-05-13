import {Pl1eActor} from "../actor.mjs";

export class Pl1eNPC extends Pl1eActor {

    /** @inheritDoc */
    async prepareData() {
        super.prepareData();


    }

    /** @inheritDoc */
    async prepareBaseData() {
        const systemData = this.system;
        const actorGeneral = systemData.general;
        const actorCharacteristics = systemData.characteristics;
        const actorSkills = systemData.skills;

        // Handle experience
        actorGeneral.experience = CONFIG.PL1E.experienceTemplates[actorGeneral.experienceTemplate].value;
        actorGeneral.slots = Math.floor(actorGeneral.experience / 3);
        for (let otherItem of this.items) {
            if (otherItem.type !== 'ability' || !otherItem.system.isMemorized) continue;
            actorGeneral.slots -= otherItem.system.attributes.level;
        }
        actorGeneral.ranks = actorGeneral.experience;
        actorGeneral.maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);

        // Handle characteristics repartition
        let npcTemplateConfig = CONFIG.PL1E.NPCTemplates[actorGeneral.NPCTemplate];
        for (let [id, characteristic] of Object.entries(npcTemplateConfig.characteristics)) {
            actorCharacteristics[id].base = characteristic;
        }

        // Handle skills repartition
        let ranks = 0;
        let maxRank = Math.min(1 + Math.floor(actorGeneral.experience / 10), 5);
        let keepLooping = true;
        while (keepLooping) {
            keepLooping = false;
            for (let [id, skill] of Object.entries(npcTemplateConfig.skills)) {
                let newRank = actorSkills[skill].rank + 1;
                if (newRank > maxRank) continue;
                if (ranks + newRank <= actorGeneral.ranks) {
                    actorSkills[skill].rank = newRank;
                    ranks += newRank;
                    keepLooping = true;
                }
            }
        }

        super.prepareBaseData();
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