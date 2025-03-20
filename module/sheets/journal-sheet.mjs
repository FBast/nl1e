import {Pl1eHelpers} from "../helpers/helpers.mjs";

Hooks.once("ready", () => {
    Hooks.on("renderJournalSheet", (journalSheet, html, data) => {
        const journal = journalSheet.document;
        const writerId = journal.getFlag("pl1e", "writerId");
        if (!writerId) return;

        const user = game.users.get(writerId);
        if (!user) return;

        let color = user.color;
        if (typeof color === 'object') {
            color = color.toString(); // Convert to string if it's a Color object
        }

        const colorWithOpacity = Pl1eHelpers.hexToRgba(color, 0.5);
        journalSheet.element.css("background-color", colorWithOpacity);
    });
});