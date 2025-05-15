import {Pl1eHelpers} from "../../helpers/helpers.mjs";

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