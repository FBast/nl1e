import AspectHandler from "./aspect-handler.mjs";
import { Pl1eAspect } from "../aspect.mjs";
import {Pl1eTemplate} from "../template.mjs";

/**
 * Handler for "movement" aspects.
 */
export class MovementAspectHandler extends AspectHandler {
    /**
     * Apply the "movement" aspect logic.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData[]} targetsData - The targets affected by the aspect.
     * @returns {Promise<TargetData[]>} - The modified targets data.
     */
    async apply(aspect, characterData, targetsData) {
        for (const targetData of targetsData) {
            // Validate the target for this aspect
            if (!Pl1eAspect.isTargetValid(aspect.targetGroup, targetData, characterData)) continue;

            // Calculate destinations for this specific target
            const movements = this._getDestinationsForTarget(aspect, characterData, targetData, targetsData);

            // Skip if no valid destinations exist for this target
            if (movements.length === 0) continue;

            // Choose a random destination from the valid options
            const destination = this._chooseRandomDestination(movements);

            // Apply the movement
            await this._applyMovement(aspect, targetData, destination);

            // Add the aspect label to the target
            targetData.activeAspects ??= [];
            targetData.activeAspects.push({
                ...aspect,
                label: `Move to (${destination.x}, ${destination.y})`
            });
        }

        return targetsData;
    }

    /**
     * Determine possible destinations for a single target.
     * @param {Object} aspect - The aspect data.
     * @param {CharacterData} characterData - The character applying the aspect.
     * @param {TargetData} target - The target being moved.
     * @param {TargetData[]} targetsData - An array of the targets.
     * @returns {Object[]} - An array of destinations.
     * @private
     */
    _getDestinationsForTarget(aspect, characterData, target, targetsData) {
        const gridSize = canvas.grid.size;
        const destinations = [];

        // Handle template-based destinations
        if (["templatePrimary", "templateSecondary"].includes(aspect.movementDestination)) {
            const templates = this._filterTemplatesByScope(aspect.templateScope, target, characterData.templates);

            for (const template of templates) {
                const destination = Pl1eTemplate.getTemplatePosition(template, aspect.movementDestination);
                if (destination) destinations.push({
                    x: destination.x - gridSize / 2,
                    y: destination.y - gridSize / 2
                });
            }
        }
        // Handle target-based destinations (e.g., allies, opponents, etc.)
        else {
            for (const otherTarget of targetsData) {
                if (otherTarget.token === target.token) continue; // Skip self
                if (!Pl1eAspect.isTargetValid(aspect.movementDestination, otherTarget, characterData)) continue;

                destinations.push({
                    x: otherTarget.tokenX - gridSize / 2,
                    y: otherTarget.tokenY - gridSize / 2
                });
            }
        }

        return destinations;
    }

    /**
     * Filter templates based on the template scope for a single target.
     * @param {string} scope - The scope of templates ("ownTemplate", "otherTemplates", "allTemplates").
     * @param {TargetData} target - The target being moved.
     * @param {Pl1eMeasuredTemplateDocument[]} templates - The list of all templates.
     * @returns {Pl1eMeasuredTemplateDocument[]} - The filtered list of templates.
     * @private
     */
    _filterTemplatesByScope(scope, target, templates) {
        switch (scope) {
            case "ownTemplate":
                return templates.filter(template => template.id === target.template?.id);
            case "otherTemplates":
                return templates.filter(template => template.id !== target.template?.id);
            case "allTemplates":
                return templates;
            default:
                console.warn(`PL1E | Unknown template scope: ${scope}`);
                return [];
        }
    }

    /**
     * Choose a random destination from a list of destinations.
     * @param {Object[]} destinations - The list of possible destinations.
     * @returns {Object} - A randomly selected destination.
     * @private
     */
    _chooseRandomDestination(destinations) {
        return destinations[Math.floor(Math.random() * destinations.length)];
    }

    /**
     * Apply a movement to a single target.
     * @param {Object} aspect - The aspect data.
     * @param {TargetData} target - The target being moved.
     * @param {Object} destination - The destination of the movement.
     * @private
     */
    async _applyMovement(aspect, target, destination) {
        const movementOptions = {
            walk: { animate: true, noRestriction: false },
            push: { animate: true, noRestriction: true },
            teleport: { animate: false, noRestriction: true }
        };

        const options = movementOptions[aspect.data];
        if (!options) {
            console.warn(`PL1E | Unknown movement type: ${aspect.data}`);
            return;
        }

        await target.token.update(destination, options);
    }
}