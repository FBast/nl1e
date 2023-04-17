import {Pl1eAbility} from "./ability.mjs";
import {Pl1eWeapon} from "./weapon.mjs";
import {Pl1eWearable} from "./wearable.mjs";
import {Pl1eConsumable} from "./consumable.mjs";
import {Pl1eItem} from "./item.mjs";
import {Pl1eFeature} from "./feature.mjs";
import {Pl1eAspect} from "./aspect.mjs";

const handler = {
    /**
     * @param {typeof import("./item").Pl1eItem} _
     * @param {unknown[]} args
     */
    construct(_, args) {
        switch (args[0]?.type) {
            case "feature":
                return new Pl1eFeature(...args);
            case "ability":
                return new Pl1eAbility(...args);
            case "weapon":
                return new Pl1eWeapon(...args);
            case "wearable":
                return new Pl1eWearable(...args);
            case "consumable":
                return new Pl1eConsumable(...args);
            case "aspect":
                return new Pl1eAspect(...args);
            default:
                return new Pl1eItem(...args);
        }
    }
};

/** @type {typeof import("./item").Pl1eItem} */
export const Pl1eItemProxy = new Proxy(Pl1eItem, handler);
