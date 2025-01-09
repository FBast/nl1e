import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {PL1E} from "../pl1e.mjs";

/**
 * Base class for Aspect Handlers.
 * Defines the interface for applying aspect logic.
 */
export default class AspectHandler {
    /**
     * Apply the aspect logic
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     * @throws {Error} Must be implemented in subclasses.
     */
    async apply(aspect, characterData, targetsData) {
        throw new Error("Method 'apply' must be implemented in subclasses.");
    }

    /**
     * Apply a direct effect to the target.
     * @param {Object} aspect - The aspect to apply.
     * @param {TargetData} targetData - The target data to modify.
     * @protected
     */
    async applyDirectEffect(aspect, targetData) {
        const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
        let currentValue = foundry.utils.getProperty(targetData.actor, dataConfig.path);

        // Update the value based on the operator
        currentValue = aspect.operator === "set" ? aspect.value : currentValue + aspect.value;

        // Apply the updated value
        if (game.user.isGM) {
            await targetData.actor.update({ [dataConfig.path]: currentValue });
        } else if (Pl1eHelpers.isGMConnected()) {
            PL1E.socket.executeAsGM('tokenUpdate', {
                tokenId: targetData.tokenId,
                sceneId: targetData.sceneId,
                updateData: {
                    [dataConfig.path]: currentValue
                }
            });
        } else {
            ui.notifications.warn(game.i18n.localize("PL1E.NoGMConnected"));
        }
    }
}
