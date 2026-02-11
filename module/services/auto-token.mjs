/**
 * PL1E Auto Token Subject (Foundry v13)
 * - One cropped subject image per actor.img (persisted on disk)
 * - Ring colors vary by level (experience)
 * - Ring pulses for Actor type "character"
 * - Applies on token creation + actor updates
 */

const MODULE_ID = "pl1e";
const FLAG_PATH = `flags.${MODULE_ID}.autoTokenSubject`;

const SUBJECT_SIZE = 512;
const INSET_PX = 90;

let _registered = false;

Hooks.once("ready", () => registerHooks());

function registerHooks() {
    if (_registered) return;
    _registered = true;

    Hooks.on("preCreateToken", onPreCreateToken);
    Hooks.on("createToken", onCreateToken);
    Hooks.on("updateActor", onUpdateActor);
    Hooks.on("createActor", onCreateActor);
}

/* -------------------------------------------- */
/* Hooks                                        */
/* -------------------------------------------- */

function onPreCreateToken(tokenDoc, data, options) {
    if (options?.pl1eAutoTokenSubject) return;
    if (!isEnabled()) return;

    const actor = tokenDoc.actor ?? (data?.actorId ? game.actors.get(data.actorId) : null);
    if (!actor) return;

    const cache = actor.getFlag(MODULE_ID, "autoTokenSubject") ?? null;
    if (!cache?.path) return;

    const colors = getColorsFromActor(actor);
    const effects = getRingEffectsForActor(actor);

    foundry.utils.setProperty(data, "ring.enabled", true);
    foundry.utils.setProperty(data, "ring.subject.texture", cache.path);
    if (colors) applyRingColorsToData(data, colors);
    foundry.utils.setProperty(data, "ring.effects", effects);
}

async function onCreateToken(tokenDoc, options) {
    if (options?.pl1eAutoTokenSubject) return;
    if (!isEnabled()) return;

    const actor = tokenDoc.actor ?? (tokenDoc.actorId ? game.actors.get(tokenDoc.actorId) : null);
    if (!actor) return;

    const subjectPath = await ensureSubject(actor);
    const colors = getColorsFromActor(actor);
    const effects = getRingEffectsForActor(actor);

    const updates = {};
    foundry.utils.setProperty(updates, "ring.enabled", true);
    if (subjectPath) foundry.utils.setProperty(updates, "ring.subject.texture", subjectPath);
    if (colors) applyRingColorsToData(updates, colors);
    foundry.utils.setProperty(updates, "ring.effects", effects);

    await tokenDoc.update(updates, { pl1eAutoTokenSubject: true });

    // Keep prototype aligned
    if (subjectPath) await ensurePrototypeSubject(actor, subjectPath);
    await ensurePrototypeRingVisuals(actor);
}

async function onUpdateActor(actor, changed, options) {
    if (options?.pl1eAutoTokenSubject) return;
    if (!isEnabled()) return;

    const imgChanged = foundry.utils.hasProperty(changed, "img");
    const xpChanged = foundry.utils.hasProperty(changed, "system.general.experience");
    if (!imgChanged && !xpChanged) return;

    // TOKEN ACTOR (synthetic / unlinked token)
    if (actor.isToken) {
        const tokenDoc = actor.token;
        if (!tokenDoc) return;

        if (imgChanged) await ensureSubject(actor); // will update actor.prototypeToken for this synthetic actor
        if (xpChanged) await ensurePrototypeRingVisuals(actor);

        // Apply visuals directly to this token
        const subjectPath = actor.getFlag(MODULE_ID, "autoTokenSubject")?.path ?? null;
        const colors = getColorsFromActor(actor);
        const effects = getRingEffectsForActor(actor);

        const updates = {
            "ring.enabled": true,
            "ring.effects": effects,
            "ring.colors.ring": colors.ring,
            "ring.colors.background": colors.background
        };
        if (subjectPath) updates["ring.subject.texture"] = subjectPath;

        await tokenDoc.update(updates, { pl1eAutoTokenSubject: true });
        return;
    }

    // BASE ACTOR (linked / standard actor)
    if (imgChanged) await ensureSubject(actor);

    if (xpChanged) {
        const colors = getColorsFromActor(actor);
        const effects = getRingEffectsForActor(actor);

        await ensurePrototypeRingVisuals(actor);
        await updatePlacedTokenRingVisuals(actor, colors, effects); // this one now updates only colors/effects, not subject
    }
}

async function onCreateActor(actor) {
    if (!isEnabled()) return;

    await ensureSubject(actor);
    await ensurePrototypeRingVisuals(actor);

    const colors = getColorsFromActor(actor);
    const effects = getRingEffectsForActor(actor);
    await updatePlacedTokenRingVisuals(actor, colors, effects);
}

/* -------------------------------------------- */
/* Core                                         */
/* -------------------------------------------- */

function isEnabled() {
    return game.settings.get(MODULE_ID, "autoTokenEnabled");
}

/**
 * Ensure subject image exists and prototype points to it.
 * Returns subjectPath (or null).
 */
async function ensureSubject(actor) {
    const baseImage = actor?.img;
    if (!baseImage) return null;

    const dir = getSubjectDir();
    const key = baseImage;

    const cache = actor.getFlag(MODULE_ID, "autoTokenSubject") ?? {};

    // Reuse cached file only if it still exists
    if (cache?.key === key && cache?.path) {
        const exists = await fileExistsInData(cache.path, dir);
        if (exists) {
            await ensurePrototypeSubject(actor, cache.path);
            return cache.path;
        }

        // Cache is stale (file deleted) -> clear flag so we regenerate cleanly
        await actor.update({ [FLAG_PATH]: null }, { pl1eAutoTokenSubject: true });
    }

    await ensureDirectory(dir);

    const { blob, ext } = await createCircularSubjectBlob(baseImage, SUBJECT_SIZE, INSET_PX);

    const safeName = (actor.name ?? actor.id).replace(/[^a-z0-9-_]+/gi, "_");
    const imgHash = simpleHash(baseImage);
    const filename = `${safeName}_${actor.id}_${imgHash}.${ext}`;

    const file = new File([blob], filename, { type: blob.type });
    const upload = await FilePicker.upload("data", dir, file, {}, { notify: false });

    const subjectPath = upload?.path ?? null;
    if (!subjectPath) return null;

    await actor.update(
        {
            "prototypeToken.ring.enabled": true,
            "prototypeToken.ring.subject.texture": subjectPath,
            [FLAG_PATH]: { key, baseImage, path: subjectPath }
        },
        { pl1eAutoTokenSubject: true }
    );

    return subjectPath;
}

async function fileExistsInData(path, dirHint = null) {
    const dir = dirHint ?? path.split("/").slice(0, -1).join("/");

    try {
        const result = await FilePicker.browse("data", dir);
        return Array.isArray(result.files) && result.files.includes(path);
    } catch (e) {
        console.warn("PL1E fileExistsInData browse failed:", dir, e);
        return false;
    }
}

async function ensurePrototypeSubject(actor, subjectPath) {
    const current = actor.prototypeToken?.ring?.subject?.texture;
    if (current === subjectPath) return;

    await actor.update(
        {
            "prototypeToken.ring.enabled": true,
            "prototypeToken.ring.subject.texture": subjectPath
        },
        { pl1eAutoTokenSubject: true }
    );
}

/* -------------------------------------------- */
/* Ring visuals (colors + effects)              */
/* -------------------------------------------- */

async function ensurePrototypeRingVisuals(actor) {
    const colors = getColorsFromActor(actor);
    const effects = getRingEffectsForActor(actor);

    const ring = actor.prototypeToken?.ring ?? {};
    const curColors = ring.colors ?? {};

    const needUpdate =
        curColors.ring !== colors.ring ||
        curColors.background !== colors.background ||
        (ring.effects ?? 0) !== effects;

    if (!needUpdate) return;

    await actor.update(
        {
            "prototypeToken.ring.enabled": true,
            "prototypeToken.ring.colors.ring": colors.ring,
            "prototypeToken.ring.colors.background": colors.background,
            "prototypeToken.ring.effects": effects
        },
        { pl1eAutoTokenSubject: true }
    );
}

async function updatePlacedTokenRingVisuals(actor, colors, effects) {
    for (const scene of game.scenes) {
        const updates = [];

        for (const tokenDoc of scene.tokens) {
            if (tokenDoc.actorId !== actor.id) continue;

            // linked only ?
            // if (!tokenDoc.actorLink) continue;

            const ring = tokenDoc.ring ?? {};
            const curColors = ring.colors ?? {};

            const need =
                curColors.ring !== colors.ring ||
                curColors.background !== colors.background ||
                (ring.effects ?? 0) !== effects ||
                ring.enabled !== true;

            if (!need) continue;

            updates.push({
                _id: tokenDoc.id,
                "ring.enabled": true,
                "ring.effects": effects,
                "ring.colors.ring": colors.ring,
                "ring.colors.background": colors.background
            });
        }

        if (updates.length) {
            await scene.updateEmbeddedDocuments("Token", updates, { pl1eAutoTokenSubject: true });
        }
    }
}

/* -------------------------------------------- */
/* Ring colors                                  */
/* -------------------------------------------- */

function getColorsFromActor(actor) {
    const experience = actor.system?.general?.experience ?? 0;
    const level = Math.floor(experience / 10);
    const clamped = Math.max(0, Math.min(6, level));
    return getRingColorsForLevel(clamped);
}

function applyRingColorsToData(obj, colors) {
    foundry.utils.setProperty(obj, "ring.colors.ring", colors.ring);
    foundry.utils.setProperty(obj, "ring.colors.background", colors.background);
}

function getRingColorsForLevel(level) {
    const palette = [
        { ring: "#6b7280", background: "#111827" }, // 0
        { ring: "#00ff5d", background: "#0b1220" }, // 1
        { ring: "#00b2ff", background: "#0b1220" }, // 2
        { ring: "#ff00ff", background: "#0b1220" }, // 3
        { ring: "#ffff00", background: "#0b1220" }, // 4
        { ring: "#ff0000", background: "#0b1220" }, // 5
        { ring: "#ffffff", background: "#0b1220" }  // 6
    ];
    return palette[level] ?? palette[0];
}

/* -------------------------------------------- */
/* Ring effects (pulse for character)           */
/* -------------------------------------------- */

function getRingEffectsForActor(actor) {
    const E = foundry.canvas.placeables.tokens.TokenRing.effects;
    return actor?.type === "character" ? E.RING_PULSE : E.DISABLED;
}

/* -------------------------------------------- */
/* Storage                                      */
/* -------------------------------------------- */

function getSubjectDir() {
    const worldId = game.world?.id;
    if (!worldId) throw new Error("PL1E AutoTokenSubject: game.world.id unavailable");

    // Keep your current convention:
    return `worlds/${worldId}/assets/tokens-subject`;

    // If you store alongside world DB (as per your screenshot), use:
    // return `worlds/${worldId}/data/tokens-subject`;
}

async function ensureDirectory(dir) {
    try {
        await FilePicker.createDirectory("data", dir, { notify: false });
    } catch (e) {
        const msg = String(e?.message ?? e).toLowerCase();
        if (msg.includes("exists")) return;
        console.error("PL1E ensureDirectory failed:", dir, e);
        throw e;
    }
}

/* -------------------------------------------- */
/* Image generation                             */
/* -------------------------------------------- */

async function createCircularSubjectBlob(baseImage, size = 512, insetPx = 90) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");

    const img = await loadImage(baseImage);

    ctx.clearRect(0, 0, size, size);

    const innerX = insetPx;
    const innerY = insetPx;
    const innerW = size - insetPx * 2;
    const innerH = size - insetPx * 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (size / 2) - insetPx, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    drawImageCover(ctx, img, innerX, innerY, innerW, innerH);

    ctx.restore();

    const webp = await canvasToBlob(canvas, "image/webp", 0.92).catch(() => null);
    if (webp) return { blob: webp, ext: "webp" };

    const png = await canvasToBlob(canvas, "image/png").catch(() => null);
    if (png) return { blob: png, ext: "png" };

    throw new Error("Failed to encode canvas");
}

function drawImageCover(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;

    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
            type,
            quality
        );
    });
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h).toString(16);
}