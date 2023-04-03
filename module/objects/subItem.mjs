import {PL1E} from "../helpers/config.mjs";

export class Pl1eSubItem {

    /**
     * @param item {Pl1eItem}
     * @param actor {Pl1eActor}
     */
    constructor(item, actor) {
        this.item = item;
        this.actor = actor;
    }

    async toggle(options) {
        throw new Error("toggle method is not implemented");
    }

    async use(options) {
        throw new Error("use method is not implemented");
    }

    async apply(options) {
        throw new Error("apply method is not implemented");
    }

    async reload(options) {
        throw new Error("reload method is not implemented");
    }

    /**
     * Calculate the stats of an attribute based on the roll result
     * @param {object} attribute
     * @param {number} rollResult
     * @param {Pl1eActor} actor
     * @returns {any}
     * @protected
     */
    _calculateAttribute(attribute, rollResult, actor) {
        // Copy attribute
        let calculatedAttribute = JSON.parse(JSON.stringify(attribute));

        // Calculate only if name is defined
        if (calculatedAttribute.name !== undefined) {
            let data = PL1E[calculatedAttribute.dataGroup][calculatedAttribute.data];

            // Number type
            if (data.type === 'number') {
                if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
                    calculatedAttribute.value *= rollResult > 0 ? rollResult : 0;
                }
                if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
                    calculatedAttribute.value = rollResult > 0 ? calculatedAttribute.value : 0;
                }
                if (calculatedAttribute.value < 0 && calculatedAttribute.reduction !== undefined && calculatedAttribute.reduction !== 'raw') {
                    let reduction = foundry.utils.getProperty(actor, CONFIG.PL1E.reductions[calculatedAttribute.reduction].path);
                    calculatedAttribute.value = Math.min(calculatedAttribute.value + reduction, 0);
                }
                // If resulting value equal to zero then ignore the attribute
                if (calculatedAttribute.value === 0) return;
                // Apply sign
                calculatedAttribute.value *= calculatedAttribute.name === "decrease" ? -1 : 1;
            }
        }

        return calculatedAttribute;
    }

}