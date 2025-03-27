import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class TokenTooltip {
    static instance = null;
    static lastTarget = null;
    static lastData = null;

    constructor() {
        this.tooltip = this.createTooltip();
        document.body.append(this.tooltip);
        TokenTooltip.instance = this;
    }

    createTooltip() {
        this.content = this.createNode("div", { id: "placeable-tooltip", css: ["pl1e"] });
        return this.content;
    }

    createNode(element, { text, html, css = [], id, name } = {}) {
        const el = document.createElement(element);
        if (text) el.textContent = text;
        else if (html) el.innerHTML = html;
        if (css.length) el.classList.add(...css);
        if (id) el.id = id;
        if (name) el.name = name;
        return el;
    }

    async setContent(target, data) {
        if (!data) {
            this.content.innerHTML = "Aucune information disponible";
            return;
        }

        TokenTooltip.lastTarget = target;
        TokenTooltip.lastData = data;

        if (data.items) {
            // Actor (Token)
            const resistances = [];
            const vulnerabilities = [];
            const defenses = [];
            const weapons = [];

            for (const [key, value] of Object.entries(data.system.reductions)) {
                const reductionConfig = Pl1eHelpers.getConfig("reductions", key);
                const labelConfig = Pl1eHelpers.getConfig("damageTypes", key);
                if (!reductionConfig || !labelConfig) continue;

                const label = game.i18n.localize(labelConfig);
                const icon = reductionConfig.icon ?? "fa-question-circle";

                const entry = { value, icon, label };
                if (value > 0) resistances.push(entry);
                else if (value < 0) vulnerabilities.push(entry);
            }

            for (const item of data.items.filter(i => i.type === "weapon")) {
                weapons.push({
                    icon: item.isEquipped ? "fa-check" : "fa-xmark",
                    img: item.img,
                    name: item.name
                });
            }

            for (const [key, skill] of Object.entries(data.system.skills)) {
                const skillConfig = Pl1eHelpers.getConfig("skills", key);
                if (!skillConfig || !skillConfig.fixedRank) continue;

                defenses.push({
                    rank: skill.number,
                    icon: `fa-dice-d${skill.dice}`,
                    label: game.i18n.localize(skillConfig.label)
                });
            }

            this.content.innerHTML = await renderTemplate("systems/pl1e/templates/apps/token-tooltip.hbs", {
                name: target.name ?? "Sans nom",
                actor: data,
                weapons,
                resistances,
                vulnerabilities,
                defenses
            });
        } else {
            // Journal (Note)
            const page = target.document?.page;
            if (!page) return;

            this.content.innerHTML = await renderTemplate(`systems/pl1e/templates/apps/note-tooltip.hbs`, {
                page,
                document: page,
                system: page.system,
                data: page
            });
        }
    }

    setPosition(target) {
        const scale = canvas.stage.scale.x;
        const gap = 5;

        let widthOffset = 0;
        let heightOffset = 0;

        if (target instanceof Token) {
            widthOffset = (target.w + gap) * scale;
        }
        else if (target instanceof Note) {
            widthOffset = (target.width / 2 + gap) * scale;
            heightOffset = -target.height / 2 * scale;
        }

        const left = target.worldTransform.tx + widthOffset;
        const top = target.worldTransform.ty + heightOffset;

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    toggle(visible) {
        this.tooltip.style.display = visible ? "block" : "none";
    }

    async refresh() {
        if (TokenTooltip.lastTarget) {
            await this.setContent(TokenTooltip.lastTarget, TokenTooltip.lastData);
        }
    }

    static async show({target, data}) {
        const tooltip = TokenTooltip.instance;
        TokenTooltip.lastTarget = target;
        TokenTooltip.lastData = data;
        tooltip.setPosition(target);
        await tooltip.setContent(target, data);
        tooltip.toggle(true);
    }

    static hide() {
        TokenTooltip.instance.toggle(false);
    }
}

Hooks.once("ready", () => {
    new TokenTooltip();

    Hooks.on("hoverToken", (token, hovering) => {
        const actor = token?.actor;
        if (!actor || (actor.type !== "character" && actor.type !== "npc")) return TokenTooltip.hide();
        if (hovering) {
            TokenTooltip.show({ target: token, data: actor });
        } else {
            TokenTooltip.hide();
        }
    });

    Hooks.on("hoverNote", (note, hovering) => {
        if (note.document?.page.type !== "organization" && note.document?.page.type !== "location"
            && note.document?.page.type !== "character") return TokenTooltip.hide();
        const journal = note.document?.entry;
        if (!journal || !hovering) return TokenTooltip.hide();
        TokenTooltip.show({ target: note, data: journal });
    });

    Hooks.on("updateToken", (token) => {
        if (!TokenTooltip.lastTarget || token.id !== TokenTooltip.lastTarget.id) return;
        TokenTooltip.hide();
    });

    Hooks.on("updateActor", (actor) => {
        if (TokenTooltip.instance.lastTarget?.actor?.id === actor.id) {
            TokenTooltip.instance.refresh();
        }
    });

    Hooks.on("deleteToken", (token) => {
        if (token.id === TokenTooltip.lastTarget?.id) TokenTooltip.hide();
    });

    Hooks.on("renderTokenHUD", () => {
        TokenTooltip.hide();
    });

    Hooks.on("canvasPan", () => {
        if (!TokenTooltip.lastTarget) return;
        TokenTooltip.hide();
    });
});