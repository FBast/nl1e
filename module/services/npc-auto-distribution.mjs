Hooks.once("ready", () => {

    Hooks.on("updateActor", async (actor, changed, options, userId) => {
        if (actor.type !== "npc") return;
        if (options?.pl1eAutoDistribution) return;

        const autoDistributeEnabled =
            foundry.utils.hasProperty(changed, "system.general.autoDistribute") &&
            actor.system.general.autoDistribute === true;

        if (autoDistributeEnabled) {
            await actor.applyAutoDistribution({
                pl1eAutoDistribution: true
            });
            return;
        }

        if (!actor.system.general?.autoDistribute) return;

        const experienceChanged = foundry.utils.hasProperty(
            changed,
            "system.general.experience"
        );
        if (!experienceChanged) return;

        await actor.applyAutoDistribution({
            pl1eAutoDistribution: true
        });
    });

    Hooks.on("createItem", async (item, options, userId) => {
        const actor = item.parent;
        if (!actor || actor.type !== "npc") return;
        if (!actor.system.general?.autoDistribute) return;
        if (item.type !== "class") return;

        await actor.applyAutoDistribution({
            pl1eAutoDistribution: true
        });
    });

    Hooks.on("deleteItem", async (item, options, userId) => {
        const actor = item.parent;
        if (!actor || actor.type !== "npc") return;
        if (!actor.system.general?.autoDistribute) return;
        if (item.type !== "class") return;

        await actor.applyAutoDistribution({
            pl1eAutoDistribution: true
        });
    });

});