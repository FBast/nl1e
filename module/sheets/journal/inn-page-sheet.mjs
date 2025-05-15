import { Pl1eEvent } from "../../helpers/events.mjs";
import {Pl1eJournalPageSheet} from "./journal-page-sheet.mjs";
import {Pl1eHelpers} from "../../helpers/helpers.mjs";

export class Pl1eInnPageSheet extends Pl1eJournalPageSheet {
    selectedRest = "normal";

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            dragDrop: [{ dropSelector: ".drop-target" }],
            submitOnChange: true
        });
    }

    async getData(options) {
        const context = await super.getData(options);

        context.rest = Pl1eHelpers.getConfig("rest");
        context.selectedRest = this.selectedRest;

        return context;
    }

    async activateListeners(html) {
        super.activateListeners(html);

        html.find(".rest-toggle .toggle-item").on("click", ev => this._onSelectRest(ev));

        html.find(".confirm-rest").on("click", ev => this._onConfirmRest(ev));

        html.find(".item-tooltip-activate").on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find(".item-edit").on("click", ev => Pl1eEvent.onItemEdit(ev, this.document));
    }

    _onSelectRest(event) {
        event.preventDefault();
        const el = event.currentTarget;
        this.selectedRest = el.dataset.value;

        // Visuel immédiat
        $(el).siblings().removeClass("selected");
        $(el).addClass("selected");
    }

    async _onConfirmRest(event) {
        event.preventDefault();

        const user = game.user;
        const actor = game.actors.get(user.character?.id);
        if (!actor) return ui.notifications.warn("Aucun personnage n’est contrôlé.");

        const restConfig = Pl1eHelpers.getConfig("rest");
        const restData = restConfig[this.selectedRest];
        if (!restData) return;

        const updates = {};

        for (const [attr, value] of Object.entries(restData.effects)) {
            const current = foundry.utils.getProperty(actor.system, `resources.${attr}.value`) ?? 0;
            const max = foundry.utils.getProperty(actor.system, `resources.${attr}.max`) ?? 0;
            updates[`system.resources.${attr}.value`] = Math.clamp(current + value, 0, max);
        }

        await actor.update(updates);
        ui.notifications.info(`${actor.name} s’est reposé dans un lit ${game.i18n.localize(restData.tooltip)}.`);
    }
}