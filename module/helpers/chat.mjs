import {Pl1eItem} from "../documents/item.mjs";

export class Pl1eChat {

    /**
     * Send a message for an action roll
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<void>}
     */
    static async actionRoll(characterData, targetData = undefined) {
        const rollData = targetData === undefined ? characterData.rollData : targetData.rollData;
        const template = targetData === undefined ? "character" : "target";
        // Render the chat card template
        const html = await renderTemplate(`systems/pl1e/templates/chat/chat-ability-${template}.hbs`,
            {rollData: rollData, characterData: characterData, targetData: targetData});

        let flavor = `[${game.i18n.localize("PL1E.Action")}] ${characterData.item.name}`;
        if (rollData !== undefined) {
            const skillConfig = CONFIG.PL1E.skills[rollData.skillName];
            flavor += ` [${game.i18n.localize("PL1E.Skill")}] ${game.i18n.localize(skillConfig.label)}`
        }

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: characterData.actor}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: flavor,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {
                "core.canPopout": true,
                "pl1e.isResolved": false
            },
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

    /**
     * Send a message for a skill roll
     * @param {Pl1eActor} actor
     * @param {string} skillName
     * @returns {Promise<void>}
     */
    static async skillRoll(actor, skillName) {
        const skillConfig = CONFIG.PL1E.skills[skillName];
        let roll = await actor.rollSkill(skillName)

        // Render message
        await roll.toMessage({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: actor}),
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: `[${game.i18n.localize("PL1E.Skill")}] ${game.i18n.localize(skillConfig.label)}`,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {"core.canPopout": true}
        });
    }

    /**+
     * Send a message for a trade of an item between two actors
     * @param {Pl1eItem} item
     * @param {Pl1eActor} sourceActor
     * @param {Pl1eActor} targetActor
     * @param {string} transaction
     * @param {Object} price
     * @returns {Promise<void>}
     */
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
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            flavor: `[${transactionTypes[transaction]}] ${item.name}`,
            flags: {"core.canPopout": true},
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

    /**
     * Send a message for an action
     * @param {Actor} actor
     * @param {string} label
     * @param {number} actionCost
     * @param {Object} options
     * @param {Pl1eItem} options.item
     * @returns {Promise<void>}
     */
    static async actionMessage(actor, label, actionCost, options = {}) {
        const html = await renderTemplate(`systems/pl1e/templates/chat/chat-action.hbs`,
            {actor: actor, actionCost: actionCost, options: options});
        let flavor = `[${game.i18n.localize("PL1E.Action")}] ${game.i18n.localize(label)}`;

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: actor}),
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            flavor: flavor,
            flags: {"core.canPopout": true},
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

}

