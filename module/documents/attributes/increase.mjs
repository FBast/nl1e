// /**
//  * @typedef {Object} IncreaseAttribute
//  */
//
// import {Pl1eItem} from "../item.mjs";
// import {Pl1eAttribute} from "../aspect.mjs";
//
// export class Pl1eIncrease extends Pl1eAttribute {
//
//     // /** @override */
//     // constructor(param) {
//     //     super(param);
//     //     if (param instanceof Pl1eItem) {
//     //         this.function = "increase";
//     //         this.value = 0;
//     //         this.dataGroup = "resources";
//     //         this.data = "health";
//     //     }
//     //     else if (param instanceof Object) {
//     //         this.function = param.function;
//     //         this.value = param.value;
//     //         this.dataGroup = param.dataGroup;
//     //         this.data = param.data;
//     //     }
//     // }
//
//     /** @override */
//     apply(characterData, targetsData) {
//         const attributeModificationsData = [];
//         for (const targetData of targetsData) {
//             // Check target validation
//             if (!this._isTargetValid(characterData.token, targetData.token)) continue;
//
//             /** @type {AttributeModificationData} */
//             const attributeModificationData = {};
//             attributeModificationData.token = targetData.token;
//
//             // Calculate the attribute new values
//             let calculatedAttribute = { ...this };
//             if (calculatedAttribute.resolutionType === 'multiplyBySuccess') {
//                 calculatedAttribute.value *= targetData.result > 0 ? targetData.result : 0;
//             }
//             if (calculatedAttribute.resolutionType === 'valueIfSuccess') {
//                 calculatedAttribute.value = targetData.result > 0 ? calculatedAttribute.value : 0;
//             }
//             attributeModificationData.dynamicAttribute = calculatedAttribute;
//             attributeModificationsData.push(attributeModificationData);
//         }
//         return attributeModificationsData;
//     }
//
//     /** @override */
//     merge(previousDynamicAttribute) {
//         previousDynamicAttribute.value += this.value;
//     }
//
// }