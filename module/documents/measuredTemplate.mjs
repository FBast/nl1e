export class Pl1eMeasuredTemplate extends MeasuredTemplate {

    #moveTime = 0;
    #initialLayer;
    #events;
    template;

    /**
     * Get tokens within this template.
     * @returns {Array} An array of tokens contained within the template area.
     */
    get tokensWithinTemplate() {
        const tokens = this.scene.tokens.contents;
        const shape = this.shape;
        const containedTokens = [];

        // Template's position on the canvas
        const templateX = this.document.x;
        const templateY = this.document.y;
        const gridSize = canvas.grid.size;

        tokens.forEach(token => {
            const tokenX = token.x;
            const tokenY = token.y;
            let contains = false;

            switch (shape.constructor) {
                case PIXI.Rectangle: {
                    // Adjust width and height if they are zero
                    const width = shape.width === 0 ? gridSize : shape.width;
                    const height = shape.height === 0 ? gridSize : shape.height;

                    const rect = new PIXI.Rectangle(
                        shape.x + templateX - gridSize / 2,
                        shape.y + templateY - gridSize / 2,
                        width,
                        height
                    );
                    contains = rect.contains(tokenX, tokenY);
                    break;
                }
                case PIXI.Circle: {
                    const radius = shape.radius === 0 ? gridSize / 2 : shape.radius;
                    const circle = new PIXI.Circle(
                        shape.x + templateX - gridSize / 2,
                        shape.y + templateY - gridSize / 2,
                        radius
                    );
                    contains = circle.contains(tokenX, tokenY);
                    break;
                }
                case PIXI.Polygon: {
                    const points = shape.points.map((p, i) => i % 2 === 0 ? p + templateX - gridSize / 2 : p + templateY - gridSize / 2);
                    const poly = new PIXI.Polygon(points);
                    contains = poly.contains(tokenX, tokenY);
                    break;
                }
                default:
                    console.warn("Shape type not supported:", shape.constructor);
                    break;
            }

            if (contains) {
                containedTokens.push(token);
            }
        });

        return containedTokens;
    }

    /**
     * Get the special position of a template (often used for movement or invocation)
     * @return {{x: number, y: number}}
     */
    get specialPosition() {
        const center = { x: this.document.x, y: this.document.y };
        const gridSize = canvas.grid.size;

        let x, y;
        if (this.document.t === "ray" || this.document.t === "cone") {
            const distanceInPixels = this.document.distance * gridSize;
            const rayAngleRadians = Math.toRadians(this.document.direction);
            x = this.document.x + Math.cos(rayAngleRadians) * distanceInPixels - gridSize / 2;
            y = this.document.y + Math.sin(rayAngleRadians) * distanceInPixels - gridSize / 2;
        } else {
            x = center.x - (gridSize / 2);
            y = center.y - (gridSize / 2);
        }

        const point = new PIXI.Point(x, y);
        return canvas.grid.getSnappedPoint(point, { mode: CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER });
    }

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
                        reject(new Error("Template placement was canceled."));
                    }
                },
                reject: () => {
                    reject(new Error("Template placement was canceled."));
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
        const position = this.specialPosition;
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
            ...templateData.flags.pl1e,
            tokensWithinTemplate: this.tokensWithinTemplate.map(token => token.id),
            specialPosition: this.specialPosition
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