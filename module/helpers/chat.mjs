import {Pl1eItem} from "../documents/items/item.mjs";

export class Pl1eChat {

    /**
     * Send a message for an action roll
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @param {Object} options
     * @returns {Promise<ChatMessage>}
     */
    static async actionRoll(characterData, targetData = undefined, options = {}) {
        const rollData = targetData === undefined ? characterData.rollData : targetData.rollData;
        const template = targetData === undefined ? "character" : "target";

        // Render the chat card template
        const html = await renderTemplate(`systems/pl1e/templates/chat/chat-ability-${template}.hbs`,
            foundry.utils.mergeObject(options, {
                rollData: rollData,
                characterData: characterData,
                targetData: targetData
            })
        );

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
        return  ChatMessage.create(chatData);
    }

    /**
     * Send a message for an action roll with a timer and a callback
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @param {number} countdownDuration
     * @param {Function} countdownCallback
     * @returns {Promise<ChatMessage>}
     */
    static async actionRollWithTimer(characterData, targetData = undefined, countdownDuration = 0, countdownCallback = null) {
        // Countdown elements
        const footerHTML = countdownDuration > 0
            ? `<div id="countdown-timer" data-time-left="${countdownDuration}">${countdownDuration}</div>
           <button class="pause-button">{{localize "PL1E.Pause"}}</button>
           <button class="abort-button">{{localize "PL1E.Abort"}}</button>`
            : "";

        const chatMessage = await this.actionRoll(characterData, targetData, { footerHTML: footerHTML });

        // Start countdown
        let isPaused = false; // Variable to track pause state
        let timeLeft = countdownDuration; // Assume a 3-second countdown

        // Attach event handlers after the message is updated
        Hooks.once('renderChatMessage', (message, html, data) => {
            if (message.id === chatMessage.id) {
                html.find('.pause-button').on('click', () => {
                    isPaused = !isPaused; // Toggle the pause state
                });
            }
        });

        // Function to update the countdown
        const updateCountdown = async () => {
            // Find the timer element in the updated chat message
            const timerElement = $(`#chat-message-${chatMessage.id} .countdown-timer`);

            // Update the timer display
            timerElement.text(timeLeft);

            // Countdown logic
            if (!isPaused && timeLeft > 0) {
                timeLeft -= 1;
            } else if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownCallback?.();
            }
        };

        // Start the countdown interval
        const countdownInterval = setInterval(updateCountdown, 1000);

        return chatMessage;
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
            'gift': game.i18n.localize("PL1E.Gift"),
            'take': game.i18n.localize("PL1E.Take")
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

