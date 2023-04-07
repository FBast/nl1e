import {Pl1eAbility} from "./items/ability.mjs";
import {Pl1eWeapon} from "./items/weapon.mjs";
import {Pl1eWearable} from "./items/wearable.mjs";
import {Pl1eConsumable} from "./items/consumable.mjs";
import {Pl1eItem} from "./item.mjs";

const handler = {
    /**
     * @param {typeof import("./item").Pl1eItem} _
     * @param {unknown[]} args
     */
    construct(_, args) {
        switch (args[0]?.type) {
            case "ability":
                return new Pl1eAbility(...args);
            case "weapon":
                return new Pl1eWeapon(...args);
            case "wearable":
                return new Pl1eWearable(...args);
            case "consumable":
                return new Pl1eConsumable(...args);
            default:
                throw new Error("Unknown item type from item proxy : " + args[0]?.type);
        }
    },
};

/** @type {typeof import("./item").Pl1eItem} */
export const Pl1eItemProxy = new Proxy(Pl1eItem, handler);
