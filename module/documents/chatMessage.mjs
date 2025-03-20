import { Pl1eEvent } from "../helpers/events.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class Pl1eChatMessage extends ChatMessage {

    constructor(data = {}, options = {}) {
        super(data, options);
    }

    /**
     * Attaches event listeners to the chat message HTML.
     * @param {jQuery} html - The rendered HTML content of the chat message.
     */
    activateListeners(html) {
        html.find(".token-focus").on("click", ev => Pl1eEvent.onFocusToken(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this));
        html.find(".card-buttons button").on("click", ev => Pl1eEvent.onChatCardAction(ev));

        // Show or hide elements based on GM status
        if (!game.user.isGM) {
            html.find(".gm-only").hide();
        } else {
            html.find(".gm-only").show();
        }
    }

    /**
     * Send a message for a launcher roll
     * @param {CharacterData} characterData
     * @returns {Promise<ChatMessage>}
     */
    static async launcherRoll(characterData) {
        const rollData = characterData.rollData;

        // Localize skill name
        if (rollData !== undefined) {
            const skillConfig = Pl1eHelpers.getConfig("skills", rollData.skillName);
            rollData.skillName = game.i18n.localize(skillConfig.label);
        }

        // Generate the attributes data
        const attributesData = Pl1eChatMessage._generateAttributesData(characterData.attributes);

        // Render the chat card template
        const html = await renderTemplate(`systems/pl1e/templates/chat/chat-ability-launcher.hbs`, {
            rollData: rollData,
            characterData: characterData,
            attributesData: attributesData
        });

        let flavor = `[${game.i18n.localize("PL1E.Action")}] ${characterData.item.name}`;

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: characterData.actor}),
            type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: flavor,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {
                "core.canPopout": true,
                "pl1e.isResolved": false
            },
            content: html
        };

        // Render message
        return await ChatMessage.create(chatData);
    }

    /**
     * Send a message for a target roll
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<ChatMessage>}
     */
    static async targetRoll(characterData, targetData) {
        const rollData = targetData.rollData;

        // Localize skill name
        if (rollData !== undefined) {
            const skillConfig = Pl1eHelpers.getConfig("skills", rollData.skillName);
            rollData.skillName = game.i18n.localize(skillConfig.label);
        }

        // Render the chat card template
        const html = await renderTemplate(`systems/pl1e/templates/chat/chat-ability-target.hbs`,
            {rollData: rollData, characterData: characterData, targetData: targetData});

        let flavor = `${game.i18n.localize("PL1E.SubjectTo")} [${game.i18n.localize("PL1E.Action")}] ${characterData.item.name}`;

        // Create the ChatMessage data object
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: targetData.actor}),
            type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: flavor,
            rollMode: game.settings.get('core', 'rollMode'),
            flags: {
                "core.canPopout": true,
                "pl1e.isResolved": false
            },
            content: html
        };

        // Render message
        return await ChatMessage.create(chatData);
    }

    /**
     * Send a message for a skill roll
     * @param {Pl1eActor} actor
     * @param {string} skillName
     * @returns {Promise<void>}
     */
    static async skillRoll(actor, skillName) {
        const skillConfig = Pl1eHelpers.getConfig("skills", skillName);
        let roll = await actor.rollSkill(skillName)

        // Render message
        await roll.toMessage({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({actor: actor}),
            type: foundry.CONST.CHAT_MESSAGE_TYPES.ROLL,
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
            type: foundry.CONST.CHAT_MESSAGE_TYPES.OTHER,
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
            type: foundry.CONST.CHAT_MESSAGE_TYPES.OTHER,
            flavor: flavor,
            flags: {"core.canPopout": true},
            content: html
        };

        // Render message
        await ChatMessage.create(chatData);
    }

    /**
     * Generates attribute data for the chat message (private method).
     * @param {Object} attributes - The attributes data.
     * @returns {Array} - An array of objects representing the attributes.
     * @private
     */
    static _generateAttributesData(attributes) {
        return Object.entries(attributes).map(([key, value]) => {
            const config = Pl1eHelpers.getConfig("attributes", key);
            if (!config) return null;

            const attributeConfig = Pl1eHelpers.getConfig(config.dataGroup, config.data);
            if (!attributeConfig) return null;

            let icon = attributeConfig.icon;
            let label = game.i18n.localize(attributeConfig.label);
            let type = attributeConfig.type;
            let show = false;

            if (type === "number" && value !== 0) {
                show = true;
            } else if (type === "bool" && (!attributeConfig.applyIfTrue || value)) {
                show = true;
            }

            return show ? { icon, label, value, type } : null;
        }).filter(attr => attr !== null);
    }
}

Hooks.on("renderChatMessage", (app, html, data) => {
    html.find(".token-focus").on("click", ev => Pl1eEvent.onFocusToken(ev));
    html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, app));
    html.find(".card-buttons button").on("click", ev => Pl1eEvent.onChatCardAction(ev));
    if (!game.user.isGM) {
        html.find(".gm-only").hide(); // Hide the buttons for non-GM users
    } else {
        html.find(".gm-only").show(); // Ensure they are visible for the GM
    }
});