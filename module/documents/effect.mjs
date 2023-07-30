export class Pl1eActiveEffect extends ActiveEffect {

    /**
     * Is this active effect currently suppressed?
     * @type {boolean}
     */
    isSuppressed = false;

    /** @inheritdoc */
    apply(actor, change) {
        if ( this.isSuppressed ) return null;
        return super.apply(actor, change);
    }

    /**
     * Create an active effect
     * @param {Object} aspect
     * @param {CharacterData} characterData
     * @param {TargetData} targetData
     * @returns {Promise<void>}
     */
    static async createActiveEffect(aspect, characterData, targetData) {
        // Calculate duration
        let effectDuration = aspect.effectDuration;
        if (aspect.effectDurationResolutionType === "valueIfSuccess" && characterData.result <= 0) effectDuration = 0;
        else if (aspect.effectDurationResolutionType === "multiplyBySuccess") effectDuration *= characterData.result;
        aspect.effectDuration = effectDuration;

        // Abort if the duration is null
        if (aspect.effectDuration <= 0) return;

        // Get configuration data
        const dataConfig = CONFIG.PL1E[aspect.dataGroup][aspect.data];
        const aspectConfig = CONFIG.PL1E.aspects[aspect.name];
        const name = `${game.i18n.localize(aspectConfig.label)} (${game.i18n.localize(dataConfig.label)})`

        // Create effect
        await targetData.actor.createEmbeddedDocuments("ActiveEffect", [{
            name: name,
            icon: aspect.effectIcon,
            tint: aspect.effectIconTint,
            changes: [{
                key: dataConfig.path,
                mode: aspect.name === "set" ? 5 : 2,
                value: aspect.value
            }],
            duration: {
                rounds: effectDuration
            },
            flags: {
                core: {
                    sourceId: characterData.actorId,
                },
                pl1e: {
                    itemId: characterData.item._id,
                    aspectId: aspect._id
                }
            }
        }]);
    }

    /**
     * Create an effect based on a status
     * @param {Actor} actor the actor where the effect is created
     * @param {string} statusEffectId id of the status (dead, coma...)
     * @param {Object} options
     * @return {Promise<void>}
     */
    static async createStatusEffect(actor, statusEffectId, options = {}) {
        const statusEffect = CONFIG.statusEffects.find(status => status.id === statusEffectId);
        if (!statusEffect) throw new Error("PL1E | no status corresponding to " + statusEffectId);
        const effectData = foundry.utils.mergeObject({
            label: statusEffect.label,
            icon: statusEffect.icon,
            changes: statusEffect.changes,
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