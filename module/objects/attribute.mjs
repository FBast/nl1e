/**
 * @typedef {Object} DynamicAttribute
 * @property {any} value
 * @property {string} dataGroup
 * @property {string} data
 * @property {boolean} showActivationToggle
 * @property {string} activation
 * @property {string} targetGroup
 * @property {string} resolutionType
 */

/**
 * @type {DynamicAttribute}
 */
export class DynamicAttribute {

    constructor(item) {
        if (["feature"].includes(item.type)) {
            this.activation = "passive";
            this.showActivationToggle = false;
        }
        else if (["consumable"].includes(item.type)) {
            this.activation = "action";
            this.showActivationToggle = false;
        }
        else {
            this.activation = "passive";
            this.showActivationToggle = true;
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