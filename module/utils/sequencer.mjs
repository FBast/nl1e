import { PL1E } from "../pl1e.mjs";

export const Pl1eSequencer = {
    async playEffect(name, { characterData, targetsData, active }) {
        if (name === undefined) return;

        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        if (!game.pl1e.hasSequencer || !enableVFXAndSFX) return;

        const preset = PL1E.sequencerPresets[name];
        if (!preset) return ui.notifications.warn(`Effect '${name}' not found.`);

        const args = this.GetSequencerArgs({
            characterData,
            targetsData,
            templatesData: characterData?.templates,
            persist: active,
            active
        });

        const sequence = preset.factory?.(args);
        if (sequence) await sequence.play();
    },

    GetSequencerArgs({ characterData, targetsData, templatesData, persist, active }) {
        return {
            caster: this.GetCaster(characterData),
            targets: this.GetTargets(targetsData),
            templates: this.GetTemplates(templatesData),
            persist,
            active
        };
    },

    GetCaster(characterData) {
        const casterToken = canvas.tokens.get(characterData.tokenId);
        return {
            id: characterData?.tokenId,
            position: casterToken.position
        }
    },

    GetTargets(targetsData) {
        return targetsData?.map(t => {
            const token = canvas.tokens.get(t.tokenId);

            return {
                id: t.tokenId,
                position: token.position,
                result: t.result,
                skill: t.rollData.skillName
            };
        }) ?? [];
    },

    GetTemplates(templatesData) {
        return templatesData?.map(t => ({
            primaryPosition: t.primaryPosition ?? { x: t.x, y: t.y },
            secondaryPosition: t.secondaryPosition ?? { x: t.x, y: t.y },
            distance: t.distance ?? 0,
            direction: t.direction ?? 0
        })) ?? [];
    }
};