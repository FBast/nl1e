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

        const seq = preset.factory?.(args);
        if (!seq) return;
        await seq.play();
    },

    GetSequencerArgs({ characterData, targetsData, templatesData, persist, active }) {
        return {
            caster: this.GetCaster(characterData),
            targets: this.GetTargets(targetsData),
            templates: this.GetTemplates(templatesData),
            missedTargets: this.GetMissedTargets(targetsData),
            persist,
            active
        };
    },

    GetCaster(characterData) {
        return characterData?.tokenId;
    },

    GetTargets(targetsData) {
        return targetsData?.map(t => t.tokenId ?? (t.x !== undefined ? { x: t.x, y: t.y } : undefined)) ?? [];
    },

    GetMissedTargets(targetsData) {
        return targetsData?.filter(t => t.result <= 0).map(t => t.tokenId ?? (t.x !== undefined ? { x: t.x, y: t.y } : undefined)) ?? [];
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