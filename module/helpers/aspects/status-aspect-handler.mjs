import AspectHandler from "./aspect-handler.mjs";
import { Pl1eHelpers } from "../helpers.mjs";
import { PL1E } from "../../pl1e.mjs";
import { Pl1eEffect } from "../../documents/effect.mjs";
import { Pl1eAspect } from "../aspect.mjs";

/**
 * Handler for "status" aspects.
 */
export class StatusAspectHandler extends AspectHandler {
    /**
     * Apply the "status" aspect logic.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     */
    async apply(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Validate the target for this aspect
            if (!Pl1eAspect.isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Create a deep copy of the aspect to avoid mutating the original
            let aspectCopy = JSON.parse(JSON.stringify(aspect));

            // Resolve the value of the aspect based on resolution type
            aspectCopy.value = Pl1eHelpers.applyResolution(aspectCopy.value, targetData.result, aspect.resolutionType);

            // Resolve the effect duration based on resolution type
            aspectCopy.effectDuration = Pl1eHelpers.applyResolution(
                aspectCopy.effectDuration,
                targetData.result,
                aspectCopy.effectDurationResolutionType
            );

            // Ignore the aspect if the resolved effect duration is zero
            if (aspectCopy.effectDuration === 0) continue;

            // Create the status effect
            await Pl1eEffect.createStatusEffect(targetData.actor, aspectCopy.data, {
                duration: {
                    rounds: aspectCopy.effectDuration,
                    turns: aspectCopy.effectDuration
                },
                flags: {
                    core: {
                        sourceId: characterData.actorId
                    }
                }
            });

            // Add a localized label for the sequence
            const config = PL1E[aspectCopy.dataGroup]?.[aspectCopy.data];
            if (!config) {
                console.warn(`PL1E | missing configuration for data group '${aspectCopy.dataGroup}' and data '${aspectCopy.data}'.`);
                continue;
            }
            aspectCopy.label = game.i18n.localize(config.label);

            // Store the applied aspect in the target's active aspects list
            targetData.activeAspects ??= [];
            targetData.activeAspects.push(aspectCopy);
        }

        return targetsData;
    }
}
