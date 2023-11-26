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
        const itemType = CONFIG.PL1E.itemTypes[this.item.type];
        let label = "Unknown";
        if (itemType) label = game.i18n.localize(itemType.label);
        return this.item.actor ? `${label} (${this.item.actor.name})` : label;
    }

    /**
     * Custom header buttons
     * @returns {Application.HeaderButton[]}
     * @private
     */
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
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
        if (game.user.isGM) {
            if (!this.item.isEmbedded) {
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
                onclick: () => console.log("PL1E | Content of item sheet:", this)
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
        await this._prepareDocuments(context);
        await this._prepareDisplay(context);

        // Enriched HTML description
        context.enriched = await TextEditor.enrichHTML(this.item.system.description, {
            secrets: this.item.isOwner,
            async: true,
            relativeTo: this.item
        });

        // Retrieve some documents from packs
        context.sequencerMacros = await this._listDocuments("legacy-sequencer-macros", true);
        context.modificationMacros = await this._listDocuments("legacy-modification-macros", true);
        context.invocations = await this._listDocuments("legacy-characters");

        return context;
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

        // Bind event listener for dataGroup dropdown change
        html.find("[name^='system.passiveAspects.'][name$='.dataGroup']").on('change', event => this._onDataGroupChange(event, html, "passive"));
        html.find("[name^='system.activeAspects.'][name$='.dataGroup']").on('change', event => this._onDataGroupChange(event, html, "active"));

        // Bind event listener for data dropdown change
        html.find("[name^='system.passiveAspects.'][name$='.data']").on('change', event => this._onDataChange(event, html, "passive"));
        html.find("[name^='system.activeAspects.'][name$='.data']").on('change', event => this._onDataChange(event, html, "active"));
    }

    _onDataGroupChange(event, html, aspectType) {
        const selectedDataGroup = event.target.value;
        const aspectId = $(event.currentTarget).closest(".item").data("aspect-id");

        // Fetch new options based on dataGroup
        const dataGroupObject = PL1E[selectedDataGroup];
        if (!dataGroupObject) {
            console.warn(`PL1E | Data group ${selectedDataGroup} not found`);
            return;
        }
        const newDataOptions = Object.entries(dataGroupObject).map(([key, value]) => ({
            value: key,
            text: game.i18n.localize(value.label)
        }));

        // Update the data dropdown options
        const dataDropdown = html.find(`[name='system.${aspectType}Aspects.${aspectId}.data']`);
        dataDropdown.empty();
        newDataOptions.forEach(option => {
            dataDropdown.append($('<option>', { value: option.value, text: option.text }));
        });

        // Determine the default data for the selected data group
        const defaultData = Pl1eAspect.getDefaultData({ dataGroup: selectedDataGroup });

        // Automatically set default data for the newly populated dropdown and trigger change event
        if (newDataOptions.length > 0) {
            dataDropdown.val(defaultData).change(); // Set value to the default data and trigger change event
        }
    }

    async _onDataChange(event, html, aspectType) {
        const selectedData = event.target.value;
        const aspectId = $(event.currentTarget).closest(".item").data("aspect-id");

        // Retrieve the selected dataGroup from the corresponding dropdown
        const dataGroupDropdown = html.find(`[name='system.${aspectType}Aspects.${aspectId}.dataGroup']`);
        const dataGroup = dataGroupDropdown.val();
        if (!dataGroup) return;

        // Get the default value for the selected data
        const aspect = { dataGroup, data: selectedData };
        const defaultValue = await Pl1eAspect.getDefaultValue(aspect);

        // Check the type of the value field and set it accordingly
        const dataConfig = PL1E[dataGroup][selectedData];

        const valueHTML = html.find(`[name='system.${aspectType}Aspects.${aspectId}.value']`);

        switch (dataConfig.type) {
            case "number":
                // Convert number to string if necessary and set the value
                valueHTML.val(defaultValue).trigger('change');
                break;
            case "bool":
                // Set the value directly for boolean type
                valueHTML.val(defaultValue);
                break;
            case "array":
            case "select":
                // If it's an array or select, trigger change event to update the dropdown
                valueHTML.val(defaultValue).trigger('change');
                break;
        }

    }

    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @private
     */
    async _onDrop(event) {
        // Return if the sheet is not editable
        if (!this.isEditable) return;

        // Extract and validate the dropped data
        const data = JSON.parse(event.dataTransfer?.getData("text/plain"));
        let document = await fromUuid(data.uuid);
        if (!document.isOwner) {
            ui.notifications.warn(game.i18n.localize("PL1E.NotOwnedDocument"));
            return;
        }

        // Function to check module-specific conditions
        const checkModuleConditions = async (document, item) => {
            if (document.type !== "module") return true;

            const isInvalidWearable = item.type === "wearable" &&
                !document.system.attributes.moduleTypes.includes(item.system.attributes.slot);
            const isInvalidWeapon = item.type === "weapon" &&
                !document.system.attributes.moduleTypes.includes("weapon");
            if (isInvalidWearable || isInvalidWeapon) {
                ui.notifications.warn(game.i18n.localize("PL1E.IncorrectModule"));
                return false;
            }

            const items = await item.getSubItems();
            if (items.filter(i => i.type === "module").length >= item.system.attributes.modules) {
                ui.notifications.warn(game.i18n.localize("PL1E.TooMuchModule"));
                return false;
            }
            return true;
        };

        // Common logic for handling items
        const handleItem = async (document) => {
            const itemTypeConfig = this.item.isEmbedded ?
                CONFIG.PL1E.itemTypes[this.item.type].localDroppable :
                CONFIG.PL1E.itemTypes[this.item.type].droppable;
            if (!itemTypeConfig.includes(document.type)) return;

            if (!await checkModuleConditions(document, this.item)) return;

            if (this.item.isEmbedded) {
                const originalItem = await Pl1eHelpers.getDocument("Item", document.sourceId);
                await this.item.addRefItem(originalItem);
                if (document.isEmbedded) await document.actor.removeItem(document);
            } else {
                await this.item.addRefItem(document);
            }

            this.render();
        };

        // Process the dropped item
        await handleItem(document);
    }

    /**
     * Organize and classify Items for Character sheets.
     * @param {Object} context The actor to prepare.
     * @return {undefined}
     */
    async _prepareItems(context) {
        // Initialize containers.
        let items = [];
        let masters = [];
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
            else if (item.type === "mastery") {
                masters.push(item);
            }
            else if (item.type === "ability") {
                abilities.push(item);
            }
            else if (item.type === "feature") {
                features.push(item);
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

        // Iterate on aspects to create description
        for (const [id, aspect] of Object.entries(context.item.system.passiveAspects)) {
            aspect.description = await Pl1eAspect.getDescription(aspect);
        }
        for (const [id, aspect] of Object.entries(context.item.system.activeAspects)) {
            aspect.description = await Pl1eAspect.getDescription(aspect);
        }

        // Sorting arrays
        abilities = abilities.sort((a, b) => a.name.localeCompare(b.system.attributes.level));
        features = features.sort((a, b) => a.name.localeCompare(b.name));
        weapons = weapons.sort((a, b) => a.name.localeCompare(b.name));
        wearables = wearables.sort((a, b) => a.name.localeCompare(b.name));
        modules = modules.sort((a, b) => a.name.localeCompare(b.name));

        // Assign and return
        context.items = items;
        context.masters = masters;
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

    async _prepareDocuments(context) {
        context.documents = {
            masters: await Pl1eHelpers.getDocumentsData("Item", "mastery")
        }
    }

    async _prepareDisplay(context) {
        // Attributes
        const attributesDisplay = {};
        for (let [key, value] of Object.entries(context.system.attributes)) {
            const attributeConfig = CONFIG.PL1E.attributes[key];
            if (attributeConfig === undefined || !attributeConfig.inDescription) continue;

            // Type modification
            if (Array.isArray(value)) {
                value = value.map(value => {
                    const label = CONFIG.PL1E[attributeConfig.select][value]
                    return game.i18n.localize(label);
                }).join(", ");
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
                description: await Pl1eAspect.getDescription(aspectCopy),
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
                description: await Pl1eAspect.getDescription(aspectCopy),
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
        const docs = await pack.getDocuments();

        // Order by name
        const sortedDocs = docs.sort((a, b) => a.name.localeCompare(b.name));

        for (const document of sortedDocs) {
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
        event.stopPropagation();

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

        if (this.item.compendium) {
            await this.renderAndRestoreState();
        }
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

        if (this.item.compendium) {
            await this.renderAndRestoreState();
        }
    }

    async renderAndRestoreState() {
        // Check if the item is from a compendium before proceeding
        if (!this.item.compendium) return;

        let activeTab = this.element.find('.tabs .active').data('tab');
        let scrollPosition = this.element.find(`.tab.active .scroll-auto`).scrollTop();

        // Hook into Foundry's render event
        Hooks.once("renderItemSheet", (app, html, data) => {
            // Restore tab
            const tabElement = html.find(`.tabs [data-tab="${activeTab}"]`).get(0);
            if (tabElement) {
                const event = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
                tabElement.dispatchEvent(event);
            }

            // Restore the scroll position
            const scrollContainer = html.find(`.tab.active .scroll-auto`);
            if (scrollContainer.length) {
                scrollContainer.scrollTop(scrollPosition);
            }
        });

        // Fetch the updated item and render the sheet
        const updatedItem = await Pl1eHelpers.getDocument("Item", this.item.id);
        await updatedItem.sheet.render(true);
    }

}