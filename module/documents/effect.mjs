import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class Pl1eEffect extends ActiveEffect {

    /**
     * Apply a passive effect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @param {Pl1eItem} item
     * @returns {Promise<void>}
     */
    static async applyPassiveEffect(aspect, aspectId, actor, item) {
        // Skip if the effect already exist
        const effect = actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === aspectId);
        if (effect) return;

        if (aspect.name === "status") {
            await Pl1eEffect.createStatusEffect(actor, aspect.data, {
                origin: item.id,
                flags: {
                    pl1e: {
                        originActor: actor.id,
                        aspectId: aspectId,
                        permanent: true
                    }
                }
            });
        }
        else {
            const value = aspect.operator === "remove" ? -aspect.value : aspect.value;
            const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
            const aspectConfig = Pl1eHelpers.getConfig("aspects", aspect.name);
            const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`;
            await actor.createEmbeddedDocuments("ActiveEffect", [{
                name: name,
                icon: item.img,
                origin: item.id,
                changes: [{
                    key: dataConfig.path,
                    mode: aspect.operator === "set" ? 5 : 2,
                    value: value
                }],
                flags: {
                    pl1e: {
                        originActor: actor.id,
                        aspectId: aspectId,
                        permanent: true
                    }
                }
            }]);
        }
    }

    /**
     * Remove a passive aspect
     * @param {Object} aspect
     * @param {string} aspectId
     * @param {Pl1eActor} actor
     * @returns {Promise<void>}
     */
    static async removePassiveEffect(aspect, aspectId, actor) {
        // Done if the effect exist
        const effect = actor.effects.find(effect => effect.getFlag("pl1e", "aspectId") === aspectId);
        if (effect) await actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id])
    }

    async applyTokenEffect(actor) {
        if (!this.statuses) return;

        const actorId = actor.id;
        const tokenData = actor.isToken ? actor.token : actor.prototypeToken;
        let tokenUpdates = {};

        // Extract token changes from the effect's flags
        const tokenChanges = this.getFlag('pl1e', 'tokenChanges');
        if (tokenChanges) {
            for (const [key, value] of Object.entries(tokenChanges)) {
                if (Array.isArray(value)) {
                    // Handle arrays: merge with existing array, avoiding duplicates
                    let existingArray = foundry.utils.duplicate(tokenData[key] || []);
                    tokenUpdates[key] = [...new Set([...existingArray, ...value])];
                } else {
                    // For non-array values, just copy them over
                    tokenUpdates[key] = value;
                }
            }
        }

        // Apply the updates
        if (actor.isToken) {
            await actor.token.update(tokenUpdates);
        } else {
            // Update all tokens linked to this actor in the current scene
            const tokensToUpdate = canvas.tokens.placeables.filter(token => token.actor?.id === actorId);
            for (let token of tokensToUpdate) {
                await token.document.update(tokenUpdates);
            }

            // Update the actor's prototype token data
            await actor.update({ "prototypeToken": tokenUpdates });
        }
    }

    async removeTokenEffect(actor) {
        if (!this.flags?.pl1e?.tokenChanges) return;

        const actorId = actor.id;
        let tokenRevertUpdates = {};

        // Prepare the reversed changes
        for (const [key, value] of Object.entries(this.flags.pl1e.tokenChanges)) {
            if (Array.isArray(value)) {
                // Remove specific items from the array
                let currentArray = foundry.utils.duplicate(actor.isToken ? actor.token[key] : actor.prototypeToken[key]) || [];
                currentArray = currentArray.filter(item => !value.some(val => val.id === item.id));
                tokenRevertUpdates[key] = currentArray;
            } else {
                // Retrieve the original value from a stored flag or set to a default
                const originalValue = this.getFlag('pl1e', `original_${key}`) || null; // default or null
                tokenRevertUpdates[key] = originalValue;
            }
        }

        // Apply the reversed updates
        if (actor.isToken) {
            await actor.token.update(tokenRevertUpdates);
        } else {
            // Update all tokens linked to this actor in the current scene
            const tokensToUpdate = canvas.tokens.placeables.filter(token => token.actor.id === actorId);
            for (let token of tokensToUpdate) {
                await token.document.update(tokenRevertUpdates);
            }

            // Update the actor's prototype token data
            await actor.update({ "prototypeToken": tokenRevertUpdates });
        }
    }


    /**
     * Create an active effect
     * @param {Object} aspect
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<void>}
     */
    static async createActiveEffect(aspect, characterData, targetData) {
        // Abort if the duration is null
        if (aspect.effectDuration <= 0) return;

        // Get configuration data
        const dataConfig = Pl1eHelpers.getConfig(aspect.dataGroup, aspect.data);
        const aspectConfig = Pl1eHelpers.getConfig("aspects", aspect.name);
        const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`

        const activeEffectData = {
            name,
            icon: characterData.item.img,
            origin: characterData.item._id,
            duration: { rounds: aspect.effectDuration },
            flags: {
                pl1e: {
                    originActor: characterData.actorId,
                    aspectId: aspect._id,
                    actorPreUpdateMacroId: aspect.dataGroup === "actorPreUpdate" ?
                        aspect.data : undefined,
                    tokenPreUpdateMacroId: aspect.dataGroup === "tokenPreUpdate" ?
                        aspect.data : undefined
                }
            },
            ...aspect.value && {
                changes: [{
                    key: dataConfig.path,
                    mode: aspect.operator === "set" ? 5 : 2,
                    value: aspect.value
                }]
            }
        };

        // Create effect
        await targetData.actor.createEmbeddedDocuments("ActiveEffect", [activeEffectData]);
    }

    /**
     * Create an effect based on a status
     * @param {Actor} actor the actor where the effect is created
     * @param {string} statusEffectId id of the status (dead, unconscious...)
     * @param {Object} options
     * @return {Promise<void>}
     */
    static async createStatusEffect(actor, statusEffectId, options = {}) {
        const statusEffect = CONFIG.statusEffects.find(status => status.id === statusEffectId);
        if (!statusEffect) throw new Error("PL1E | no status corresponding to " + statusEffectId);

        // Check if an existing effect is already active
        const existingStatusEffect = actor.effects.find(effect => effect.statuses.has(statusEffectId));
        if (existingStatusEffect) {
            const newDuration = foundry.utils.mergeObject(existingStatusEffect.duration, statusEffect.duration);
            await existingStatusEffect.update({
                "duration": newDuration
            })
            return;
        }

        // Create effect
        const effectData = foundry.utils.mergeObject({
            label: statusEffect.label,
            description: statusEffect.description,
            icon: statusEffect.icon,
            changes: statusEffect.changes,
            tokenChanges: statusEffect.tokenChanges,
            duration: statusEffect.duration,
            statuses: [statusEffect.id],
            flags: statusEffect.flags
        }, options);
        await actor.createEmbeddedDocuments("ActiveEffect", [effectData])
    }

    /**
     * Remove an active effect base on the id
     * @param {Actor} actor
     * @param {string} activeEffectId
     * @return {Promise<void>}
     */
    static async removeActiveEffect(actor, activeEffectId) {
        await actor.deleteEmbeddedDocuments("ActiveEffect", [activeEffectId]);
    }

    /**
     * Toggle an effect based on a status
     * @param {Actor} actor
     * @param {string} statusEffectId
     * @param {boolean} isActive
     * @return {Promise<void>}
     */
    static async toggleStatusEffect(actor, statusEffectId, isActive) {
        const activeEffect = actor.effects.find(effect => effect.statuses.has(statusEffectId));
        if (!activeEffect && isActive) {
            await this.createStatusEffect(actor, statusEffectId);
        }
        else if (activeEffect && !isActive) {
            await this.removeActiveEffect(actor, activeEffect._id);
        }
    }

}