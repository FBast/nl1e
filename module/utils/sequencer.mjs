import { PL1E } from "../pl1e.mjs";

export const Pl1eSequencer = {
    /**
     * Play a visual effect based on a preset.
     * @param {string} name - The preset name.
     * @param {object} options - The effect parameters.
     * @param {object} options.characterData - Caster data (includes tokenId, templates).
     * @param {object[]} [options.targetsData] - Target data array.
     * @param {boolean} [options.active] - Used for persistent effects.
     */
    async playEffect(name, { characterData, targetsData, active }) {
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        if (!game.pl1e.hasSequencer || !enableVFXAndSFX) return;

        const preset = PL1E.sequencerPresets[name];
        if (!preset) return ui.notifications.warn(`Effect '${name}' not found.`);

        const seq = new Sequence();
        const tokenId = characterData.tokenId;

        for (const effect of preset.effects) {
            // Handle persistent separately
            if (effect.persist) {
                await this._handlePersistentEffect(seq, effect, tokenId, name, active, characterData, targetsData);
            } else {
                this._handleEffect(seq, effect, characterData, targetsData, tokenId);
            }
        }

        await seq.play();
    },

    async _handlePersistentEffect(seq, effect, tokenId, name, active, characterData, targetsData) {
        const effectName = `Spell-${tokenId}-${name}`;
        if (active) {
            this._playEffect(seq, effect, characterData, targetsData, tokenId)
                .persist()
                .name(effectName)
                .fadeIn(effect.fadeIn || 0)
                .fadeOut(effect.fadeOut || 0)
                .scale(effect.scale || 1);
        } else {
            await Sequencer.EffectManager.endEffects({ name: effectName });
        }
    },

    _handleEffect(seq, effect, characterData, targetsData, tokenId) {
        if (effect.at) {
            const locations = this._resolveLocations(effect.at, tokenId, characterData, targetsData);
            for (const location of locations) {
                this._playGenericEffect(seq, effect, location)
                    .playbackRate(this._resolveSpeed(effect))
                    .waitUntilFinished(effect.postDelay || 0);
            }
        } else if (effect.from && effect.to) {
            const sources = this._resolveLocations(effect.from, tokenId, characterData, targetsData);
            const targets = this._resolveLocations(effect.to, tokenId, characterData, targetsData);
            for (let source of sources) {
                for (let target of targets) {
                    console.log(target);
                    this._playGenericEffect(seq, effect, source)
                        .stretchTo(target)
                        .missed(effect.missed)
                        .playbackRate(this._resolveSpeed(effect))
                        .waitUntilFinished(effect.postDelay || 0);
                }
            }
        }
    },

    _resolveLocations(key, tokenId, characterData, targetsData) {
        switch (key) {
            case "caster":
                return [tokenId];

            case "target":
                return targetsData?.map(t => t.tokenId ?? (t.x !== undefined ? { x: t.x, y: t.y } : undefined)).filter(Boolean) ?? [];

            case "templatePrimary":
                return (characterData.templates ?? []).map(t => t.primaryPosition ?? ({ x: t.x, y: t.y }));

            case "templateSecondary":
                return (characterData.templates ?? []).map(t => t.secondaryPosition ?? { x: t.x, y: t.y });

            default:
                return [];
        }
    },

    _playGenericEffect(seq, effect, location) {
        return seq.effect()
            .file(effect.file)
            .atLocation(location)
            .randomizeMirrorY(effect.randomize);
    },

    _resolveSpeed(effect) {
        return effect.randomSpeed ? (Math.random() * (1.2 - 0.8) + 0.8) : (effect.speed || 1);
    }
};
