import AspectHandler from "./aspect-handler.mjs";
import { Pl1eHelpers } from "../helpers.mjs";
import { Pl1eEffect } from "../../documents/effect.mjs";
import {Pl1eTemplate} from "../template.mjs";

/**
 * Handler for "invocation" aspects.
 */
export class InvocationAspectHandler extends AspectHandler {
    /**
     * Apply the "invocation" aspect logic.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     */
    async apply(aspect, characterData, targetsData) {
        for (const template of characterData.templates) {
            // Retrieve the actor to invoke
            const invocationActor = await this._getInvocationActor(aspect);

            // Notify and skip if the invocation actor is not found
            if (!invocationActor) {
                ui.notifications.error(`PL1E | invocation actor not found for aspect: ${aspect.name}`);
                continue;
            }

            // Determine the position (always available due to fallback logic in secondaryPosition)
            const position = Pl1eTemplate.getTemplatePosition(template, aspect.invocationDestination);

            // Prepare the token data for the invocation
            const tokenData = await this._prepareTokenData(invocationActor, position, characterData);

            // Create the token on the scene
            const token = await this._createInvocationToken(tokenData, characterData);

            // Apply the ephemeral status effect to the invoked token
            await this._applyEphemeralStatus(aspect, characterData, token);

            // Add the token as a combatant if in combat
            await this._addToCombat(token, characterData.scene.id);
        }

        return targetsData;
    }

    /**
     * Retrieve the actor to invoke, importing it from a compendium if necessary.
     * @param {Object} aspect - The aspect data.
     * @returns {Promise<Actor|null>} - The actor to invoke, or null if not found.
     * @private
     */
    async _getInvocationActor(aspect) {
        let invocationActor = game.actors.get(aspect.data);

        // Import the actor from the compendium if not found
        if (!invocationActor) {
            invocationActor = await Pl1eHelpers.getDocument("Actor", aspect.data);
            if (invocationActor) {
                invocationActor = await Actor.create(invocationActor, { keepId: true });
            }
        }

        return invocationActor;
    }

    /**
     * Prepare the token data for the invoked actor.
     * @param {Actor} invocationActor - The actor being invoked.
     * @param {Object} position - The position {x, y}.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @returns {Object} - The token data.
     * @private
     */
    async _prepareTokenData(invocationActor, position, characterData) {
        const tokenDocument = await invocationActor.getTokenDocument();
        const tokenData = tokenDocument.toObject();

        const gridSize = canvas.grid.size;

        // Set the token position
        tokenData.x = position.x - gridSize / 2;
        tokenData.y = position.y - gridSize / 2;

        // Set the token disposition to match the invoker
        tokenData.disposition = characterData.token.disposition;

        // Set ownership permissions
        tokenData.permission = {
            default: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
            [characterData.userId]: foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        };

        return tokenData;
    }

    /**
     * Create the token on the scene.
     * @param {Object} tokenData - The token data to create.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @returns {Promise<TokenDocument>} - The created token.
     * @private
     */
    async _createInvocationToken(tokenData, characterData) {
        const tokens = await characterData.scene.createEmbeddedDocuments("Token", [tokenData]);
        return tokens[0];
    }

    /**
     * Apply the ephemeral status effect to the invoked token.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TokenDocument} token - The token to apply the effect to.
     * @private
     */
    async _applyEphemeralStatus(aspect, characterData, token) {
        await Pl1eEffect.createStatusEffect(token.actor, "ephemeral", {
            duration: {
                rounds: aspect.effectDuration,
                turns: aspect.effectDuration
            },
            flags: {
                core: {
                    sourceId: characterData.actorId,
                },
            },
        });
    }

    /**
     * Add the invoked token as a combatant if in combat.
     * @param {TokenDocument} token - The token to add to combat.
     * @param {string} sceneId - The ID of the scene.
     * @private
     */
    async _addToCombat(token, sceneId) {
        if (game.combat) {
            await game.combat.createEmbeddedDocuments("Combatant", [
                {
                    tokenId: token.id,
                    sceneId: sceneId,
                    actorId: token.actor.id,
                },
            ]);
        }
    }
}