import {Pl1eHelpers} from "./helpers.mjs";
import {Pl1eItem} from "../documents/items/item.mjs";
import {Pl1eActor} from "../documents/actors/actor.mjs";
import {TraitSelector} from "../apps/traitSelector.mjs";
import {JournalEditor} from "../sheets/journal-editor-sheet.mjs";
import {PL1E} from "../pl1e.mjs";
import {Pl1eChatMessage} from "../documents/chatMessage.mjs";

export class Pl1eEvent {

    /**
     * Handle clickable rolls.
     * @param {Event} event The originating click event
     * @param {Pl1eActor} actor the rolling actor
     */
    static async onSkillRoll(event, actor) {
        event.preventDefault();

        const skillId = $(event.currentTarget).closest(".skill").data("skillId");
        await Pl1eChatMessage.skillRoll(actor, skillId);
    }

    /**
     * Center the screen on a token
     * @param event
     * @return {Promise<void>}
     */
    static async onFocusToken(event) {
        let tokenId = $(event.currentTarget).data("token-id") ||
            $(event.currentTarget).closest(".item").data("token-id");

        const sceneId = $(event.currentTarget).closest(".item").data("scene-id");
        const token = await Pl1eHelpers.getDocument("Token", tokenId, {
            scene: await Pl1eHelpers.getDocument("Scene", sceneId)
        });

        if (token) {
            const currentSceneId = game.scenes.current.id;
            if (currentSceneId !== sceneId) {
                const targetScene = game.scenes.get(sceneId);
                if (targetScene) {
                    if (targetScene.testUserPermission(game.user, foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER))
                        await targetScene.view();
                    else {
                        ui.notifications.warn(game.i18n.localize("PL1E.InsufficientScenePermissions"));
                        return;
                    }
                } else {
                    ui.notifications.warn(game.i18n.localize("PL1E.SceneDoesNotExist"));
                    return;
                }
            }

            const x = token.x;
            const y = token.y;
            await canvas.animatePan({x: x, y: y, scale: 1});
        } else {
            ui.notifications.warn(game.i18n.localize("PL1E.TokenDoesNotExist"));
        }
    }

    /**
     * Open actor sheet
     * @param event The originating click event
     */
    static async onActorEdit(event) {
        const actorId = $(event.currentTarget).closest(".item").data("actor-id");
        const actor = await Pl1eHelpers.getDocument("Actor", actorId);

        if (actor.sheet.rendered) actor.sheet.bringToTop();
        else actor.sheet.render(true);
    }

    /**
     * Open item sheet
     * @param event The originating click event
     * @param {Actor|Item} document the document of the item
     */
    static async onItemEdit(event, document) {
        let itemId = $(event.currentTarget).data("item-id") ||
            $(event.currentTarget).closest(".item").data("item-id");

        // Chat message need to retrieve the token actor to find the item
        if (document instanceof ChatMessage) {
            const sceneId = $(event.currentTarget).closest(".item").data("scene-id");
            const tokenId = $(event.currentTarget).closest(".item").data("token-id");
            const scene = await Pl1eHelpers.getDocument("Scene", sceneId);
            const token = await Pl1eHelpers.getDocument("Token", tokenId, {
                scene: scene
            });
            if (token !== undefined) document = token.actor;
        }

        let item;
        if (document instanceof Pl1eActor)
            item = document.items.get(itemId);
        else if (document instanceof Pl1eItem) {
            item = await Pl1eHelpers.getDocument("Item", itemId);
        }
        else {
            throw new Error(`PL1E | unknown ${document}`);
        }

        if (item.sheet.rendered) item.sheet.bringToTop();
        else item.sheet.render(true);
    }

    /**
     * Buy item
     * @param {Event} event The originating click event
     * @param {Pl1eActor} actor the merchant of the item
     */
    static async onItemBuy(event, actor) {
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = actor.items.get(itemId);

        if (!Pl1eHelpers.isGMConnected()) {
            ui.notifications.info(game.i18n.localize("PL1E.NoGMConnected"));
            return;
        }
        if (!game.user.character) {
            ui.notifications.info(game.i18n.localize("PL1E.NoCharacterAssociated"));
            return;
        }

        // Player transfer item to a not owned actor
        PL1E.socket.executeAsGM("sendItem", {
            sourceActorUuid: actor.uuid,
            targetActorUuid: game.user.character.uuid,
            itemId: item.id
        });
    }

    /**
     * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
     * @param {Event} event The originating click event
     * @param {Actor} actor the actor where the item is created
     */
    static async onItemCreate(event, actor) {
        event.preventDefault();
        const header = event.currentTarget;
        // Get the type of item to create.
        const type = header.dataset.type;
        // Grab any data associated with this control.
        const data = foundry.utils.duplicate(header.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.
        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system["type"];

        // Finally, create the item!
        return await Item.create(itemData, {parent: actor});
    }

    /**
     * Handle remove of item
     * @param {Event} event The originating click event
     * @param {Actor|Item} document the document where the item is removed
     */
    static async onItemRemove(event, document) {
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const instanceId = $(event.currentTarget).closest(".item").data("instance-id");
        if (itemId == null && instanceId == null) return;

        // Remove embedded items from actor
        if (document instanceof Pl1eActor && itemId) {
            const item = document.items.get(itemId);
            await document.removeItem(item);
        }
        // Remove refItem from item
        else if (document instanceof Pl1eItem && instanceId) {
            await document.removeRefItem(instanceId);
        }
    }

    /**
     * Switch between behavior values
     * @param {Event} event
     * @param {Item} item
     */
    static async onItemSwitchBehavior(event, item) {
        const instanceId = $(event.currentTarget).closest(".item").data("instance-id");
        const itemType = $(event.currentTarget).closest(".item").data("item-type");

        const currentValue = item.system.refItems[instanceId].behavior;
        const values = PL1E.itemTypes[itemType].behaviors;
        const currentIndex = values.indexOf(currentValue);
        const nextIndex = (currentIndex + 1) % values.length;
        await item.update({
            [`system.refItems.${instanceId}.behavior`]: values[nextIndex]
        });
    }

    /**
     * Handle spin number changes
     * @param {Event} event The originating click event
     * @param {Actor|Item} document the document to modify
     */
    static async onSpinNumber(event, document) {
        event.preventDefault();
        event.stopPropagation();

        const path = $(event.currentTarget).data("path");
        const value = $(event.currentTarget).data("value");
        const min = $(event.currentTarget).data("min");
        const max = $(event.currentTarget).data("max");
        if (!value || !path) return;

        let newValue = foundry.utils.getProperty(document, path) + value;
        newValue = min !== undefined ? Math.max(newValue, min) : newValue;
        newValue = max !== undefined ? Math.min(newValue, max) : newValue;
        await document.update({
            [path]: newValue
        })
    }

    /**
     * Handle number editing changes
     * @param {Event} event The originating click event
     * @param {Actor|Item} document The document to modify
     */
    static async onEditNumber(event, document) {
        event.preventDefault();
        event.stopPropagation();

        const path = $(event.currentTarget).data("path");
        const currentValue = foundry.utils.getProperty(document, path);
        if (!path) return;

        // Open a dialog for the user to input a new number
        new Dialog({
            title: game.i18n.localize("PL1E.Edit"),
            content: `
                <form>
                    <form-group>
                        <input type="number" name="newValue" value="${currentValue}"/>
                    </form-group>
                </form>
            `,
            buttons: {
                save: {
                    label: game.i18n.localize("PL1E.Save"),
                    callback: (html) => {
                        let newValue = Number(html.find('input[name="newValue"]').val());
                        if (!isNaN(newValue)) {
                            // Update the document with the new value
                            document.update({ [path]: newValue });
                        }
                    }
                },
                cancel: {
                    label: game.i18n.localize("PL1E.Cancel"),
                }
            },
            default: "save",
            close: () => console.log("Edit dialog closed"),
        }).render(true);
    }

    /**
     * Handle select editing changes
     * @param {Event} event The originating click event
     * @param {Actor|Item} document The document to modify
     */
    static async onEditSelect(event, document) {
        event.preventDefault();
        event.stopPropagation();

        const path = $(event.currentTarget).data("path");
        let options = $(event.currentTarget).data("options");
        const currentValue = foundry.utils.getProperty(document, path);
        if (!path || !options) return;

        options = Pl1eHelpers.getConfig(options);
        const optionKeys = Object.keys(options);

        // Generate the options HTML
        const optionsHtml = optionKeys.map(key => {
            const selected = key === currentValue ? "selected" : "";
            const label = game.i18n.localize(options[key].label);
            return `<option value="${key}" ${selected}>${label}</option>`;
        }).join("");

        // Open a dialog for the user to select a new value
        new Dialog({
            title: game.i18n.localize("PL1E.Edit"),
            content: `
            <form>
                <div class="form-group">
                    <select name="newValue">
                        ${optionsHtml}
                    </select>
                </div>
            </form>
        `,
            buttons: {
                save: {
                    label: game.i18n.localize("PL1E.Save"),
                    callback: (html) => {
                        const newValue = html.find('select[name="newValue"]').val();
                        if (newValue) {
                            // Update the document with the new value
                            document.update({ [path]: newValue });
                        }
                    }
                },
                cancel: {
                    label: game.i18n.localize("PL1E.Cancel")
                }
            },
            default: "save",
            close: () => console.log("Edit dialog closed"),
        }).render(true);
    }

    /**
     * Handle set number changes
     * @param {Event} event The originating click event
     * @param {Actor|Item} document the document to modify
     */
    static async onSetNumber(event, document) {
        event.preventDefault();
        event.stopPropagation();

        const path = $(event.currentTarget).data("path");
        const value = $(event.currentTarget).data("value");
        if (value === undefined || !path) return;

        await document.update({
            [path]: value
        })
    }

    /**
     * Create highlights
     * @param {Event} event The originating mouseenter event
     *
     */
    static onCreateHighlights(event) {
        event.preventDefault();
        event.stopPropagation();

        let resources = $(event.currentTarget).data("resources");
        let characteristics = $(event.currentTarget).data("characteristics");
        let skills = $(event.currentTarget).data("skills");

        // resources
        if (resources !== undefined) {
            for (let resource of document.getElementsByClassName('resource-name')) {
                let id = $(resource).closest(".resource").data("resource-id");
                if (!resources.includes(id)) continue;
                resource.classList.add('highlight-info');
            }
        }
        // characteristics
        if (characteristics !== undefined) {
            for (let characteristic of document.getElementsByClassName('characteristic-label')) {
                let id = $(characteristic).closest(".characteristic").data("characteristic-id");
                if (!characteristics.includes(id)) continue;
                characteristic.classList.add('highlight-info');
            }
        }
        // skills
        if (skills !== undefined) {
            for (let skill of document.getElementsByClassName('skill-label')) {
                let id = $(skill).closest(".skill").data("skill-id");
                if (!skills.includes(id)) continue;
                skill.classList.add('highlight-info');
            }
        }
    }

    /**
     * Remove highlights
     * @param {Event} event The originating mouseexit event
     */
    static onRemoveHighlights(event) {
        event.preventDefault();
        event.stopPropagation();
        for (let characteristic of document.getElementsByClassName('characteristic-label')) {
            characteristic.classList.remove('highlight-info')
        }
        for (let resource of document.getElementsByClassName('resource-name')) {
            resource.classList.remove('highlight-info')
        }
        for (let skill of document.getElementsByClassName('skill-label')) {
            skill.classList.remove('highlight-info')
        }
    }

    /**
     * Handle execution of a chat card action via a click event on one of the card buttons
     * @param {Event} event       The originating click event
     * @returns {Promise}         A promise which resolves once the handler workflow is complete
     */
    static async onChatCardAction(event) {
        event.preventDefault();

        if (!game.user.isGM) return;

        // Extract card data
        const action = $(event.currentTarget).data("action");
        const chatCard = $(event.currentTarget).closest(".chat-card");
        const itemId = chatCard.data("item-id");
        const actorId = chatCard.data("token-id");
        const sceneId = chatCard.data("scene-id");

        const scene = await Pl1eHelpers.getDocument("Scene", sceneId);
        const token = await Pl1eHelpers.getDocument("Token", actorId, {
            scene: scene
        });
        /** @type {Pl1eItem} */
        const item = token.actor.items.get(itemId);

        // Notify as resolved
        const messageId = $(event.currentTarget).closest(".message").attr("data-message-id");
        const message = game.messages.get(messageId);

        // Retrieve character data on message
        const characterData = JSON.parse(message.getFlag("pl1e", "characterData"));
        characterData.actor = token.actor;
        characterData.token = token;
        characterData.item = item;
        characterData.scene = scene;
        characterData.linkedItem = token.actor.items.get(characterData.linkedItemId);
        let templates = [];
        for (const templateId of characterData.templatesIds) {
            let template = await Pl1eHelpers.getDocument("MeasuredTemplate", templateId);
            templates.push(template.document);
        }
        characterData.templates = templates;

        // Remove all buttons from message content
        const updatedContent = $(message.content).find(".card-buttons").remove().end();
        await message.unsetFlag("pl1e", "characterData");
        await message.update({
            content: updatedContent[0].outerHTML
        });

        // Launch resolution
        await item.resolve(characterData, {
            action: action
        });
    }

    /**
     * Handle clicking of dice tooltip buttons
     * @param {Event} event
     */
    static async onItemTooltip(event) {
        event.preventDefault();
        event.stopPropagation();

        const item = $(event.currentTarget).closest(".item");

        // Check if tooltip associated
        const tooltip = item.find(".item-tooltip");
        if (tooltip === undefined) return;

        $(tooltip).slideToggle(200);
        $(tooltip).toggleClass('expanded');
    }

    /**
     * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options.
     * @param {Event} event The click event which originated the selection.
     * @param document The document targeting the selector
     * @returns {TraitSelector} Newly displayed application.
     */
    static onTraitSelector(event, document) {
        event.preventDefault();
        const trait = $(event.currentTarget).data("trait");
        const traitLabel = $(event.currentTarget).data("trait-label");
        const keyPath = $(event.currentTarget).data("key-path");

        return new TraitSelector(document, trait, traitLabel, keyPath).render(true);
    }

    /**
     * Handle launching the individual text editing window.
     * @param {Event} event  The triggering click event.
     * @param {Document} document The document linked to the editor
     */
    static onLaunchTextEditor(event, document) {
        event.preventDefault();
        const textKeyPath = event.currentTarget.dataset.target;
        const label = event.target.closest("label");
        const editor = new JournalEditor(document, { textKeyPath, title: label?.innerText });
        editor.render(true);
    }

}