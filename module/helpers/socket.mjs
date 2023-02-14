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
     * @param sourceActor {Pl1eActor} the source actor
     * @param targetActor {Pl1eActor} the target actor
     * @param item {Pl1eItem} the send item
     * @returns {Promise<void>}
     */
    static async sendItem(sourceActor, targetActor, item) {
        targetActor = game.actors.get(targetActor._id);
        sourceActor = game.actors.get(sourceActor._id);
        await Pl1eTrade.giftItem(item, sourceActor, targetActor);
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
