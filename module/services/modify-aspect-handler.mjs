import AspectHandler from "./aspect-handler.mjs";
import { Pl1eEffect } from "../documents/effect.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {PL1E} from "../pl1e.mjs";
import {Pl1eAspect} from "../helpers/aspect.mjs";

/**
 * Handler for "modify" aspects.
 */
export class ModifyAspectHandler extends AspectHandler {
    /**
     * Apply the "modify" aspect logic.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     */
    async apply(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Validate the target for this aspect
            if (!Pl1eAspect.isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Create a deep copy of the aspect to avoid modifying the original object
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


            // Ignore this aspect if the resolved value is 0 (no effect to apply)
            if (aspectCopy.value === 0) continue;

            // Adjust the value based on the operator (add or remove)
            aspectCopy.value = aspect.operator === "remove" ? -aspectCopy.value : aspectCopy.value;

            if (aspectCopy.createEffect) {
                // Create an active effect if specified
                await Pl1eEffect.createActiveEffect(aspectCopy, characterData, targetData);
            } else {
                // Otherwise, apply the value directly to the target
                await this.applyDirectEffect(aspectCopy, targetData);
            }

            // Add a localized label for the sequence
            const config = Pl1eHelpers.getConfig(aspect.dataGroup, aspectCopy.data);
            aspectCopy.label = game.i18n.localize(config.label);


            // Store the applied aspect in the target's active aspects list
            targetData.activeAspects ??= [];
            targetData.activeAspects.push(aspectCopy);
        }

        return targetsData;
    }
}
