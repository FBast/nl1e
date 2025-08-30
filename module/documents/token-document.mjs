import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eAspect} from "../helpers/aspect.mjs";
import {Pl1eChatMessage} from "./chat-message.mjs";

export class Pl1eTokenDocument extends TokenDocument {
    /** @inheritDoc */
    async _preUpdate(data, options, user) {
        // Apply passive aspects macros
        for (/** @type {Pl1eItem} */ const item of this.actor.items) {
            for (const [id, aspect] of Object.entries(await item.getCombinedPassiveAspects())) {
                if (!item.isEnabled) continue;
                if (aspect.name === "macro" && aspect.data !== "none" && aspect.dataGroup === "tokenPreUpdate") {
                    await Pl1eAspect.applyPassiveMacro(aspect, id, {
                        actor: this.actor,
                        data: data,
                        options: options,
                        user: user
                    });
                }
            }
        }

        // Apply active effect macro
        for (/** @type {Pl1eActiveEffect} */ const effect of this.actor.effects) {
            const macroId = effect.getFlag("pl1e", "tokenPreUpdateMacroId");
            if (macroId) {
                const macro = await Pl1eHelpers.getDocument("Macro", macroId);
                if (macro) await macro.execute({
                    actor: this.actor,
                    data: data,
                    options: options,
                    user: user
                });
            }
        }

        await super._preUpdate(data, options, user);
    }
}