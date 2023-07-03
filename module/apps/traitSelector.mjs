import {PL1E} from "../config/config.mjs";

/**
 * A specialized application used to modify document traits.
 *
 * @param {Pl1eItem | Pl1eActor} document Document for whose traits are being edited.
 * @param {string} trait The trait name to be retrieve in config
 * @param {string} traitLabel The trait label to localize
 * @param {string} keyPath The path to the array to modify
 * @param {object} [options={}]
 */
export class TraitSelector extends DocumentSheet {

    constructor(document, trait, traitLabel, keyPath, options={}) {
        if ( !CONFIG.PL1E[trait] ) throw new Error(
            `Cannot instantiate TraitSelector with a trait not defined in CONFIG.PL1E: ${trait}.`
        );

        super(document, options);

        /**
         * Trait key as defined in CONFIG.PL1E.
         * @type {string}
         */
        this.trait = trait;
        this.traitLabel = game.i18n.localize(traitLabel);
        this.keyPath = keyPath;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "trait-selector",
            classes: ["pl1e", "trait-selector"],
            template: "systems/pl1e/templates/apps/traits-selector.hbs",
            width: 320,
            height: "auto",
            sheetConfig: false,
            allowCustom: true
        });
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    get id() {
        return `${this.constructor.name}-${this.trait}-${this.document.id}`;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    get title() {
        return `${this.document.name} : ${this.traitLabel}`;
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async getData() {
        const path = `system.${this.keyPath}`;
        const data = foundry.utils.getProperty(this.document, path);
        if ( !data ) return super.getData();

        let choices = {};
        for (const [key, value] of Object.entries(PL1E[this.trait])) {
            choices[key] = {
                label: value,
                value: data.includes(key)
            }
        }

        return {
            ...super.getData(),
            choices: choices
        };
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);

        for ( const checkbox of html[0].querySelectorAll("input[type='checkbox']") ) {
            if ( checkbox.checked ) this._onToggleCategory(checkbox);
        }
    }

    /** @inheritdoc */
    async _onChangeInput(event) {
        super._onChangeInput(event);

        if ( event.target.name?.startsWith("choices") ) this._onToggleCategory(event.target);
    }

    /* -------------------------------------------- */

    /**
     * Enable/disable all children when a category is checked.
     * @param {HTMLElement} checkbox  Checkbox that was changed.
     * @protected
     */
    _onToggleCategory(checkbox) {
        const children = checkbox.closest("li")?.querySelector("ol");
        if ( !children ) return;

        for ( const child of children.querySelectorAll("input[type='checkbox']") ) {
            child.checked = child.disabled = checkbox.checked;
        }
    }

    /* -------------------------------------------- */

    /**
     * Filter a list of choices that begin with the provided key for update.
     * @param {string} path      Path in actor data where the final choices will be saved.
     * @param {object} formData  Form data being prepared. *Will be mutated.*
     * @protected
     */
    _prepareChoices(path, formData) {
        const chosen = [];
        for (const [key, value] of Object.entries(formData)) {
            if (value) chosen.push(key);
            delete formData[key];
        }
        formData[path] = chosen;
    }

    /* -------------------------------------------- */

    /** @override */
    async _updateObject(event, formData) {
        const data = `system.${this.keyPath}`;
        this._prepareChoices(`${data}`, formData);

        return this.object.update(formData);
    }

}