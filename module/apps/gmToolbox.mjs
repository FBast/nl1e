import {Pl1eResting} from "./resting.mjs";

/**
 * L5R GM Toolbox dialog
 * @extends {FormApplication}
 */
export class GmToolbox extends FormApplication {
    /**
     * Settings
     */
    object = {};

    /**
     * Assign the default options
     * @override
     */
    static get defaultOptions() {
        const x = $(window).width();
        const y = $(window).height();
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "gm-toolbox",
            classes: ["pl1e", "gm-toolbox"],
            template: "systems/pl1e/templates/apps/gm-toolbox.hbs",
            title: game.i18n.localize("PL1E.GMToolbox"),
            width: "auto",
            height: "auto",
            left: x - 630,
            top: y - 98,
            closeOnSubmit: false,
            submitOnClose: false,
            submitOnChange: true,
            minimizable: false,
        });
    }

    /**
     * Constructor
     * @param {ApplicationOptions} options
     */
    constructor(options = {}) {
        super(options);
        this._initialize();
    }

    /**
     * Refresh data (used from socket)
     */
    async refresh() {
        if (!game.user.isGM) {
            return;
        }
        this._initialize();
        this.render(false);
    }

    /**
     * Initialize the values
     * @private
     */
    _initialize() {
        this.object = {
            advantages: game.settings.get("pl1e", "globalAdvantages"),
            bonuses: game.settings.get("pl1e", "globalBonuses"),
        };
    }

    /**
     * Do not close this dialog
     * @override
     */
    async close(options = {}) {
        // TODO better implementation needed : see KeyboardManager._onEscape(event, up, modifiers)
        // This windows is always open, so esc key is stuck at step 2 : Object.keys(ui.windows).length > 0
        // Case 3 (GM) - release controlled objects
        if (canvas?.ready && game.user.isGM && Object.keys(canvas.activeLayer.controlled).length) {
            canvas.activeLayer.releaseAll();
        } else {
            // Case 4 - toggle the main menu
            ui.menu.toggle();
        }
    }

    /**
     * Prevent non GM to render this windows
     * @override
     */
    render(force = false, options = {}) {
        if (!game.user.isGM) {
            return false;
        }
        this.position.width = "auto";
        this.position.height = "auto";
        return super.render(force, options);
    }

    /**
     * Remove the close button
     * @override
     */
    _getHeaderButtons() {
        return [];
    }

    /**
     * Construct and return the data object used to render the HTML template for this form application.
     * @param options
     * @return {Object}
     * @override
     */
    async getData(options = null) {
        return {
            ...(await super.getData(options)),
            data: this.object,
        };
    }

    /**
     * Listen to html elements
     * @param {jQuery} html HTML content of the sheet.
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        if (!game.user.isGM) return;

        html.find(`.toolbox-reset-resources`).on("click", event => this._resetResources(event));
        html.find(`.toolbox-sleep`).on("click", event => this._sleep(event));
        html.find(`.toolbox-advantages`).on("mousedown", event => this._handleAdvantages(event));
    }

    /**
     * Reset all resources of the characters of the players
     * @param event
     * @private
     */
    async _resetResources(event) {
        const loggedInPlayers = game.users.filter(user => user.active);

        for (const player of loggedInPlayers) {
            const playerCharacters = player.character ? [player.character] : [];
            for (const actor of playerCharacters) {
                await actor.update({
                    "system.resources.health.value": actor.system.resources.health.max,
                    "system.resources.stamina.value": actor.system.resources.stamina.max,
                    "system.resources.mana.value": actor.system.resources.mana.max,
                });
            }
        }
    }

    /**
     * Execute a socket to display the sleeping app on players
     * @param event
     * @private
     */
    _sleep(event) {
        event.preventDefault();
        event.stopPropagation();
        const players = game.users.filter(user => user.active && !user.isGM);
        const playerIds = players.map(player => player.id);

        let abort = false;
        for (const player of players) {
            // Return if the player has no associated character
            if (!player.character) {
                ui.notifications.info(`${game.i18n.localize("PL1E.PlayerHasNoCharacter")} : ${player.name}`);
                abort = true;
            }
            // Return if the character is in creation mod
            if (player.character.system.general.creationMod) {
                ui.notifications.info(`${game.i18n.localize("PL1E.CharacterInCreationMode")} : ${player.character.name}`);
                abort = true;
            }
        }
        if (abort) return;

        // Execute the socket
        CONFIG.PL1E.socket.executeForUsers('displaySleeping', playerIds);
    }

    /**
     * Handle the players global advantages
     * @param event
     * @private
     */
    _handleAdvantages(event) {
        event.preventDefault();
        event.stopPropagation();
        switch (event.which) {
            case 1:
                // left clic - add 1
                this.object.advantages = Math.min(this.object.advantages + 1, 2);
                break;
            case 2:
                // middle clic - reset to 0
                this.object.advantages = 0;
                break;
            case 3:
                // right clic - minus 1
                this.object.advantages = Math.max(this.object.advantages - 1, -2);
                break;
        }
        game.settings.set("pl1e", "globalAdvantages", this.object.advantages).then(() => this.submit());
    }

    /**
     * This method is called upon form submission after form data is validated
     * @param event    The initial triggering submission event
     * @param formData The object of validated form data with which to update the object
     * @returns        A Promise which resolves once the update operation has completed
     * @override
     */
    async _updateObject(event, formData) {
        this.render(false);
    }

    /**
     * Display the sleeping window for the current user
     */
    static displayRestWindow() {
        const character = game.user.character;
        // Return if the player has no associated character
        if (!character ) {
            ui.notifications.info(game.i18n.localize("PL1E.PlayerHasNoCharacter"));
            return;
        }
        // Return if the character is in creation mod
        if (character.system.general.creationMod) {
            ui.notifications.info(game.i18n.localize("PL1E.CharacterInCreationMode"));
            return;
        }

        const app = new Pl1eResting(character, {
            title: `${game.i18n.localize("PL1E.Rest")} : ${character.name}`,
        });
        app.render(true);
    }

}
