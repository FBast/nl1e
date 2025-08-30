import {Pl1eTemplate} from "../helpers/template.mjs";

export class Pl1eMeasuredTemplate extends MeasuredTemplate {

    #moveTime = 0;
    #initialLayer;
    #events;
    template;

    async drawPreview() {
        // Draw the template preview and activate the layer
        this.#initialLayer = canvas.activeLayer;
        await this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);

        // Return a promise that resolves when the placement is confirmed
        return new Promise((resolve, reject) => {
            // Set up the events
            this.#events = {
                cancel: this._onCancelPlacement.bind(this),
                confirm: this._onConfirmPlacement.bind(this),
                move: this._onMovePlacement.bind(this),
                resolve: async (template) => {
                    if (template) {
                        resolve(template);
                    } else {
                        resolve(null);
                    }
                },
                reject: () => {
                    resolve(null);
                },
                rotate: this._onRotatePlacement.bind(this)
            };

            // Activate listeners for interaction
            canvas.stage.on("mousemove", this.#events.move);
            canvas.stage.on("mousedown", this.#events.confirm);
            canvas.app.view.oncontextmenu = this.#events.cancel;
            canvas.app.view.onwheel = this.#events.rotate;
        });
    }


    highlightGrid() {
        super.highlightGrid();
        if (!this.isVisible) return;

        const hl = canvas.interface.grid.getHighlightLayer(this.highlightId);

        // Use the same token center as origin for consistency
        const tokenId = this.document.getFlag("pl1e", "tokenId");
        const tok = canvas.tokens?.get(tokenId) ?? canvas.tokens?.placeables.find(t => t.id === tokenId);
        const origin = tok ? tok.center : new PIXI.Point(this.document.x, this.document.y);

        const r = canvas.grid.size / 8;
        hl.beginFill(0xFF0000, 1);
        hl.drawCircle(origin.x, origin.y, r);
        hl.endFill();
    }


    async _finishPlacement(event) {
        this.layer._onDragLeftCancel(event);
        canvas.stage.off("mousemove", this.#events.move);
        canvas.stage.off("mousedown", this.#events.confirm);
        canvas.app.view.oncontextmenu = null;
        canvas.app.view.onwheel = null;
        this.#initialLayer.activate();
    }

    _clampVectorAnnulus(point, origin, minPx, maxPx) {
        const dx = point.x - origin.x;
        const dy = point.y - origin.y;
        const d  = Math.hypot(dx, dy) || 1; // avoid div by 0
        const target = Math.min(Math.max(d, minPx), maxPx);
        const k = target / d;
        return new PIXI.Point(origin.x + dx * k, origin.y + dy * k);
    }

    _onMovePlacement(event) {
        event.stopPropagation();
        const now = Date.now();
        if (now - this.#moveTime <= 20) return;

        // Pointer in layer coords
        let p = event.data.getLocalPosition(this.layer);

        // Token center (V13)
        const tokenId = this.document.getFlag("pl1e", "tokenId");
        const tok = canvas.tokens?.get(tokenId) ?? canvas.tokens?.placeables.find(t => t.id === tokenId);
        const origin = tok ? tok.center : new PIXI.Point(this.document.x, this.document.y);

        // --- distances en pixels ---
        const sizePx   = canvas.dimensions.size;
        const gridUnitsPerSq = game.system.grid.distance; // déjà utilisé chez toi
        const rangeSq  = this.document.attributes.range ?? 0;

        // rayon intérieur = la moitié de la plus grande dimension du token (en cases) * taille case
        const tokenSquares = Math.max(tok?.document.width ?? 1, tok?.document.height ?? 1);
        const innerRadiusPx = (tokenSquares * sizePx) / 2;

        // portée en pixels (à partir du bord)
        const rangePx = rangeSq * sizePx * gridUnitsPerSq;

        // max = depuis le bord → rayon_intérieur + portée
        const maxPx = innerRadiusPx + rangePx;

        // Clamp within annulus [innerRadiusPx, maxPx]
        p = this._clampVectorAnnulus(p, origin, innerRadiusPx, maxPx);

        // Snap to grid CENTER
        const snapped = canvas.grid.getSnappedPoint(p, { mode: CONST.GRID_SNAPPING_MODES.CENTER });

        this.document.updateSource({ x: snapped.x, y: snapped.y });
        this.refresh();
        this.#moveTime = now;
    }


    _onRotatePlacement(event) {
        if (event.ctrlKey) event.preventDefault();
        if (["square", "circle"].includes(this.document.t)) return;
        event.stopPropagation();
        let delta = canvas.grid.type > foundry.CONST.GRID_TYPES.SQUARE ? 30 : 15;
        let snap = (event.shiftKey ? delta : 5);
        this.document.updateSource({ direction: this.document.direction + (snap * Math.sign(event.deltaY)) });
        this.refresh();
    }

    async _onConfirmPlacement(event) {
        await this._finishPlacement(event);
        const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
        this.document.updateSource(destination);

        // Prepare the data object for the template
        const templateData = this.document.toObject();

        // Add the additional data directly to the flags
        templateData.flags.pl1e = {
            ...templateData.flags.pl1e
        };

        // Create the document in the scene with the additional data
        const embeddedTemplate = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]))[0];
        this.template = embeddedTemplate;

        // Resolve the event with the newly created template
        this.#events.resolve(this.template);
    }

    async _onCancelPlacement(event) {
        await this._finishPlacement(event);
        this.template = null;
        this.#events.resolve(this.template);
    }

    _clampVectorRadius(source, destination, max) {
        let x = source.x - destination.x;
        let y = source.y - destination.y;
        let distance = Math.sqrt(x * x + y * y);
        let clamp = Math.min(distance, max) / distance;
        return new PIXI.Point(clamp * x + destination.x, clamp * y + destination.y);
    }
}