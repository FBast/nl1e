import { PL1E } from "../pl1e.mjs";
import {Pl1eHelpers} from "../helpers/helpers.mjs";

export function registerDragHighlighting() {
    // let currentDrag = null;
    // let dragStarted = false;
    //
    // function getAcceptableTypes(target) {
    //     if (target.documentName === "Actor") {
    //         return PL1E.actorTypes?.[target.type]?.droppable ?? [];
    //     }
    //     if (target.documentName === "Item") {
    //         return PL1E.itemTypes?.[target.type]?.droppable ?? [];
    //     }
    //     if (target.documentName === "JournalEntryPage") {
    //         return PL1E.pageTypes?.[target.type]?.droppable ?? [];
    //     }
    //     return [];
    // }
    //
    // async function isDropAllowedForTarget(targetEl) {
    //     const uuid = targetEl.dataset.dropTargetUuid;
    //     const type = targetEl.dataset.dropTargetType;
    //     if (!uuid || !type || !currentDrag) return false;
    //
    //     const target = await Pl1eHelpers.getDocument(type, uuid);
    //     if (!target) return false;
    //
    //     const allowedTypes = getAcceptableTypes(target);
    //     return allowedTypes.includes(currentDrag.subtype);
    // }
    //
    // async function updateDropTargets() {
    //     const dropTargets = Array.from(document.querySelectorAll(".drop-target"));
    //     for (const el of dropTargets) {
    //         const allowed = await isDropAllowedForTarget(el);
    //         el.classList.toggle("drop-ready", allowed);
    //     }
    // }
    //
    // function clearDropTargets() {
    //     document.querySelectorAll(".drop-target").forEach(el => {
    //         el.classList.remove("drop-ready");
    //     });
    // }
    //
    // document.addEventListener("pointerdown", () => {
    //     currentDrag = null;
    //     dragStarted = false;
    // });
    //
    // document.addEventListener("dragstart", async event => {
    //     dragStarted = true;
    //     currentDrag = null;
    //
    //     const raw = event.dataTransfer?.getData("text/plain");
    //     if (!raw) return;
    //
    //     try {
    //         const data = JSON.parse(raw);
    //         const doc = await PL1E.getDocument(data?.type, data?.id);
    //         if (!doc) return;
    //
    //         currentDrag = {
    //             uuid: doc.uuid,
    //             documentName: doc.documentName.toLowerCase(),
    //             subtype: doc.type || doc.system?.type,
    //             source: doc
    //         };
    //
    //         await updateDropTargets();
    //     } catch (e) {
    //         console.warn("PL1E | Drag parsing failed:", e);
    //     }
    // });
    //
    // document.addEventListener("dragend", () => {
    //     currentDrag = null;
    //     dragStarted = false;
    //     clearDropTargets();
    // });
    //
    // document.addEventListener("pointerup", () => {
    //     if (!dragStarted) {
    //         currentDrag = null;
    //         clearDropTargets();
    //     }
    // });
}
