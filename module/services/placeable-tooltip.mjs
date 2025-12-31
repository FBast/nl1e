import {Pl1eHelpers} from "../helpers/helpers.mjs";

export class PlaceableTooltip {
    static instance = null;
    static lastTarget = null;
    static lastData = null;

    constructor() {
        this.tooltip = this.createTooltip();
        document.body.append(this.tooltip);
        PlaceableTooltip.instance = this;
        PlaceableTooltip.hide();
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

    isLimitedForCurrentUser(doc) {
        if (!doc || !game?.user) return false;
        const { LIMITED } = CONST.DOCUMENT_OWNERSHIP_LEVELS ?? CONST.DOCUMENT_PERMISSION_LEVELS;
        return doc.testUserPermission(game.user, LIMITED, { exact: true }) === true;
    }

    applyFullIfLimited(doc) {
        const isLimited = this.isLimitedForCurrentUser(doc);
        this.content.querySelectorAll('.tooltip-body').forEach(el => {
            el.classList.toggle('full', isLimited);
        });
    }

    async setContent(target, data) {
        if (!data) return;

        PlaceableTooltip.lastTarget = target;
        PlaceableTooltip.lastData = data;

        const doc = target?.document;

        if (doc instanceof TokenDocument) {
            const resistances = [];
            const vulnerabilities = [];
            const defenses = [];
            const weapons = [];

            const reductions = data.system?.reductions ?? {};
            for (const [key, value] of Object.entries(reductions)) {
                const dmgLabel = Pl1eHelpers.getConfig("damageTypes", key, "label");
                if (!dmgLabel) continue;

                const icon =
                    Pl1eHelpers.getConfig("damageTypes", key, "icon") ??
                    "far fa-question-circle";
                const label = game.i18n.localize(dmgLabel);

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

            for (const [key, skill] of Object.entries(data.system.skills ?? {})) {
                const skillConfig = Pl1eHelpers.getConfig("skills", key);
                if (!skillConfig || !skillConfig.fixedRank) continue;

                defenses.push({
                    rank: skill.number,
                    icon: `fa-dice-d${skill.dice}`,
                    label: game.i18n.localize(skillConfig.label)
                });
            }

            this.content.innerHTML = await renderTemplate("systems/pl1e/templates/utils/token-tooltip.hbs", {
                name: target.name ?? "Sans nom",
                actor: data,
                weapons,
                resistances,
                vulnerabilities,
                defenses
            });
            return;
        }

        if (doc instanceof NoteDocument) {
            const page = doc.page;
            if (!page) return;

            const type = page.type || "default";
            const path = `systems/pl1e/templates/utils/note-tooltip-${type}.hbs`;
            const fallbackPath = `systems/pl1e/templates/utils/note-tooltip.hbs`;

            const templatePath = await Pl1eHelpers.templateExists(path) ? path : fallbackPath;

            this.content.innerHTML = await renderTemplate(templatePath, {
                page,
                document: page,
                system: page.system,
                data: page
            });
            this.applyFullIfLimited(page);
            return;
        }

        this.content.innerHTML = "Type de document non pris en charge.";
    }

    setPosition(target) {
        const scale = canvas.stage.scale.x;
        const gapX = 10;
        const gapY = 0;

        let widthOffset = 0;
        let heightOffset = 0;

        if (target instanceof Token) {
            widthOffset = (target.w + gapX) * scale;
            heightOffset = gapY;
        }
        else if (target instanceof Note) {
            const iconSize = target.controlIcon.size;
            widthOffset = (iconSize / 2 + gapX) * scale;
            heightOffset = (-iconSize / 2 + gapY) * scale;
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
        if (PlaceableTooltip.lastTarget) {
            await this.setContent(PlaceableTooltip.lastTarget, PlaceableTooltip.lastData);
        }
    }

    static async show({target, data}) {
        const tooltip = PlaceableTooltip.instance;
        PlaceableTooltip.lastTarget = target;
        PlaceableTooltip.lastData = data;
        tooltip.setPosition(target);
        await tooltip.setContent(target, data);
        tooltip.toggle(true);
    }

    static hide() {
        PlaceableTooltip.instance.toggle(false);
    }
}

Hooks.once("ready", () => {
    new PlaceableTooltip();

    Hooks.on("hoverToken", async (token, hovering) => {
        const actor = token?.actor;
        if (!actor || (actor.type !== "character" && actor.type !== "npc")) return PlaceableTooltip.hide();

        if (hovering) {
            await PlaceableTooltip.show({target: token, data: actor});
        } else {
            PlaceableTooltip.hide();
        }
    });

    Hooks.on("hoverNote", async (note, hovering) => {
        const journal = note.document?.entry;
        if (!journal) return PlaceableTooltip.hide();

        if (hovering) {
            await PlaceableTooltip.show({target: note, data: journal});
        } else {
            PlaceableTooltip.hide();
        }
    });

    Hooks.on("updateToken", (token) => {
        if (!PlaceableTooltip.lastTarget || token.id !== PlaceableTooltip.lastTarget.id) return;
        PlaceableTooltip.hide();
    });

    Hooks.on("updateActor", (actor) => {
        if (PlaceableTooltip.instance.lastTarget?.actor?.id === actor.id) {
            PlaceableTooltip.instance.refresh();
        }
    });

    Hooks.on("deleteToken", (token) => {
        if (token.id === PlaceableTooltip.lastTarget?.id) PlaceableTooltip.hide();
    });

    Hooks.on("renderTokenHUD", () => {
        PlaceableTooltip.hide();
    });

    Hooks.on("canvasPan", () => {
        if (!PlaceableTooltip.lastTarget) return;
        PlaceableTooltip.hide();
    });
});