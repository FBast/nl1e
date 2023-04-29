export class Pl1eChat {

    /**
     * Send a message for an ability roll
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<void>}
     */
    static async abilityRoll(characterData, targetData = undefined) {
        const rollData = targetData === undefined ? characterData.rollData : targetData.rollData;
        const template = targetData === undefined ? "character" : "target";
        // Render the chat card template
        const html = await renderTemplate(`systems/pl1e/templates/chat/ability-${template}.hbs`,
            {rollData: rollData, characterData: characterData, targetData: targetData});

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: characterData.actor}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: '[' + game.i18n.localize("PL1E.Ability") + '] ' + characterData.item.name,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {"core.canPopout": true}, // ?
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

    /**
     * Send a message for a skill roll
     * @param {Pl1eActor} actor
     * @param {string} skillId
     * @returns {Promise<void>}
     */
    static async skillRoll(actor, skillId) {
        const skill = actor.system.skills[skillId];
        const skillConfig = CONFIG.PL1E.skills[skillId];

        let roll = await actor.rollSkill(skill)

        // Render message
        await roll.toMessage({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: actor}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: '[' + game.i18n.localize("PL1E.Skill") + '] ' + game.i18n.localize(skillConfig.label),
            rollMode: game.settings.get('core', 'rollMode'),
        });
    }

    static async tradeMessage(item, sourceActor, targetActor, transaction, price = undefined) {
        const html = await renderTemplate(`systems/pl1e/templates/chat/chat-trade.hbs`,
            {item: item, sourceActor: sourceActor, targetActor: targetActor, transaction: transaction, price: price});

        const transactionTypes = {
            'purchase': game.i18n.localize("PL1E.Purchase"),
            'sale': game.i18n.localize("PL1E.Sale"),
            'gift': game.i18n.localize("PL1E.Gift")
        };

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: sourceActor}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: `[${transactionTypes[transaction]}] ${item.name}`,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {"core.canPopout": true}, // ?
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

}

