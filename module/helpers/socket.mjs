import {HelpersPl1e} from "./helpers.js";

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
     * Send item from sourceActor to target targetActor
     * @param sourceActor {Pl1eActor} the source actor
     * @param targetActor {Pl1eActor} the target actor
     * @param item {Pl1eItem} the send item
     * @returns {Promise<void>}
     */
    static async sendItem(sourceActor, targetActor, item) {
        targetActor = game.actors.get(targetActor._id);
        sourceActor = game.actors.get(sourceActor._id);
        // Add item
        if (targetActor.type === 'character') {
            await targetActor.createEmbeddedDocuments("Item", [item]);
            // Send message for historic
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: sourceActor}),
                rollMode: game.settings.get('core', 'rollMode'),
                flavor: '[item] Item given',
                content: item.name + ' given to ' + targetActor.name
            });
        }
        // Or sell item
        if (targetActor.type === 'merchant') {
            const overallPrice = item.system.attributes.price.value * (1 + targetActor.system.sellMultiplicator / 100);
            const currencyPrice = HelpersPl1e.valueToCurrency(overallPrice);
            await sourceActor.update({
                ["system.currencies.gold.value"]: sourceActor.system.currencies.gold.value + currencyPrice.gold,
                ["system.currencies.silver.value"]: sourceActor.system.currencies.silver.value + currencyPrice.silver,
                ["system.currencies.copper.value"]: sourceActor.system.currencies.copper.value + currencyPrice.copper,
            });
            sourceActor.render(false);
            // Send message for historic
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: sourceActor}),
                rollMode: game.settings.get('core', 'rollMode'),
                flavor: '[item] Item sold',
                content: item.name + ' sold for ' + currencyPrice.gold + ' gold, '
                    + currencyPrice.silver + ' silver, ' + currencyPrice.copper + ' copper'
            });
        }
        // Delete source item
        sourceActor = game.actors.get(sourceActor._id);
        item = sourceActor.items.find(element => element._id === item._id);
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
