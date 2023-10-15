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
        return `systems/pl1e/templates/item/item-base-sheet.hbs`;
    }

    /** @inheritDoc */
    get title() {
        const label = game.i18n.localize(CONFIG.PL1E.itemTypes[this.item.type].label) || "Unknown";
        return this.item.actor ? `${label} (${this.item.actor.name})` : label;
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
        // context.item = this.item.toObject(false);

        // Sheet editable if original or parent is token and user is owner
        this.options.editable = this.item.isOwner;

        // Retrieve the roll data for TinyMCE editors.
        context.rollData = {};
        let actor = this.object?.parent ?? null;
        if (actor) {
            context.rollData = actor.getRollData();
        }

        // Add the actor's data to context.data for easier access
        context.item = this.item;
        context.system = this.item.system;
        context.flags = this.item.flags;
        context.config = CONFIG.PL1E;
        context.game = game;

        // Prepare refItems
        await this._prepareItems(context);
        await this._prepareDisplay(context);

        // Enrich HTML description
        context.enriched = await TextEditor.enrichHTML(this.item.system, {
            secrets: this.item.isOwner,
            async: true,
            relativeTo: this.item,
            rollData: context.rollData
        });

        // Retrieve some documents from packs
        context.sequencerMacros = await this._listDocuments("legacy-sequencer-macros", true);
        context.modificationMacros = await this._listDocuments("legacy-modification-macros", true);
        context.invocations = await this._listDocuments("legacy-characters");

        return context;
    }

    /** @inheritDoc */
    _updateObject(event, formData) {
        const deepenFormData = Pl1eHelpers.deepen(formData)
        if (deepenFormData.system?.passiveAspects !== undefined) {
            for (const [id, aspect] of Object.entries(deepenFormData.system.passiveAspects)) {
                // Set passive aspect default data
                if (PL1E[aspect.dataGroup][aspect.data] === undefined)
                    aspect.data = Pl1eAspect.getDefaultData(aspect);

                // Set passive aspect default value
                if (aspect.data !== this.item.system.passiveAspects[id].data)
                    aspect.value = Pl1eAspect.getDefaultValue(aspect);
            }
        }

        if (deepenFormData.system?.activeAspects !== undefined) {
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
        html[0].querySelectorAll(".launch-text-editor").forEach(e => {
            e.addEventListener("click", ev => Pl1eEvent.onLaunchTextEditor(ev, this.item));
        });
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
        let document = await fromUuid(data.uuid)

        // Check if the user own the dropped document
        if (!document.isOwner) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotOwnedDocument"));
            return;
        }

        // Check if item can be dropped into this
        if (this.item.isEmbedded) {
            if (!CONFIG.PL1E.itemTypes[this.item.type].localDroppable.includes(document.type)) return;

            // If item is module
            if (document.type === "module") {
                // If module capacity is full
                const items = await this.item.getSubItems();
                if (items.filter(item => item.type === "module").length >= this.item.system.attributes.modules) {
                    ui.notifications.warn(game.i18n.localize("PL1E.TooMuchModule"));
                    return;
                }
            }

            // Retrieve original item
            const originalItem = await Pl1eHelpers.getDocument("Item", document.sourceId);
            await this.item.addRefItem(originalItem);
            this.render();

            // Remove item if embedded
            if (document.isEmbedded) await document.actor.removeItem(document);
        }
        else {
            if (!CONFIG.PL1E.itemTypes[this.item.type].droppable.includes(document.type)) return;

            await this.item.addRefItem(document);
            this.render();
        }
    }

    /**
     * Organize and classify Items for Character sheets.
     * @param {Object} context The actor to prepare.
     * @return {undefined}
     */
    async _prepareItems(context) {
        // Initialize containers.
        let items = [];
        let abilities = [];
        let features = [];
        let weapons = [];
        let wearables = [];
        let modules = [];
        let unknowns = [];

        // Iterate through subItems, allocating to containers
        const allRefs = [...context.item.system.refItems, ...context.item.system.localRefItems];
        for (const id of allRefs) {
            let item = await Pl1eHelpers.getDocument("Item", id);
            items.push(item);
            if (!item) {
                // Create an unknown item for display
                unknowns.push({
                    type: "unknown",
                    id: id
                });
            }
            else if (item.type === "feature") {
                features.push(item);
            }
            else if (item.type === "ability") {
                abilities.push(item);
            }
            else if (item.type === "weapon") {
                weapons.push(item);
            }
            else if (item.type === "wearable") {
                wearables.push(item);
            }
            else if (item.type === "module") {
                modules.push(item);
            }
        }

        // Sorting arrays
        abilities = abilities.sort((a, b) => a.name.localeCompare(b.system.attributes.level));
        features = features.sort((a, b) => a.name.localeCompare(b.name));
        weapons = weapons.sort((a, b) => a.name.localeCompare(b.name));
        wearables = wearables.sort((a, b) => a.name.localeCompare(b.name));
        modules = modules.sort((a, b) => a.name.localeCompare(b.name));

        // Assign and return
        context.items = items;
        context.abilities = abilities;
        context.features = features;
        context.weapons = weapons;
        context.wearables = wearables;
        context.modules = modules;
        context.unknowns = unknowns;
        context.passiveAspects = context.item.system.passiveAspects;
        context.activeAspects = context.item.system.activeAspects;
        context.passiveAspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
        context.activeAspectsObjects = CONFIG.PL1E.activeAspectsObjects;
    }

    async _prepareDisplay(context) {
        // Attributes
        const attributesDisplay = {};
        for (let [key, value] of Object.entries(context.system.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig === undefined || !attributeConfig.show) continue;

            // Type modification
            if (Array.isArray(value)) {
                value = value.map(value => {
                    const label = CONFIG.PL1E[attributeConfig.select][value]
                    return game.i18n.localize(label);
                }).join(', ');
            }
            else if (attributeConfig.type === "select") {
                value = CONFIG.PL1E[attributeConfig.select][value];
                value = game.i18n.localize(value);
            }
            else if (typeof value === "boolean") {
                value = game.i18n.localize(value ? "PL1E.Yes" : "PL1E.No");
            }
            else if (value === 0) continue;
            
            // Assign the attribute display
            attributesDisplay[key] = Object.assign({}, attributeConfig, {
                label: game.i18n.localize(attributeConfig.label),
                value: value
            });
        }
        context.attributesDisplay = attributesDisplay;

        // Passive aspects
        const passiveAspectsDisplay = {}
        for (let [key, aspect] of Object.entries(await this.item.getCombinedPassiveAspects())) {
            let aspectCopy = Object.assign({}, aspect);
            const aspectConfig = CONFIG.PL1E.aspects[aspectCopy.name];
            if (aspectConfig === undefined) continue;

            passiveAspectsDisplay[key] = Object.assign({}, aspectConfig, {
                label: game.i18n.localize(aspectConfig.label),
                description: Pl1eAspect.getDescription(aspectCopy),
            });
        }
        context.passiveAspectsDisplay = passiveAspectsDisplay;

        // Active aspects
        const activeAspectsDisplay = {}
        for (let [key, aspect] of Object.entries(await this.item.getCombinedActiveAspects())) {
            let aspectCopy = Object.assign({}, aspect);
            const aspectConfig = CONFIG.PL1E.aspects[aspectCopy.name];
            if (aspectConfig === undefined) continue;
            activeAspectsDisplay[key] = Object.assign({}, aspectConfig, {
                label: game.i18n.localize(aspectConfig.label),
                description: Pl1eAspect.getDescription(aspectCopy),
            });
        }
        context.activeAspectsDisplay = activeAspectsDisplay;
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