import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {PL1E} from "../pl1e.mjs";

export class TokenTooltip {
    static instance = null;
    static lastToken = null;
    static lastActor = null;

    constructor() {
        this.tooltip = this.createTooltip();
        document.body.append(this.tooltip);
        TokenTooltip.instance = this;
    }

    createTooltip() {
        this.content = this.createNode("div", { id: "token-tooltip", css: ["pl1e"] });

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

    async setContent(token, actor) {
        if (!actor) {
            this.content.innerHTML = "Aucune information disponible";
            return;
        }

        TokenTooltip.lastActor = actor;
        TokenTooltip.lastToken = token;

        const resistances = [];
        const vulnerabilities = [];
        const defenses = [];
        const weapons = [];

        for (const [key, value] of Object.entries(actor.system.reductions)) {
            const reductionConfig = Pl1eHelpers.getConfig("reductions", key);
            if (!reductionConfig) continue;

            const reductionLabel = Pl1eHelpers.getConfig("damageTypes", key);
            if (!reductionLabel) continue;

            const label = game.i18n.localize(reductionLabel);
            const icon = reductionConfig.icon ?? "fa-question-circle";

            if (value > 0) {
                resistances.push({ value, icon, label,  });
            } else if (value < 0) {
                vulnerabilities.push({ value, icon, label });
            }
        }

        for (const item of actor.items.filter(i => i.type === "weapon")) {
            if (!item.isEquipped) continue;
            weapons.push({
                icon: item.system.attributes.range > 0 ? "fa-bow-arrow" : "fa-sword",
                img: item.img,
                name: item.name
            });
        }

        for (const [key, skill] of Object.entries(actor.system.skills)) {
            const skillConfig = Pl1eHelpers.getConfig("skills", key);
            if (!skillConfig || !skillConfig.fixedRank) continue;

            defenses.push({
                rank: skill.number,
                icon: `fa-dice-d${skill.dice}`,
                label: game.i18n.localize(skillConfig.label)
            });
        }

        this.content.innerHTML = await renderTemplate("systems/pl1e/templates/apps/token-tooltip.hbs", {
            name: token.name ?? "Sans nom",
            actor: actor,
            weapons: weapons,
            resistances: resistances,
            vulnerabilities: vulnerabilities,
            defenses: defenses
        });
    }

    setPosition(token) {
        const scale = canvas.stage.scale.x;
        const tokenWidth = token.w * scale;
        const offset = 10;

        let left = token.worldTransform.tx + tokenWidth + offset;
        let top = token.worldTransform.ty;

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    toggle(visible) {
        this.tooltip.style.display = visible ? "block" : "none";
    }

    async refresh() {
        if (TokenTooltip.lastToken) await this.setContent(TokenTooltip.lastToken, TokenTooltip.lastToken.actor);
    }

    static show({ token, actor }) {
        const tooltip = TokenTooltip.instance;
        TokenTooltip.lastToken = token;
        TokenTooltip.lastActor = actor ?? token.actor;
        tooltip.setPosition(token);
        tooltip.setContent(token, actor);
        tooltip.toggle(true);
    }

    static hide() {
        TokenTooltip.instance.toggle(false);
    }
}

Hooks.once("ready", () => {
    new TokenTooltip();
    Hooks.on("hoverToken", onTokenHover);
    Hooks.on("updateToken", onTokenUpdate);
    Hooks.on("updateActor", onActorUpdate);
    Hooks.on("deleteToken", onDeleteToken);
    Hooks.on("renderTokenHUD", onRenderTokenHud);

    function onTokenHover(token, hovering) {
        const actor = token?.actor;
        if (!actor || actor.type === "basic") return TokenTooltip.hide();

        if (hovering && (actor.testUserPermission(game.user, "OBSERVER") || game.user.isGM)) {
            TokenTooltip.show({ token, actor });
        } else {
            TokenTooltip.hide();
        }
    }

    function onTokenUpdate(token) {
        if (!TokenTooltip.lastToken || token.id !== TokenTooltip.lastToken.id) return;
        TokenTooltip.hide();
        setTimeout(() => {
            TokenTooltip.instance.setPosition(token.object);
            TokenTooltip.instance.toggle(true);
        }, 100);
    }

    function onActorUpdate(actor) {
        if (TokenTooltip.instance.lastToken?.actor?.id === actor.id) TokenTooltip.instance.refresh();
    }

    function onDeleteToken(token) {
        if (token.id === TokenTooltip.lastToken?.id) TokenTooltip.hide();
    }

    function onRenderTokenHud(tokenhud) {
        TokenTooltip.hide();
    }
});