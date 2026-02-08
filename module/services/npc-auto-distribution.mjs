Hooks.once("ready", () => {

    Hooks.on("updateActor", async (actor, changed, options) => {
        if (options?.pl1eAutoDistribution) return;
        if (actor.type !== "npc") return;

        const npc = /** @type {Pl1eNPC} */ (actor);

        const enabledNow =
            foundry.utils.hasProperty(changed, "system.general.autoDistribute") &&
            actor.system.general.autoDistribute === true;

        if (npc.shouldAutoDistribute({
            changed,
            reason: enabledNow ? "enable" : "experience"
        })) {
            await npc.applyAutoDistribution({ pl1eAutoDistribution: true });
        }
    });

    Hooks.on("createItem", async (item, options) => {
        const actor = item.parent;
        if (!actor) return;

        if (actor.shouldAutoDistribute({
            item,
            reason: item.type === "class" ? "class" : null
        })) {
            await actor.applyAutoDistribution({ pl1eAutoDistribution: true });
        }
    });

    Hooks.on("deleteItem", async (item, options) => {
        const actor = item.parent;
        if (!actor) return;

        if (actor.shouldAutoDistribute({
            item,
            reason: item.type === "class" ? "class" : null
        })) {
            await actor.applyAutoDistribution({ pl1eAutoDistribution: true });
        }
    });

});
