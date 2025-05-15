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

        // Calcul et application des effets
        characterData.attributes = await this.calculateAttributes(characterData);
        await this.applyAttributes(characterData);

        // Message chat optionnel
        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor }),
            content: game.i18n.format("PL1E.ServiceConsumed", { item: this.name }),
            type: CONST.CHAT_MESSAGE_STYLES.OOC
        });

        // Auto suppression après usage
        await this.delete();
    }
}