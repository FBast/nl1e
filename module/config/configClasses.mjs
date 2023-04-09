import {PL1E} from "./config.mjs";
import {IncreaseAttribute} from "../objects/attributes/increaseAttribute.mjs";
import {DecreaseAttribute} from "../objects/attributes/decreaseAttribute.mjs";
import {OverrideAttribute} from "../objects/attributes/overrideAttribute.mjs";
import {TransferAttribute} from "../objects/attributes/transferAttribute.mjs";
import {EffectAttribute} from "../objects/attributes/effectAttribute.mjs";

export function getClasses() {
    PL1E.attributeClasses = {
        'increase': IncreaseAttribute,
        'decrease': DecreaseAttribute,
        'override': OverrideAttribute,
        'transfer': TransferAttribute,
        'effect': EffectAttribute
    };
}