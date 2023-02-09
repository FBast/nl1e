export default class SocketPl1e {

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
     * Send item from actor to target actor
     * @param actor {Pl1eActor} the source actor
     * @param targetActor {Pl1eActor} the target actor
     * @param item {Pl1eItem} the send item
     * @returns {Promise<void>}
     */
    static async sendItem(actor, targetActor, item) {
        if (!game.user.isGM) return;

        // if the logged in user is the active GM with the lowest user id
        // const isResponsibleGM = game.users
        //     .filter(user => user.isGM && user.isActive)
        //     .some(other => other.data._id < game.user.data._id);
        //
        // if (!isResponsibleGM) return;

        targetActor = game.actors.get(targetActor._id);
        await targetActor.createEmbeddedDocuments("Item", [item]);
        item = game.items.get(item._id);
        await item.delete();
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
