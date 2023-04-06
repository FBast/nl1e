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

import {PL1E} from "../helpers/config.mjs";

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

    isTargetValid(characterToken, targetToken) {
        if (this.targetGroup !== undefined) {
            if (this.targetGroup === "self" && targetToken !== characterToken) return false;
            if (this.targetGroup === "allies" && targetToken.document.disposition !== characterToken.document.disposition) return false;
            if (this.targetGroup === "opponents" && targetToken.document.disposition === characterToken.document.disposition) return false;
        }
        return true;
    }

    /**
     * @param {Pl1eActor[]} actors
     */
    apply(actors) {
        if (attribute.name === undefined) return;
        let data = PL1E[calculatedAttribute.dataGroup][calculatedAttribute.data];

        let newValue = foundry.utils.getProperty(this, data.path);
        switch (attribute.name) {
            case "override":
                newValue = attribute.value;
                break;
            case "increase":
            case "decrease":
            case "transfer":
                if (newValue instanceof Array)
                    newValue.push(attribute.value);
                else
                    newValue += attribute.value;
                break;
            case "effect":
                await ActiveEffect.create({
                    label: "My Effect",
                    icon: "icons/svg/fire.svg",
                    changes: [
                        {
                            key: data.path,
                            mode: 2, // ADD | SUBTRACT | MULTIPLY | DIVIDE | SET
                            value: attribute.value
                        }
                    ],
                    duration: {
                        rounds: 1,
                        seconds: 6
                    },
                    flags: {
                        "pl1e": {
                            customFlag: true
                        }
                    }
                }, {parent: this, temporary: true});
                break;
            // case 'push':
            //     let currentValue = foundry.utils.getProperty(this, data.path);
            //     if (currentValue === undefined) currentValue = [];
            //     currentValue.push(attribute.value);
            //     newValue = currentValue;
            //     break;
            default:
                console.error("PL1E | Unknown attribute name : " + attribute.name)
        }

        // Make changes
        if (persist)
            await this.update({[data.path]: newValue})
        else
            foundry.utils.setProperty(this, data.path, newValue);
    }

}