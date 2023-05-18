import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eFormValidation} from "../helpers/formValidation.mjs";
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
            if (this.item.isEmbedded) {
                buttons.unshift({
                    label: 'PL1E.Original',
                    class: 'button-original',
                    icon: 'fas fa-clone',
                    onclick: async () => {
                        await this.close();
                        const item = await Pl1eHelpers.getDocument(this.item.sourceId, "Item");
                        item.sheet.renderOnTop();
                    }
                });
            }
            else {
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

        // Sheet editable if original and user is owner
        this.options.editable = !this.item.isEmbedded && this.item.isOwner;

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Prepare refItems
        await this._prepareItems(context);

        // Prepare macros
        await this._prepareMacros(context);

        // Add the actor's data to context.data for easier access
        context.system = itemData.system;
        context.flags = itemData.flags;
        context.config = CONFIG.PL1E;
        context.game = game;

        return context;
    }

    _updateObject(event, formData) {
        // Set the passive aspects default data and default value
        const deepenFormData = Pl1eHelpers.deepen(formData)
        if (deepenFormData.system.passiveAspects !== undefined) {
            for (const [id, aspect] of Object.entries(deepenFormData.system.passiveAspects)) {
                if (PL1E[aspect.dataGroup][aspect.data] === undefined)
                    aspect.data = Pl1eAspect.getDefaultData(aspect);
                if (aspect.data !== this.item.system.passiveAspects[id].data)
                    aspect.value = Pl1eAspect.getDefaultValue(aspect);
            }
        }

        // Set the active aspects default data and default value
        if (deepenFormData.system.activeAspects !== undefined) {
            for (const [id, aspect] of Object.entries(deepenFormData.system.activeAspects)) {
                if (PL1E[aspect.dataGroup][aspect.data] === undefined)
                    aspect.data = Pl1eAspect.getDefaultData(aspect);
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
        html.find('.attribute-add').on("click", ev => Pl1eEvent.onAttributeAdd(ev, this.item))
        html.find('.attribute-remove').on("click", ev => Pl1eEvent.onAttributeRemove(ev, this.item))
        html.find('.aspect-add').on("click", ev => this._onAspectAdd(ev))
        html.find('.aspect-remove').on("click", ev => this._onAspectRemove(ev))
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
        let data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        let itemId = data.uuid.split(".")[1];
        let item = await Pl1eHelpers.getDocument(itemId, "Item");
        if (!item) throw new Error(`PL1E | No item found with UUID ${data}`);

        if (CONFIG.PL1E.items[this.item.type].droppable.includes(item.type)) {
            await this.item.addRefItem(item);
        }
    }

    async _prepareItems(context) {
        // Get ref itemsParents using id
        const itemsParents = [];
        for (let i = 0; i < this.item.system.refItemsParents.length; i++) {
            const id = this.item.system.refItemsParents[i];
            let item = await Pl1eHelpers.getDocument(id, "Item");
            if (!item) {
                // Create an unknown item for display
                item = {
                    type: "unknown",
                    id: id
                }
            }
            itemsParents[i] = item;
        }


        // Get ref itemsChildren using id
        const itemsChildren = [];
        for (let i = 0; i < this.item.system.refItemsChildren.length; i++) {
            const id = this.item.system.refItemsChildren[i];
            let item = await Pl1eHelpers.getDocument(id, "Item");
            if (!item) {
                // Create an unknown item for display
                item = {
                    type: "unknown",
                    id: id
                }
            }
            itemsChildren[i] = item;
        }

        // Get ref actorsParents using id
        const actorsParents = [];
        for (let i = 0; i < this.item.system.refActors.length; i++) {
            const id = this.item.system.refActors[i];
            let actor = await Pl1eHelpers.getDocument(id, "Actor");
            if (!actor) {
                // Create an unknown item for display
                actor = {
                    type: "unknown",
                    id: id
                }
            }
            actorsParents[i] = actor;
        }

        // Assign and return
        context.itemsParents = itemsParents;
        context.itemsChildren = itemsChildren;
        context.actorsParents = actorsParents;
        context.passiveAspects = this.item.system.passiveAspects;
        context.activeAspects = this.item.system.activeAspects;
        context.passiveAspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
        context.activeAspectsObjects = CONFIG.PL1E.activeAspectsObjects;
    }

    async _prepareMacros(context) {
        const itemMacros = {
            "": "PL1E.None"
        };

        const itemMacrosPack = game.packs.find(pack => pack.metadata.name === "item-macros");
        for (const macro of await itemMacrosPack.getDocuments()) {
            itemMacros[macro._id] = macro.name;
        }

        context.itemMacros = itemMacros;
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

    /**
     * Short method to render if not or bring on top
     */
    renderOnTop() {
        if (this.rendered) this.bringToTop();
        else this.render(true);
    }

}