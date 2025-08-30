import { Pl1eMovementSettings } from "./movement-settings.mjs";
import { Pl1eMovementRules } from "./movement-rules.mjs";

Hooks.on("init", () => {
    Pl1eMovementSettings.register();

    Hooks.on("preUpdateToken", (tokenDoc, changes, options, userId) => {
        // Early outs on global toggle
        if (!Pl1eMovementSettings.enabled) return;

        // Only handle final doc updates that include x/y
        const shouldProcess = Pl1eMovementRules.shouldRestrict({
            tokenDoc, changes, options, settings: Pl1eMovementSettings
        });
        if (!shouldProcess) return;

        // Basic actor/system guards
        const actor = tokenDoc.actor;
        const general = actor.system?.general ?? {};
        const misc = actor.system?.misc ?? {};
        const vars = actor.system?.variables ?? {};

        if ((misc.movement ?? 0) <= 0) {
            ui.notifications.info(game.i18n.localize("PL1E.NoMovement"));
            return false;
        }
        if ((general.action ?? 0) <= 0 && (vars.remainingMovement ?? 0) <= 0) {
            ui.notifications.info(game.i18n.localize("PL1E.NoMoreAction"));
            return false;
        }

        // Resolve destination from changes + measure path
        const dest = {
            x: (typeof changes.x === "number") ? changes.x : tokenDoc.x,
            y: (typeof changes.y === "number") ? changes.y : tokenDoc.y
        };

        const { path, distance } = Pl1eMovementRules.measurePath(tokenDoc, dest);

        // Compute actions needed to cover the distance
        const spending = Pl1eMovementRules.computeSpending({
            distance, vars, misc, general
        });

        if (!spending.ok) {
            ui.notifications.info(game.i18n.localize(spending.reason));
            return false; // cancel movement
        }

        // If exceeding logical remaining, truncate and rewrite changes.x/y
        if (distance > spending.logicalRemaining) {
            const { finalPoint } = Pl1eMovementRules.truncatePath(path, spending.logicalRemaining);
            const snapped = Pl1eMovementRules.snapToGrid(finalPoint);
            changes.x = snapped.x;
            changes.y = snapped.y;
        }

        // Persist variables now (use final distance → if truncated, it equals logicalRemaining)
        const finalDist = (distance > spending.logicalRemaining) ? spending.logicalRemaining : distance;

        // Fire-and-forget; we don't block the move while waiting the actor update
        Pl1eMovementRules.persistActorMovement(actor, {
            distance: finalDist,
            actionsToSpend: spending.actionsToSpend,
            remaining: spending.remaining,
            actions: spending.actions,
            movePerAction: spending.movePerAction,
            vars
        });

    });
});
