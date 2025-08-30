export class Pl1eMovementRules {

    /**
     * Determine whether we should restrict movement for this update.
     */
    static shouldRestrict({ tokenDoc, changes, options, settings }) {
        const isMove = (typeof changes?.x === "number") || (typeof changes?.y === "number");
        if (!isMove) return false;

        if (options?.noRestriction) return false;
        const actor = tokenDoc.actor;
        if (!actor) return false;

        // SHIFT bypass
        if (settings.shiftBypass && this.isShiftHeld() && game.user.isGM) return false;

        // Combat-only restriction
        if (!tokenDoc.combatant) return false;
        if (game.combat?.current?.tokenId !== tokenDoc.id) {
            ui.notifications.info(game.i18n.localize("PL1E.NotYourTurn"));
            return false;
        }

        return true;
    }

    /**
     * Measure a path using Foundry's path API and grid rules.
     */
    static measurePath(tokenDoc, dest) {
        const origin = { x: tokenDoc.x, y: tokenDoc.y };
        const tokenObj = tokenDoc.object;
        if (!tokenObj) {
            // Fallback: two-point path (scene not rendered yet)
            const measurement = canvas.grid.measurePath([origin, dest], { gridSpaces: true });
            return { path: [origin, dest], distance: Number(measurement?.distance ?? 0) };
        }

        let path;
        try {
            path = tokenObj.getMovementPath(dest);
        } catch {
            path = [origin, dest];
        }
        const measurement = canvas.grid.measurePath(path, { gridSpaces: true });
        return { path, distance: Number(measurement?.distance ?? 0) };
    }

    /**
     * Compute action spending needed to cover a given distance.
     */
    static computeSpending({ distance, vars, misc, general }) {
        const movePerAction = Number(misc.movement ?? 0);
        const remaining = Number(vars.remainingMovement ?? 0);
        const actions = Number(general.action ?? 0);

        if (movePerAction <= 0 && distance > remaining) {
            return { ok: false, reason: "PL1E.NotEnoughActions" };
        }

        const missing = distance - remaining;
        const actionsToSpend = (missing > 0 && movePerAction > 0) ? Math.ceil(missing / movePerAction) : 0;

        if (actionsToSpend > actions) {
            return { ok: false, reason: "PL1E.NotEnoughActions" };
        }

        const logicalRemaining = remaining + (actionsToSpend * movePerAction);
        return {
            ok: true,
            actionsToSpend,
            logicalRemaining,
            remaining,
            actions,
            movePerAction
        };
    }

    /**
     * Truncate a path to a distance limit and return the final reachable point.
     */
    static truncatePath(path, limit) {
        let traveled = 0;
        let finalPoint = { ...path[0] };

        for (let i = 1; i < path.length; i++) {
            const segment = [path[i - 1], path[i]];
            const segMeasure = canvas.grid.measurePath(segment, { gridSpaces: true });
            const segDist = Number(segMeasure?.distance ?? 0);

            if (traveled + segDist > limit) {
                const remainOnSeg = limit - traveled;
                const ratio = segDist > 0 ? (remainOnSeg / segDist) : 0;
                finalPoint = {
                    x: segment[0].x + (segment[1].x - segment[0].x) * ratio,
                    y: segment[0].y + (segment[1].y - segment[0].y) * ratio
                };
                return { finalPoint, distance: limit };
            }

            traveled += segDist;
            finalPoint = path[i];
        }

        return { finalPoint, distance: limit };
    }

    /**
     * Snap a point to the grid if needed (pixel space).
     */
    static snapToGrid(point) {
        if (!canvas?.grid?.getSnappedPosition) return point;
        const snapped = canvas.grid.getSnappedPosition(point.x, point.y, 1);
        return { x: Math.round(snapped.x), y: Math.round(snapped.y) };
    }

    /**
     * Apply logical spending and persist variables on the actor.
     */
    static async persistActorMovement(actor, { distance, actionsToSpend, remaining, actions, movePerAction, vars }) {
        let newActions = actions;
        let newRemaining = remaining;
        let movementAction = Number(vars.movementAction ?? 0);

        if (actionsToSpend > 0) {
            newActions -= actionsToSpend;
            newRemaining += actionsToSpend * movePerAction;
            movementAction += actionsToSpend;

            ChatMessage.create({
                content: game.i18n.format("PL1E.Movement", { actions: actionsToSpend }),
                speaker: { actor: actor.id, alias: actor.name }
            });
        }

        newRemaining -= distance;
        const used = Number(vars.usedMovement ?? 0) + distance;

        await actor.update({
            "system.general.action": newActions,
            "system.variables.remainingMovement": newRemaining,
            "system.variables.usedMovement": used,
            "system.variables.movementAction": movementAction
        });
    }

    static isShiftHeld() {
        const kb = game.keyboard;
        if (!kb) return false;

        // Preferred API (documented): isModifierActive("Shift")
        if (typeof kb.isModifierActive === "function") {
            try { return kb.isModifierActive("Shift"); } catch { /* fallthrough */ }
        }

        // Fallback: check the down keys set
        const keys = kb.downKeys;
        return !!(keys?.has?.("Shift") || keys?.has?.("ShiftLeft") || keys?.has?.("ShiftRight"));
    }
}
