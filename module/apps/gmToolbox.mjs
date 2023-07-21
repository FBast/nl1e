import {Pl1eEvent} from "../helpers/events.mjs";
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

        html.find(`.toolbox-sleep`).on("click", ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const players = game.users.filter(user => user.active && !user.isGM);
            const playerIds = players.map(player => player.id);

            let abort = false;
            for (const player of players) {
                // Return if the player has no associated character
                if (!player.character) {
                    ui.notifications.warn(`${game.i18n.localize("PL1E.PlayerHasNoCharacter")} : ${player.name}`);
                    abort = true;
                }
                // Return if the character is in creation mod
                if (player.character.system.general.creationMod) {
                    ui.notifications.warn(`${game.i18n.localize("PL1E.CharacterInCreationMode")} : ${player.character.name}`);
                    abort = true;
                }
            }
            if (abort) return;

            // Execute the socket
            CONFIG.PL1E.socket.executeForUsers('displaySleeping', playerIds);
        });
        html.find(`.toolbox-fight`).on("click", async (event) => {
            // Check if there is already an active combat
            const currentCombat = game.combat;
            if (currentCombat && currentCombat.started) {
                await currentCombat.endCombat();
            }
            else {
                // If there is no active combat, get all tokens in the current scene
                const scene = game.scenes.viewed;
                const tokens = scene.tokens;

                // Create a new combat and add tokens to it
                const newCombat = await game.combats.documentClass.create({scene: scene._id});

                // Add tokens to the combat
                for (const token of tokens) {
                    const combatantData = {
                        tokenId: token.id,
                        hidden: false, // Set to true if you want to hide the token in the combat tracker
                        initiative: token.actor.system.misc.initiative, // Set the initiative value here
                    };
                    await newCombat.createEmbeddedDocuments("Combatant", [combatantData]);
                }

                // Start the new combat
                await newCombat.startCombat();
            }
        });
        html.find(`.toolbox-bonuses`).on("mousedown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            switch (event.which) {
                case 1:
                    // left clic - add 1
                    this.object.bonuses = Math.min(this.object.bonuses + 1, 2);
                    break;
                case 2:
                    // middle clic - reset to 0
                    this.object.bonuses = 0;
                    break;
                case 3:
                    // right clic - minus 1
                    this.object.bonuses = Math.max(this.object.bonuses - 1, -2);
                    break;
            }
            game.settings.set("pl1e", "globalBonuses", this.object.bonuses).then(() => this.submit());
            // this.render(true);
        });
        html.find(`.toolbox-advantages`).on("mousedown", (event) => {
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
            // this.render(true);
        });
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
    static displaySleeping() {
        // Return if the sleeping windows is already displayed
        const formApp = Object.values(ui.windows)
            .find(w => w instanceof Pl1eResting);
        if (formApp) return;

        const actor = game.user.character;
        const app = new Pl1eResting(actor, {
            title: `${game.i18n.localize("PL1E.Sleeping")} : ${actor.name}`,
        });
        app.render(true);
    }
}
