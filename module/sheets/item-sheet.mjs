import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eFormValidation} from "../main/form-validation.mjs";
import {Pl1eAspect} from "../helpers/aspect.mjs";
import {PL1E} from "../pl1e.mjs";
import {PL1ESheetMixin} from "./sheet.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class Pl1eItemSheet extends PL1ESheetMixin(ItemSheet) {

    constructor(...args) {
        super(...args);
    }

    /** @inheritDoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["pl1e", "sheet", "item"],
            width: 500,
            height: 500,
            scrollY: [
                ".scroll-auto"
            ],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
    }

    /** @inheritDoc */
    get template() {
        return `systems/pl1e/templates/item/item-base-sheet.hbs`;
    }

    /** @inheritDoc */
    get title() {
        const itemType = Pl1eHelpers.getConfig("itemTypes", this.item.type);
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
                    await this.close();
                }
            });
        }
        if (game.user.isGM) {
            buttons.unshift({
                label: 'PL1E.Debug',
                class: 'button-debug',
                icon: 'fas fa-ban-bug',
                onclick: () => console.log("PL1E | content of item sheet:", this)
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
        // this.options.editable = this.item.isOwner;

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
        context.config = PL1E;
        context.game = game;

        // Prepare refItems
        await this._prepareItems(context);
        await this._prepareDisplay(context);

        // Enriched HTML description
        context.enriched = await TextEditor.enrichHTML(this.item.system.description, {
            secrets: this.item.isOwner,
            async: true,
            relativeTo: this.item
        });

        return context;
    }

    /** @inheritDoc */
    activateListeners(html) {
        super.activateListeners(html);

        html.find(`.item-edit`).on("click", ev => Pl1eEvent.onItemEdit(ev));

        // Everything below here is only needed if the sheet is editable
        if (!this.isEditable) return;

        // Form validation
        Pl1eFormValidation.positiveDecimal();

        // Roll handlers, click handlers, etc. would go here.
        html.find(`.item-remove`).on("click", ev => Pl1eEvent.onItemRemove(ev, this.item));
        html.find(`.item-switch-behavior`).on("click", ev => Pl1eEvent.onItemSwitchBehavior(ev, this.item));
        html.find('.item-tooltip-activate').on("click", ev => Pl1eEvent.onItemTooltip(ev));
        html.find('.field-tooltip-activate').on("click", ev => Pl1eEvent.onFieldTooltip(ev));
        html.find('.spin-number').on("click", ev => Pl1eEvent.onSpinNumber(ev, this.item));
        html.find(".trait-selector").on("click", ev => Pl1eEvent.onTraitSelector(ev, this.item));
        html.find('.aspect-add').on("click", ev => this._onAspectAdd(ev));
        html.find('.aspect-remove').on("click", ev => this._onAspectRemove(ev));
        html.find('.passive-aspects-copy').on("click", ev => this._onAspectsCopy(ev, "passive"));
        html.find('.passive-aspects-paste').on("click", ev => this._onAspectsPaste(ev, "passive"));
        html.find('.active-aspects-copy').on("click", ev => this._onAspectsCopy(ev, "active"));
        html.find('.active-aspects-paste').on("click", ev => this._onAspectsPaste(ev, "active"));
        html[0].querySelectorAll(".launch-text-editor").forEach(e => {
            e.addEventListener("click", ev => Pl1eEvent.onLaunchTextEditor(ev, this.item));
        });

        // Item actions
        html.find('.switch-customize').on('click', ev => this._onSwitchCustomize(ev));

        // Bind event listener for dataGroup dropdown change
        html.find("[name^='system.passiveAspects.'][name$='.dataGroup']").on('change', event => this._onDataGroupChange(event, html, "passive"));
        html.find("[name^='system.activeAspects.'][name$='.dataGroup']").on('change', event => this._onDataGroupChange(event, html, "active"));

        // Bind event listener for data dropdown change
        html.find("[name^='system.passiveAspects.'][name$='.data']").on('change', event => this._onDataChange(event, html, "passive"));
        html.find("[name^='system.activeAspects.'][name$='.data']").on('change', event => this._onDataChange(event, html, "active"));

        html.find('.sheet-header, .sheet-tabs, .sheet-body').each((i, el) => {
            el.addEventListener('dragover', event => event.preventDefault());
            el.addEventListener('drop', this._onDrop.bind(this));
        });
    }

    _onDataGroupChange(event, html, aspectType) {
        const selectedDataGroup = event.target.value;
        const aspectId = $(event.currentTarget).closest(".item").data("aspect-id");

        // Fetch new options based on dataGroup
        const dataGroupObject = PL1E[selectedDataGroup];
        if (!dataGroupObject) {
            console.warn(`PL1E | data group ${selectedDataGroup} not found`);
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
        const aspectPath = `system.${aspectType}Aspects.${aspectId}`;

        // Retrieve the selected dataGroup from the corresponding dropdown
        const dataGroupDropdown = html.find(`[name='${aspectPath}']`);
        const dataGroup = dataGroupDropdown.val();
        if (!dataGroup) return;

        // Get the default value for the selected data
        const aspect = {dataGroup, data: selectedData};
        const defaultValue = Pl1eAspect.getDefaultValue(aspect);
        const data = {
            [`${aspectPath}.data`]: selectedData,
        }

        // If the aspect as a value then set the default value
        if (this.item[`${aspectPath}.value`])
            data[`${aspectPath}.value`] = defaultValue;

        await this.item.update(data);
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
            ui.notifications.info(game.i18n.localize("PL1E.NotOwnedDocument"));
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
                ui.notifications.info(game.i18n.localize("PL1E.IncorrectModule"));
                return false;
            }

            const refItems = await item.getRefItems();
            if (refItems.filter(i => i.item.type === "module").length >= item.system.attributes.modules) {
                ui.notifications.info(game.i18n.localize("PL1E.TooMuchModule"));
                return false;
            }
            return true;
        };

        // Common logic for handling items
        const handleItem = async (document) => {
            const itemTypeConfig = this.item.isEmbedded ?
                Pl1eHelpers.getConfig("itemTypes", this.item.type, "localDroppable") :
                Pl1eHelpers.getConfig("itemTypes", this.item.type, "droppable");
            if (!itemTypeConfig.includes(document.type)) return;

            if (!await checkModuleConditions(document, this.item)) return;

            if (document.isEmbedded) {
                const originalItem = await Pl1eHelpers.getDocument("Item", document.sourceId);
                await this.item.addRefItem(originalItem);
                await document.actor.removeItem(document);
            } else {
                await this.item.addRefItem(document);
            }

            await this.render();
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
        for (const refItem of await context.item.getRefItems()) {
            items.push(refItem);
            if (!refItem.item) {
                unknowns.push(refItem);
            }
            else if (refItem.item.type === "mastery") {
                masters.push(refItem);
            }
            else if (refItem.item.type === "ability") {
                abilities.push(refItem);
            }
            else if (refItem.item.type === "feature") {
                features.push(refItem);
            }
            else if (refItem.item.type === "weapon") {
                weapons.push(refItem);
            }
            else if (refItem.item.type === "wearable") {
                wearables.push(refItem);
            }
            else if (refItem.item.type === "module") {
                modules.push(refItem);
            }
        }

        // Iterate on aspects to create description
        if (context.item.system.passiveAspects) {
            for (const [id, aspect] of Object.entries(context.item.system.passiveAspects)) {
                aspect.description = await Pl1eAspect.getDescription(aspect);
            }
        }
        if (context.item.system.activeAspects) {
            for (const [id, aspect] of Object.entries(context.item.system.activeAspects)) {
                aspect.description = await Pl1eAspect.getDescription(aspect);
            }
        }

        // Sort each type of item
        context = Pl1eHelpers.sortDocuments(context);

        // Sorting arrays
        context.masters = masters.sort((a, b) => a.item.name.localeCompare(b.item.name));
        context.abilities = abilities.sort((a, b) => a.item.system.attributes.level - b.item.system.attributes.level)
        context.features = features.sort((a, b) => a.item.name.localeCompare(b.item.name));
        context.weapons = weapons.sort((a, b) => a.item.name.localeCompare(b.item.name));
        context.wearables = wearables.sort((a, b) => a.item.name.localeCompare(b.item.name));
        context.modules = modules.sort((a, b) => a.item.name.localeCompare(b.item.name));

        // Assign and return
        context.items = items;
        context.unknowns = unknowns;
        context.passiveAspects = context.item.system.passiveAspects;
        context.activeAspects = context.item.system.activeAspects;
        context.passiveAspectsObjects = PL1E.passiveAspectsObjects;
        context.activeAspectsObjects = PL1E.activeAspectsObjects;
    }

    async _prepareDisplay(context) {
        // Attributes (iterating on config to preserve order)
        const attributesDisplay = {};
        for (let [key, attributeConfig] of Object.entries(PL1E.attributes)) {
            let value = context.system.attributes[key];
            if (value === undefined || !attributeConfig.inDescription) continue;

            let ignore = false;
            // Type modification
            if (Array.isArray(value)) {
                ignore = value.length === 0;
                value = value.map(value => {
                    const label = Pl1eHelpers.getConfig(attributeConfig.select, value);
                    return game.i18n.localize(label);
                }).join(", ");
            }
            else if (attributeConfig.type === "select") {
                value = Pl1eHelpers.getConfig(attributeConfig.select, value);
                value = game.i18n.localize(value);
            }
            else if (typeof value === "boolean") {
                value = game.i18n.localize(value ? "PL1E.Yes" : "PL1E.No");
            }
            else if (value === 0) continue;

            if (!ignore) {
                // Assign the attribute display
                attributesDisplay[key] = Object.assign({}, attributeConfig, {
                    label: game.i18n.localize(attributeConfig.label),
                    value: value
                });
            }
        }
        context.attributesDisplay = attributesDisplay;

        // Passive aspects
        context.combinedPassiveAspects = await this.item.getCombinedPassiveAspects();
        const passiveAspectsDisplay = {}
        for (let [key, aspect] of Object.entries(context.combinedPassiveAspects)) {
            let aspectCopy = Object.assign({}, aspect);
            const aspectConfig = Pl1eHelpers.getConfig("aspects", aspectCopy.name);
            if (aspectConfig === undefined) continue;

            passiveAspectsDisplay[key] = Object.assign({}, aspectConfig, {
                label: game.i18n.localize(aspectConfig.label),
                description: await Pl1eAspect.getDescription(aspectCopy),
            });
        }
        context.passiveAspectsDisplay = passiveAspectsDisplay;

        // Active aspects
        context.combinedPassiveAspects = await this.item.getCombinedActiveAspects();
        const activeAspectsDisplay = {}
        for (let [key, aspect] of Object.entries(context.combinedPassiveAspects)) {
            let aspectCopy = Object.assign({}, aspect);
            const aspectConfig = Pl1eHelpers.getConfig("aspects", aspectCopy.name);
            if (aspectConfig === undefined) continue;
            activeAspectsDisplay[key] = Object.assign({}, aspectConfig, {
                label: game.i18n.localize(aspectConfig.label),
                description: await Pl1eAspect.getDescription(aspectCopy),
            });
        }
        context.activeAspectsDisplay = activeAspectsDisplay;
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
                aspectsObjects = PL1E.passiveAspectsObjects;
                break;
            case "active":
                target = "activeAspects";
                aspectsObjects = PL1E.activeAspectsObjects;
                break;
        }

        await this.item.update({
            [`system.${target}.${foundry.utils.randomID()}`]: aspectsObjects[aspectId]
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
                aspectsObjects = PL1E.passiveAspectsObjects;
                break;
            case "active":
                target = "activeAspects";
                aspectsObjects = PL1E.activeAspectsObjects;
                break;
        }

        await this.item.update({
            [`system.${target}.-=${aspectId}`]: null
        });
    }

    /**
     * Copy all the aspects of the item into the clipboard
     * @param event
     * @param {string} aspectType
     * @return {Promise<void>}
     * @private
     */
    async _onAspectsCopy(event, aspectType) {
        const str = JSON.stringify(this.item.system[`${aspectType}Aspects`]);
        localStorage.setItem(`${aspectType}AspectsCopy`, str);
        ui.notifications.info(game.i18n.localize("PL1E.AspectsCopied"));
    }

    /**
     * Paste all the aspects from the clipboard into this item
     * @param event
     * @param {string} aspectType
     * @return {Promise<void>}
     * @private
     */
    async _onAspectsPaste(event, aspectType) {
        const objStr = localStorage.getItem(`${aspectType}AspectsCopy`);
        const copiedAspects = JSON.parse(objStr);
        await this.item.update({
            [`system.${aspectType}Aspects`]: copiedAspects
        });
    }

    /**
     * Switch the button to customize the item
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onSwitchCustomize(event) {
        event.preventDefault();

        const isCustomized = foundry.utils.getProperty(this.item, "system.attributes.isCustomized");
        const itemData = {
            "system.attributes.isCustomized": !isCustomized,
        }
        if (!isCustomized) {
            itemData["system.-=customName"] = null;
            itemData["system.-=customImg"] = null;
        }
        await this.item.update(itemData);
    }
}