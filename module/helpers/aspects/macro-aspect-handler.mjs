import AspectHandler from "./aspect-handler.mjs";
import { Pl1eHelpers } from "../helpers.mjs";
import { Pl1eEffect } from "../../documents/effect.mjs";

/**
 * Handler for "macro" aspects.
 */
export class MacroAspectHandler extends AspectHandler {
    /**
     * Apply the "macro" aspect logic.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     */
    async apply(aspect, characterData, targetsData) {
        if (aspect.dataGroup === "targetsResolution") {
            // Execute a macro for the entire set of targets
            await this._executeMacroForResolution(aspect, characterData, targetsData);
        } else {
            // Process individual targets
            await this._processTargets(aspect, characterData, targetsData);
        }

        return targetsData;
    }

    /**
     * Execute a macro for the entire set of targets.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @private
     */
    async _executeMacroForResolution(aspect, characterData, targetsData) {
        const macro = await Pl1eHelpers.getDocument("Macro", aspect.data);

        if (macro) {
            await macro.execute({
                characterData: characterData,
                targetsData: targetsData,
            });
        } else {
            console.warn(`PL1E | Macro not found: ${aspect.data}`);
        }
    }

    /**
     * Process individual targets for the "macro" aspect.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @private
     */
    async _processTargets(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Validate the target group for the aspect
            if (!this.isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Create a copy of the aspect to modify its values
            const aspectCopy = this._createAspectCopy(aspect, targetData);

            // Check if the effect duration is zero and warn
            if (aspectCopy.effectDuration === 0) {
                console.warn(`PL1E | Effect duration is zero for target: ${targetData.actor.name}, aspect: ${aspect.name}`);
                continue;
            }

            // Create an active effect for the target
            await Pl1eEffect.createActiveEffect(aspectCopy, characterData, targetData);

            // Store the applied aspect
            targetData.activeAspects ??= [];
            targetData.activeAspects.push(aspectCopy);
        }
    }

    /**
     * Create a copy of the aspect with resolved values for a target.
     * @param {Object} aspect - The aspect data.
     * @param {TargetData} targetData - The target data.
     * @returns {Object} - A modified copy of the aspect.
     * @private
     */
    _createAspectCopy(aspect, targetData) {
        const aspectCopy = JSON.parse(JSON.stringify(aspect));

        // Resolve effect duration based on the target's result
        aspectCopy.effectDuration = Pl1eHelpers.applyResolution(
            aspectCopy.effectDuration,
            targetData.result,
            aspectCopy.effectDurationResolutionType
        );

        return aspectCopy;
    }
}
