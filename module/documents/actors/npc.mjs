import {Pl1eActor} from "./actor.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";

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

        super.prepareBaseData();

        // Handle characteristics repartition
        let npcTemplateConfig = Pl1eHelpers.getConfig("NPCTemplates", actorGeneral.NPCTemplate);
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
    }

    /** @inheritDoc */
    async prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();

    }

    /** @inheritDoc */
    async prepareDerivedData() {
        super.prepareDerivedData();

    }

}