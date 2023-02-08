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

    static async sendItem(actor, targetActor, item) {
        if (game.user.isGM) {
            await targetActor.createEmbeddedDocuments("Item", [item]);
            await item.delete();
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
