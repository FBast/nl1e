import {Pl1eHelpers} from "../helpers/helpers.mjs";

Hooks.once("ready", () => {
    Hooks.on("renderActorSheet", (actorSheet, html, data) => {
        if (actorSheet.actor.type === "character") {
            // Apply the user color to the sheet
            for (const user of game.users) {
                if (user.character !== actorSheet.actor) continue;

                let color = user.color;
                if (typeof color === 'object') {
                    color = color.toString(); // Convert to string if it's a Color object
                }

                const colorWithOpacity = Pl1eHelpers.hexToRgba(color, 0.5);
                actorSheet.element.css("background-color", colorWithOpacity);
            }
        }
    });

    Hooks.on("renderItemSheet", (itemSheet, html, data) => {
        // Apply the user color to the sheet
        for (const user of game.users) {
            if (user.character !== itemSheet.item.parent) continue;

            let color = user.color;
            if (typeof color === 'object') {
                color = color.toString(); // Convert to string if it's a Color object
            }

            const colorWithOpacity = Pl1eHelpers.hexToRgba(color, 0.5);
            itemSheet.element.css("background-color", colorWithOpacity);
        }
    });

    Hooks.on("renderJournalSheet", (journalSheet, html, data) => {
        const journal = journalSheet.document;

        // Sheet color
        const writerId = journal.getFlag("pl1e", "writerId");
        if (writerId) {
            const user = game.users.get(writerId);
            if (user) {
                let color = user.color;
                if (typeof color === 'object') color = color.toString();
                const colorWithOpacity = Pl1eHelpers.hexToRgba(color, 0.5);
                journalSheet.element.css("background-color", colorWithOpacity);
            }
        }
    });
});