import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eFormValidation} from "../main/formValidation.mjs";
import {Pl1eSynchronizer} from "../helpers/synchronizer.mjs";
import {PL1E} from "../config/config.mjs";
import {Pl1eAspect} from "../helpers/aspect.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Pl1eItemSheet extends ItemSheet {

    /** @inheritDoc */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["pl1e", "sheet", "item"],
            width: 520,
            height: 480,
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /** @inheritDoc */
    get template() {
        return `systems/pl1e/templates/item/item-${this.item.type}-sheet.hbs`;
    }

    /**
     * Custom header buttons
     * @returns {Application.HeaderButton[]}
     * @private
     */
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        if (game.user.isGM) {
            if (this.item.isEmbedded && this.item.sourceId !== undefined) {
                buttons.unshift({
                    label: 'PL1E.Original',
                    class: 'button-original',
                    icon: 'fas fa-clone',
                    onclick: async () => {
                        const item = await Pl1eHelpers.getDocument("Item", this.item.sourceId);
                        await this.close();
                        if (item.sheet.rendered) item.sheet.bringToTop();
                        else item.sheet.render(true);
                    }
                });
            }
            else if (!this.item.isEmbedded) {
                buttons.unshift({
                    label: 'PL1E.ResetActorsItems',
                    class: 'button-reset',
                    icon: 'fal fa-clone',
                    onclick: async () => {
                        await Pl1eSynchronizer.resetActorsItems(this.item, true);
                    }
                });
            }
            buttons.unshift({
                label: 'PL1E.Debug',
                class: 'button-debug',
                icon: 'fas fa-ban-bug',
                onclick: () => console.log(this)
            });
        }
        return buttons;
    }

    /** @inheritDoc */
    async getData() {
        // Retrieve base data structure.
        const context = super.getData();

        // Use a safe clone of the item data for further operations.
        const itemData = context.item;

        // Sheet editable if original or parent is token and user is owner
        if (this.item.isEmbedded) {
            this.options.editable = this.item.parent.isToken && this.item.isOwner;
        }
        else {
            this.options.editable = this.item.isOwner;
        }

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Prepare refItems
        await this._prepareItems(context);

        // Prepare aspects
        await this._prepareAspects(context);

        // Retrieve some documents from packs
        context.sequencerMacros = await this._listDocuments("legacy-sequencer-macros", true);
        context.modificationMacros = await this._listDocuments("legacy-modification-macros", true);
        context.invocations = await this._listDocuments("legacy-characters");

        // Add the actor's data to context.data for easier access
        context.system = itemData.system;
        context.flags = itemData.flags;
        context.config = CONFIG.PL1E;
        context.game = game;

        return context;
    }

    /** @inheritDoc */
    _updateObject(event, formData) {
        const deepenFormData = Pl1eHelpers.deepen(formData)
        if (deepenFormData.system.passiveAspects !== undefined) {
            for (const [id, aspect] of Object.entries(deepenFormData.system.passiveAspects)) {
                // Set passive aspect default data
                if (PL1E[aspect.dataGroup][aspect.data] === undefined)
                    aspect.data = Pl1eAspect.getDefaultData(aspect);

                // Set passive aspect default value
                if (aspect.data !== this.item.system.passiveAspects[id].data)
                    aspect.value = Pl1eAspect.getDefaultValue(aspect);
            }
        }

        if (deepenFormData.system.activeAspects !== undefined) {
            for (const [id, aspect] of Object.entries(deepenFormData.system.activeAspects)) {
                // Set passive aspect default value
                if (PL1E[aspect.dataGroup][aspect.data] === undefined)
                    aspect.data = Pl1eAspect.getDefaultData(aspect);

                // Set passive aspect default value
                if (aspect.data !== this.item.system.activeAspects[id].data)
                    aspect.value = Pl1eAspect.getDefaultValue(aspect);
            }
        }

        formData = Pl1eHelpers.flatten(deepenFormData);
        return super._updateObject(event, formData);
    }


    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Form validation
        Pl1eFormValidation.positiveDecimal();

        // Roll handlers, click handlers, etc. would go here.
        html.find(`.actor-edit`).on("click", ev => Pl1eEvent.onActorEdit(ev, this.item));
        html.find(`.item-edit`).on("click", ev => Pl1eEvent.onItemEdit(ev, this.item));
        html.find(`.item-remove`).on("click", ev => Pl1eEvent.onItemRemove(ev, this.item));
        html.find('.item-tooltip-activate').on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find('.currency-control').on("click", ev => Pl1eEvent.onCurrencyChange(ev, this.item));
        html.find(".trait-selector").on("click", ev => Pl1eEvent.onTraitSelector(ev, this.item));
        html.find('.aspect-add').on("click", ev => this._onAspectAdd(ev));
        html.find('.aspect-remove').on("click", ev => this._onAspectRemove(ev));
    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @private
     */
    async _onDrop(event) {
        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Check item type and subtype
        const data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        const uuidArray = data.uuid.split(".");
        const id = uuidArray[uuidArray.length - 1];
        const item = await Pl1eHelpers.getDocument("Item", id);
        if (!item) throw new Error(`PL1E | No item found with UUID ${data.uuid}`);

        if (CONFIG.PL1E.items[this.item.type].droppable.includes(item.type)) {
            await this.item.addRefItem(item);
            this.render();
        }
    }

    async _prepareItems(context) {
        // Get ref items using id
        const items = [];
        for (let i = 0; i < this.item.system.refItems.length; i++) {
            const id = this.item.system.refItems[i];
            let item = await Pl1eHelpers.getDocument("Item", id);
            if (!item) {
                // Create an unknown item for display
                item = {
                    type: "unknown",
                    id: id
                }
            }
            items[i] = item;
        }

        // Assign and return
        context.items = items;
        context.passiveAspects = this.item.system.passiveAspects;
        context.activeAspects = this.item.system.activeAspects;
        context.passiveAspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
        context.activeAspectsObjects = CONFIG.PL1E.activeAspectsObjects;
    }

    async _prepareAspects(context) {

    }

    /**
     * Retrieve a document list for dropdown selection
     * @param packName
     * @param includeNone
     * @return {Promise<{}>}
     * @private
     */
    async _listDocuments(packName, includeNone = false) {
        const documents = {};
        if (includeNone) documents[""] = "PL1E.None";

        const pack = game.packs.find(pack => pack.metadata.name === packName);
        for (const document of await pack.getDocuments()) {
            documents[document._id] = document.name;
        }

        return documents;
    }

    /**
     * Add an aspect
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onAspectAdd(event) {
        event.preventDefault();

        const aspectId = $(event.currentTarget).data("aspect-id");
        const aspectType = $(event.currentTarget).data("aspect-type");

        let target;
        let aspectsObjects;
        switch (aspectType) {
            case "passive":
                target = "passiveAspects";
                aspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
                break;
            case "active":
                target = "activeAspects";
                aspectsObjects = CONFIG.PL1E.activeAspectsObjects;
                break;
        }

        await this.item.update({
            [`system.${target}.${randomID()}`]: aspectsObjects[aspectId]
        });
    }

    /**
     * Remove an aspect
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onAspectRemove(event) {
        event.preventDefault();
        event.stopPropagation();

        const aspectId = $(event.currentTarget).closest(".item").data("aspect-id");
        const aspectType = $(event.currentTarget).closest(".item").data("aspect-type");

        let target;
        let aspectsObjects;
        switch (aspectType) {
            case "passive":
                target = "passiveAspects";
                aspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
                break;
            case "active":
                target = "activeAspects";
                aspectsObjects = CONFIG.PL1E.activeAspectsObjects;
                break;
        }

        await this.item.update({
            [`system.${target}.-=${aspectId}`]: null
        });
    }

}