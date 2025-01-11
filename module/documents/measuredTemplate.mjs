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
        const position = Pl1eTemplate.getSecondaryPosition(this.document);
        const gridSize = canvas.grid.size;
        hl.beginFill(0xFF0000, 1);
        hl.drawCircle(position.x + gridSize / 2, position.y + gridSize / 2, gridSize / 8);
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

    _onMovePlacement(event) {
        event.stopPropagation();
        let now = Date.now();
        if (now - this.#moveTime <= 20) return;
        let templateCenter = event.data.getLocalPosition(this.layer);
        const offset = canvas.dimensions.size / 2;
        templateCenter.x -= offset;
        templateCenter.y -= offset;

        const range = this.document.attributes.range * game.system.grid.distance;
        templateCenter = this._clampVectorRadius(templateCenter, this.document.token, range * canvas.dimensions.size);
        templateCenter = canvas.grid.getSnappedPoint(templateCenter, { mode: CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER });
        this.document.updateSource({ x: templateCenter.x + offset, y: templateCenter.y + offset });
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