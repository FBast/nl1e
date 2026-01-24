import {Pl1eItem} from "./item.mjs";

export class Pl1eCommon extends Pl1eItem {

    /**
     * Activate the common
     */
    async activate() {
        const actor = this.actor;
        if (!actor) return;

        if (!["food", "rest"].includes(this.system.attributes.commonType)) {
            return super.activate();
        }

        const hungerPath = "system.misc.hunger";
        const hungerMaxPath = "system.misc.hungerMax";
        const currentHunger = foundry.utils.getProperty(actor, hungerPath) ?? 0;
        const hungerMax = foundry.utils.getProperty(actor, hungerMaxPath) ?? 100;

        switch (this.system.attributes.commonType) {
            case "food": {
                if (currentHunger <= 0) return;
                await actor.update({
                    [hungerPath]: Math.max(currentHunger - 1, 0)
                });
                break;
            }

            case "rest": {
                await actor.update({
                    [hungerPath]: hungerMax,
                });
                break;
            }
        }

        const characterData = {
            actor: actor,
            item: this,
            attributes: {
                healthGain: this.system.attributes.healthRest ?? 0,
                staminaGain: this.system.attributes.staminaRest ?? 0,
                manaGain: this.system.attributes.manaRest ?? 0
            }
        };

        characterData.attributes = await this.calculateAttributes(characterData);
        await this.applyAttributes(characterData);

        //TODO display recovery
        // await ChatMessage.create({
        //     user: game.user.id,
        //     speaker: ChatMessage.getSpeaker({ actor }),
        //     content: game.i18n.format("PL1E.ServiceConsumed", { item: this.name }),
        //     type: CONST.CHAT_MESSAGE_TYPES.OOC
        // });

        if (this.system.attributes.commonType === "food") await this.delete();
    }

}