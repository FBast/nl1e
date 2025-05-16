import {Pl1eItem} from "./item.mjs";

export class Pl1eService extends Pl1eItem {

    /**
     * Activate the service
     */
    async activate() {
        const actor = this.actor;
        if (!actor) return;

        const characterData = {
            actor: actor,
            item: this,
            attributes: {
                healthGain: this.system.attributes.healthGain ?? 0,
                staminaGain: this.system.attributes.staminaGain ?? 0,
                manaGain: this.system.attributes.manaGain ?? 0
            }
        };
        
        characterData.attributes = await this.calculateAttributes(characterData);
        await this.applyAttributes(characterData);
        
        const hungerPath = "system.misc.hunger";
        const hungerMaxPath = "system.misc.hungerMax";
        const currentHunger = getProperty(actor, hungerPath) ?? 0;
        const hungerMax = getProperty(actor, hungerMaxPath) ?? 100;

        switch (this.system.attributes.serviceType) {
            case "food": {
                const reduction = this.system.attributes.hungerReduction ?? 0;
                const newValue = Math.max(currentHunger - reduction, 0);
                await actor.update({ [hungerPath]: newValue });
                break;
            }

            case "rest": {
                await actor.update({ [hungerPath]: hungerMax });
                break;
            }
        }
        
        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor }),
            content: game.i18n.format("PL1E.ServiceConsumed", { item: this.name }),
            type: CONST.CHAT_MESSAGE_TYPES.OOC
        });
        
        await this.delete();
    }
}