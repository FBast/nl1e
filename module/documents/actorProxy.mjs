import {Pl1eCharacter} from "./actors/character.mjs";
import {Pl1eNPC} from "./actors/npc.mjs";
import {Pl1eMerchant} from "./actors/merchant.mjs";
import {Pl1eActor} from "./actor.mjs";

const handler = {
    /**
     * @param {typeof import("./actor").Pl1eActor} _
     * @param {unknown[]} args
     */
    construct(_, args) {
        switch (args[0]?.type) {
            case "character":
                return new Pl1eCharacter(...args);
            case "npc":
                return new Pl1eNPC(...args);
            case "merchant":
                return new Pl1eMerchant(...args);
            default:
                return new Pl1eActor(...args);
        }
    }
};

/** @type {typeof import("./actor").Pl1eActor} */
export const Pl1eActorProxy = new Proxy(Pl1eActor, handler);
