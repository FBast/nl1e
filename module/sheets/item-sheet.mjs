import {Pl1eHelpers} from "../helpers/helpers.mjs";
import {Pl1eEvent} from "../helpers/events.mjs";
import {Pl1eFormValidation} from "../helpers/formValidation.mjs";
import {Pl1eSynchronizer} from "../helpers/synchronizer.mjs";

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
                        const item = await fromUuid(this.item.sourceUuid);
                        item.sheet.render(true);
                    }
                });
            }
            else {
                buttons.unshift({
                    label: 'PL1E.ResetClones',
                    class: 'open-original',
                    icon: 'fal fa-clone',
                    onclick: async () => {
                        await Pl1eSynchronizer.resetClones(this.item);
                    }
                });
                buttons.unshift({
                    label: 'PL1E.Parents',
                    class: 'button-parents',
                    icon: 'fas fa-up',
                    onclick: async () => {
                        await this._renderParents();
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

    // /** @override */
    // async close(options) {
    //     if (!this.item.isEmbedded && this.item.needReset)
    //         await this._resetClones();
    //
    //     return super.close(options);
    // }

    async _updateObject(event, formData) {
        let needReset = false;
        for (let [field, value] of Object.entries(formData)) {
            if (getProperty(this.item, field) !== value) {
                needReset = true;
                break;
            }
        }

        // Set has dirty if something changed
        if (needReset) await this.item.setFlag("pl1e", "needReset", true);

        await super._updateObject(event, formData);
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

        // Add the actor's data to context.data for easier access, as well as flags.
        context.system = itemData.system;
        context.flags = itemData.flags;

        // Add the config data
        context.config = CONFIG.PL1E;

        // Add game access
        context.game = game;

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
        let item = await fromUuid(data.uuid);
        if (!item) throw new Error(`PL1E | No item found with UUID ${data}`);

        if (CONFIG.PL1E.items[this.item.type].droppable.includes(item.type)) {
            await this.item.addRefItem(item);
        }
    }

    async _prepareItems(context) {
        // Get ref items using uuid
        const items = [];
        for (let i = 0; i < this.item.system.refItemsChildren.length; i++) {
            const uuid = this.item.system.refItemsChildren[i];
            let item = await fromUuid(uuid);
            if (!item) {
                // Create an unknown item for display
                item = {
                    type: "unknown",
                    uuid: uuid
                }
            }
            items[i] = item;
        }

        // Initialize containers.
        const unknowns = [];
        const features = [];
        let abilities = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
        };

        // Iterate through refItems, allocating to containers
        for (const item of items) {
            // Append to unknowns
            if (item.type === "unknown") {
                unknowns.push(item);
            }
            // Append to features
            if (item.type === "feature") {
                features.push(item);
            }
            // Append to abilities
            else if (item.type === "ability") {
                abilities[item.system.attributes.level.value].push(item);
            }
        }

        // Assign and return
        context.hasUnknowns = unknowns.length > 0;
        context.unknowns = unknowns;
        context.features = features;
        context.abilities = abilities;
        context.passiveAspects = this.item.system.passiveAspects;
        context.activeAspects = this.item.system.activeAspects;
        context.passiveAspectsObjects = CONFIG.PL1E.passiveAspectsObjects;
        context.activeAspectsObjects = CONFIG.PL1E.activeAspectsObjects;
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
     * Render all parents
     * @returns {Promise<void>}
     * @private
     */
    async _renderParents() {
        if (this.item.system.refItemsParents.length === 0) {
            ui.notifications.info(game.i18n.localize("Pl1E.NoParents"));
            return;
        }

        let sheetPosition = Pl1eHelpers.screenCenter();
        for (const uuid of this.item.system.refItemsParents) {
            const parentItem = await fromUuid(uuid);
            if (parentItem === null)
                throw new Error("PL1E | Cannot find parent with uuid " + uuid);
            parentItem.sheet.render(true, {left: sheetPosition.x, top: sheetPosition.y});
            sheetPosition.x += 30;
            sheetPosition.y += 30;
        }

        await this.close();
    }

}