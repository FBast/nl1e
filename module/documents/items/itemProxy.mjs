import {Pl1eAbility} from "./ability.mjs";
import {Pl1eWeapon} from "./weapon.mjs";
import {Pl1eWearable} from "./wearable.mjs";
import {Pl1eConsumable} from "./consumable.mjs";
import {Pl1eItem} from "./item.mjs";
import {Pl1eFeature} from "./feature.mjs";
import {Pl1eModule} from "./module.mjs";
import {Pl1eRace} from "./race.mjs";
import {Pl1eClass} from "./class.mjs";
import {Pl1eMastery} from "./mastery.mjs";
import {Pl1eCommon} from "./common.mjs";
import {Pl1eCulture} from "./culture.mjs";
import {Pl1eService} from "./service.mjs";

const handler = {
    /**
     * @param {typeof import("./item.mjs").Pl1eItem} _
     * @param {unknown[]} args
     */
    construct(_, args) {
        switch (args[0]?.type) {
            case "race":
                return new Pl1eRace(...args);
            case "culture":
                return new Pl1eCulture(...args);
            case "class":
                return new Pl1eClass(...args);
            case "feature":
                return new Pl1eFeature(...args);
            case "mastery":
                return new Pl1eMastery(...args);
            case "ability":
                return new Pl1eAbility(...args);
            case "weapon":
                return new Pl1eWeapon(...args);
            case "wearable":
                return new Pl1eWearable(...args);
            case "consumable":
                return new Pl1eConsumable(...args);
            case "common":
                return new Pl1eCommon(...args);
            case "module":
                return new Pl1eModule(...args);
            case "service":
                return new Pl1eService(...args);
            default:
                return new Pl1eItem(...args);
        }
    }
};

/** @type {typeof import("./item.mjs").Pl1eItem} */
export const Pl1eItemProxy = new Proxy(Pl1eItem, handler);
