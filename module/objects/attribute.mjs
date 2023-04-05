/**
 * @typedef {Object} DynamicAttribute
 * @property {any} value
 * @property {string} dataGroup
 * @property {string} data
 * @property {boolean} showPassiveToggle
 * @property {boolean} isPassive
 */

/**
 * @type {DynamicAttribute}
 */
export class DynamicAttribute {

    value;
    dataGroup;
    data;

    showPassiveToggle;
    isPassive;

    showResolutionTypeDropdown;
    resolutionType;

    showTargetGroupDropdown;
    targetGroup

    constructor(item) {
        if (["feature"].includes(item.type)) {
            this.isPassive = true;
            this.showPassiveToggle = false;
        }
        else if (["consumable"].includes(item.type)) {
            this.isPassive = false;
            this.showPassiveToggle = false;
        }
        else {
            this.showPassiveToggle = true;
        }
    }

    /**
     * @param {Pl1eActor} characterActor
     * @param {Pl1eActor[]} targetActors
     * @returns {DynamicAttribute[]}
     */
    calculate(characterActor, targetActors) {
        throw new Error("calculate method is not implemented");
    }

    /**
     * @param {Pl1eActor[]} actors
     */
    apply(actors) {
        throw new Error("apply method is not implemented");
    }

}