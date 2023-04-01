import {PL1E} from "../../helpers/config.mjs";

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
        throw new Error("Toggle method is not implemented");
    }

    async use(options) {
        throw new Error("Use method is not implemented");
    }

    async apply(options) {
        throw new Error("Apply method is not implemented");
    }

    async reload(options) {
        throw new Error("Reload method is not implemented");
    }

    /**
     * Calculate the stats of an attribute based on the roll value
     * @param attribute
     * @param rollResult
     * @param actor
     * @returns {any}
     * @protected
     */
    _calculateAttribute(attribute, rollResult, actor) {
        // Copy attribute
        let calculatedAttribute = JSON.parse(JSON.stringify(attribute));

        // Number type
        if (calculatedAttribute.type === 'number') {
            if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
                calculatedAttribute.value *= rollResult > 0 ? rollResult : 0;
            }
            if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
                calculatedAttribute.value = rollResult > 0 ? calculatedAttribute.value : 0;
            }
        }
        return calculatedAttribute;
    }

    /**
     * Calculate the stats of an optionalAttribute based on the roll value
     * @param optionalAttribute
     * @param rollResult
     * @param actor
     * @returns {any}
     * @protected
     */
    _calculateOptionalAttribute(optionalAttribute, rollResult, actor) {
        // Copy optionalAttribute
        let calculatedOptionalAttribute = JSON.parse(JSON.stringify(optionalAttribute));
        let subTarget = PL1E.attributeSubTargets[calculatedOptionalAttribute.subTarget];

        // Number type
        if (subTarget.type === 'number') {
            if (calculatedOptionalAttribute.resolutionType === 'multiplyBySuccess') {
                calculatedOptionalAttribute.value *= rollResult > 0 ? rollResult : 0;
            }
            if (calculatedOptionalAttribute.resolutionType === 'valueIfSuccess') {
                calculatedOptionalAttribute.value = rollResult > 0 ? calculatedOptionalAttribute.value : 0;
            }
            if (calculatedOptionalAttribute.value < 0 && calculatedOptionalAttribute.reduction !== undefined && calculatedOptionalAttribute.reduction !== 'raw') {
                let reduction = foundry.utils.getProperty(actor.system, CONFIG.PL1E.reductionsPath[calculatedOptionalAttribute.reduction]);
                calculatedOptionalAttribute.value = Math.min(calculatedOptionalAttribute.value + reduction, 0);
            }

            // Apply sign
            calculatedOptionalAttribute.value *= calculatedOptionalAttribute.function === "sub" ? -1 : 1;
        }

        return calculatedOptionalAttribute;
    }

}