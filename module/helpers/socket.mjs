import {Pl1eTrade} from "./trade.mjs";

export default class Pl1eSocket {

    static async updateRollMessage(data) {
        if (game.user.isGM) {
            const message = game.messages.get(data.message._id);
            await message.update(data.update, {"diff": true});
            await message.setFlag('od6s', 'total', data.update.content);
            if ((+data.update.content) >= (message.getFlag('od6s', 'difficulty'))) {
                await message.setFlag('od6s', 'success', true);
            }
        }
    }

    static async updateInitRoll(data) {
        if (game.user.isGM) {
            const actor = data.message.speaker.actor;
            const combatant = game.combat.data.combatants.find(c => c.actor.id === actor);
            const update = {
                id: combatant.id,
                initiative: data.update.content
            }
            await combatant.update(update);
        }
    }

    /**
     * Send item from sourceActor to target targetActor
     * @param {string} sourceActorId the source actor
     * @param {string} targetActorId the target actor
     * @param {string} itemId the send item
     */
    static async sendItem(sourceActorId, targetActorId, itemId) {
        // Object are loose in transit, so we need to get them from this client using id
        const sourceActor = game.actors.get(sourceActorId);
        const targetActor = game.actors.get(targetActorId);
        const item = sourceActor.items.get(itemId);

        if (sourceActor.type === "character" && targetActor.type === "character") {
            await Pl1eTrade.giftItem(sourceActor, targetActor, item);
        }
        else if (targetActor.type === "merchant") {
            await Pl1eTrade.sellItem(sourceActor, targetActor, item);
        }
        else if (sourceActor.type === "merchant") {
            await Pl1eTrade.buyItem(targetActor, sourceActor, item);
        }
    }

    static async sendContenant(actor, targetActor, item) {
        // if (game.user.isGM) {
        //     const actor = data.message.speaker.actor;
        //     const combatant = game.combat.data.combatants.find(c => c.actor.id === actor);
        //     const update = {
        //         id: combatant.id,
        //         initiative: data.update.content
        //     }
        //     await combatant.update(update);
        // }
    }

}
