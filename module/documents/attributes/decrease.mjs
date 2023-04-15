// /**
//  * @typedef {Object} DecreaseAttribute
//  * @property {string} damageType
//  */
// import {Pl1eAttribute} from "../aspect.mjs";
//
// export class Pl1eDecrease extends Pl1eAttribute {
//
//     /** @override */
//     constructor(item) {
//         super(item);
//         this.function = "decrease";
//         this.value = 0;
//         this.dataGroup = "resources";
//         this.data = "health";
//         this.damageType = "raw";
//     }
//
//     /** @override */
//     static apply(characterData, targetsData) {
//         return undefined;
//     }
//
// }