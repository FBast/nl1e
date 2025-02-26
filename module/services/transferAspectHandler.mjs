import AspectHandler from "./AspectHandler.mjs";
import { Pl1eHelpers } from "../helpers/helpers.mjs";
import { PL1E } from "../pl1e.mjs";
import { Pl1eAspect } from "../helpers/aspect.mjs";

/**
 * Handler for "transfer" aspects.
 */
export class TransferAspectHandler extends AspectHandler {
    /**
     * Apply the "transfer" aspect logic.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     */
    async apply(aspect, characterData, targetsData) {
        let transferValue = 0;

        // First pass: Calculate the total transfer value from sources
        for (const targetData of targetsData) {
            // Validate that the target is a valid source for the transfer
            if (!Pl1eAspect.isTargetValid(aspect.transferSource, targetData, characterData)) continue;

            // Create a deep copy of the aspect
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Resolve aspect value based on resolution type
            aspectCopy.value = Pl1eHelpers.applyResolution(aspectCopy.value, targetData.result, aspect.resolutionType);

            // Adjust value by damage type, if applicable
            if (aspect.damageType && aspect.damageType !== "raw") {
                const damageTypeData = PL1E.reductions[aspect.damageType];
                if (!damageTypeData) {
                    console.warn(`PL1E | unknown damage type: ${aspect.damageType}`);
                    continue;
                }
                aspectCopy.value -= foundry.utils.getProperty(targetData.actor, damageTypeData.path);
                aspectCopy.value = Math.max(aspectCopy.value, 0); // Ensure no negative values
            }

            // Ignore the aspect if the resolved value is zero
            if (aspectCopy.value === 0) continue;

            // Negate the value for transfer (source loses the value)
            const negativeAspect = JSON.parse(JSON.stringify(aspectCopy));
            negativeAspect.value = -aspectCopy.value;

            // Accumulate the transfer value
            transferValue += aspectCopy.value;

            // Check for existing aspect in activeAspects
            targetData.activeAspects ??= [];
            let existingAspect = targetData.activeAspects.find(a => a.name === aspectCopy.name);
            if (existingAspect) {
                existingAspect.value += negativeAspect.value;
            } else {
                targetData.activeAspects.push(negativeAspect);
            }

            await this.applyDirectEffect(negativeAspect, targetData);
        }

        // Count valid destination targets
        const destinationTargets = targetsData.filter(target =>
            Pl1eAspect.isTargetValid(aspect.transferDestination, target, characterData)
        );

        if (destinationTargets.length === 0) {
            console.warn("PL1E | no valid destinations found for transfer aspect.");
            return targetsData;
        }

        // Calculate the value to distribute per destination
        const valuePerDestination = Math.floor(transferValue / destinationTargets.length);

        // Second pass: Distribute the transfer value to destinations
        for (const targetData of destinationTargets) {
            // Create a deep copy of the aspect
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Assign the calculated value
            aspectCopy.value = valuePerDestination;

            // Check for existing aspect in activeAspects
            targetData.activeAspects ??= [];
            let existingAspect = targetData.activeAspects.find(a => a.name === aspectCopy.name);
            if (existingAspect) {
                existingAspect.value += aspectCopy.value;
            } else {
                targetData.activeAspects.push(aspectCopy);
            }

            // Apply the aspect value directly to the target
            await this.applyDirectEffect(aspectCopy, targetData);
        }

        return targetsData;
    }
}