import { PL1E } from "../pl1e.mjs";
import {Pl1eTemplate} from "./template.mjs";

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

        try {
            const sequence = preset.factory?.(args);
            if (sequence) await sequence.play();
        } catch (error) {
            console.warn(`Erreur pendant le preset ${preset.label}:`, error);
        }
    },

    async playAutoEffects({ characterData, targetsData }) {
        const enableVFXAndSFX = game.settings.get("pl1e", "enableVFXAndSFX");
        if (!game.pl1e.hasSequencer || !enableVFXAndSFX) return;

        const args = this.GetSequencerArgs({
            characterData,
            targetsData,
            templatesData: characterData?.templates,
        });

        for (const [key, func] of Object.entries(PL1E.sequencerAuto)) {
            const sequence = func(args);
            if (sequence) sequence.play();
        }
    },

    GetSequencerArgs({ characterData, targetsData, templatesData, persist, active }) {
        return {
            caster: this.GetCaster(characterData),
            targets: this.GetTargets(targetsData),
            templates: this.GetTemplates(templatesData, targetsData),
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
        return targetsData?.map(tokenData => {
            const token = canvas.tokens.get(tokenData.tokenId);
            const templateDoc = canvas.templates.get(tokenData.template?.id);

            return {
                id: tokenData.tokenId,
                position: token.position,
                result: tokenData.result,
                skill: tokenData.rollData?.skillName,
                template: {
                    id: tokenData.template?.id,
                    primaryPosition: templateDoc ? Pl1eTemplate.getPrimaryPosition(templateDoc) : undefined,
                    secondaryPosition: templateDoc ? Pl1eTemplate.getSecondaryPosition(templateDoc) : undefined,
                    distance: tokenData.template?.distance ?? 0,
                    direction: tokenData.template?.direction ?? 0
                }
            };
        }) ?? [];
    },

    GetTemplates(templatesData, targetsData) {
        return templatesData?.map(templateData => {
            const templateDoc = canvas.templates.get(templateData.id);
            const templateTargets = targetsData?.filter(t => t.template?.id === templateData.id) ?? [];

            return {
                id: templateData.id,
                primaryPosition: templateDoc ? Pl1eTemplate.getPrimaryPosition(templateDoc) : undefined,
                secondaryPosition: templateDoc ? Pl1eTemplate.getSecondaryPosition(templateDoc) : undefined,
                distance: templateData.distance ?? 0,
                direction: templateData.direction ?? 0,
                targets: templateTargets.map(t => {
                    const token = canvas.tokens.get(t.tokenId);
                    return {
                        id: t.tokenId,
                        position: token?.position,
                        result: t.result,
                        skill: t.rollData?.skillName
                    };
                })
            };
        }) ?? [];
    }
};