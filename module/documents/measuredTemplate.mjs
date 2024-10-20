export class Pl1eMeasuredTemplate extends MeasuredTemplate {

    #moveTime = 0;
    #initialLayer;
    #events;
    template;

    /* -------------------------------------------- */

    /**
     * A factory method to create an ActionTemplate instance using provided data from an Pl1eItem instance
     * @param {Pl1eItem} item The Item object for which to construct the template
     * @param {object} attributes
     * @param {object} activeAspects
     * @returns {Pl1eMeasuredTemplate|null} The template object, or null if the item does not produce a template
     */
    static fromItem(item, attributes, activeAspects) {
        let areaShape = attributes.areaShape;

        // Prepare template data
        const templateData = {
            t: areaShape,
            user: game.user.id,
            direction: 0,
            x: 0,
            y: 0,
            fillColor: game.user.color,
        };

        // Additional type-specific data
        switch (areaShape) {
            case "target":
                templateData.t = "rect";
                break;
            case "circle":
                templateData.distance = attributes.circleRadius * game.system.grid.distance;
                break;
            case "cone":
                templateData.distance = attributes.coneLength * game.system.grid.distance;
                templateData.angle = attributes.coneAngle;
                break;
            case "ray":
                templateData.width = game.system.grid.distance;
                templateData.distance = attributes.rayLength * game.system.grid.distance;
                break;
        }

        // Return the template constructed from the item data
        const cls = CONFIG.MeasuredTemplate.documentClass;
        const template = new cls(templateData, {parent: canvas.scene});
        const token = item.actor.bestToken;
        template.actionData = {
            "item": item,
            "itemId": item.id,
            "scene": token.parent,
            "sceneId": token.parent.id,
            "token": token,
            "tokenId": token.id,
            "attributes": attributes,
            "activeAspects": activeAspects
        };

        return new this(template);

        //TODO-fred change the controlIcon sprite

        // Create the controlIcon with the correct width and height
        // object.controlIcon = new ControlIcon({
        //     texture: item.img,
        //     size: Math.max(template.width, template.height), // Use the larger dimension as the size
        //     icon: item.img,
        //     title: item.name,
        //     onClick: () => {
        //         //Handle click event here
        //     },
        //     layer: "myLayer" // replace myLayer with the name of your desired layer
        // });
    }

    /**
     * Creates a preview of the spell template.
     * @returns {Promise}  A promise that resolves with the final measured template if created.
     */
    async drawPreview() {
        const initialLayer = canvas.activeLayer;

        // Draw the template and switch to the template layer
        await this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);

        // Activate interactivity
        return this.activatePreviewListeners(initialLayer);
    }

    /** @inheritDoc */
    highlightGrid() {
        super.highlightGrid();

        // Only proceed if the template is visible
        if (!this.isVisible) return;

        // Get the highlight layer
        const hl = canvas.interface.grid.getHighlightLayer(this.highlightId);

        // Get the target highlight position
        const position = Pl1eMeasuredTemplate.getSpecialPosition(this.document);
        const gridSize = canvas.grid.size;

        // Highlight the center grid position with a red square (optional, if you still want this)
        hl.beginFill(0xFF0000, 1); // Semi-transparent green
        hl.drawCircle(position.x + gridSize / 2, position.y + gridSize / 2, gridSize / 8);
        hl.endFill();
    }

    /* -------------------------------------------- */

    /**
     * Activate listeners for the template preview
     * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
     * @returns {Promise}                 A promise that resolves with the final measured template if created.
     */
    activatePreviewListeners(initialLayer) {
        return new Promise((resolve, reject) => {
            this.#initialLayer = initialLayer;
            this.#events = {
                cancel: this._onCancelPlacement.bind(this),
                confirm: this._onConfirmPlacement.bind(this),
                move: this._onMovePlacement.bind(this),
                resolve,
                reject,
                rotate: this._onRotatePlacement.bind(this)
            };

            // Activate listeners
            canvas.stage.on("mousemove", this.#events.move);
            canvas.stage.on("mousedown", this.#events.confirm);
            canvas.app.view.oncontextmenu = this.#events.cancel;
            canvas.app.view.onwheel = this.#events.rotate;
        });
    }

    /**
     * Shared code for when template placement ends by being confirmed or canceled.
     * @param event
     * @returns {Promise<void>}
     * @private
     */
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
        let now = Date.now(); // Apply a 20ms throttle
        if (now - this.#moveTime <= 20) return;
        let templateCenter = event.data.getLocalPosition(this.layer);
        const offset = canvas.dimensions.size / 2;
        templateCenter.x -= offset;
        templateCenter.y -= offset;

        // Clamp with range
        const range = this.document.actionData.attributes.range * game.system.grid.distance;
        templateCenter = this._clampVectorRadius(templateCenter, this.document.actionData.token, range * canvas.dimensions.size);

        // Snap position
        templateCenter = canvas.grid.getSnappedPoint(templateCenter, { mode: CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER });

        // Update the shape's position to align with the template center
        if (this.shape) {
            this.shape.x = templateCenter.x - (this.shape.width / 2);
            this.shape.y = templateCenter.y - (this.shape.height / 2);
        }

        // Move the template's position
        this.document.updateSource({ x: templateCenter.x + offset, y: templateCenter.y + offset });
        this.refresh();

        this.#moveTime = now;
    }

    /**
     * Clamp a vector position within a radius
     * @param source
     * @param destination
     * @param max
     * @returns {PIXI.Point}
     * @private
     */
    _clampVectorRadius(source, destination, max) {
        let x = source.x - destination.x;
        let y = source.y - destination.y;
        let distance = Math.sqrt(x * x + y * y);
        let clamp = Math.min(distance, max) / distance;
        return new PIXI.Point(clamp * x + destination.x, clamp * y + destination.y);
    }

    /**
     * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
     * @param event
     * @private
     */
    _onRotatePlacement(event) {
        if (event.ctrlKey) event.preventDefault(); // Avoid zooming the browser window
        if (["square", "circle"].includes(this.document.t)) return;
        event.stopPropagation();
        let delta = canvas.grid.type > foundry.CONST.GRID_TYPES.SQUARE ? 30 : 15;
        let snap = (event.shiftKey ? delta : 5);
        const update = {direction: this.document.direction + (snap * Math.sign(event.deltaY))};
        this.document.updateSource(update);
        this.refresh();
    }

    /**
     * Confirm placement when the left mouse button is clicked.
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onConfirmPlacement(event) {
        await this._finishPlacement(event);
        const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
        this.document.updateSource(destination);
        this.template = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]))[0];

        await this.template.setFlag("pl1e", "actionData", {
            "itemId": this.document.actionData.itemId,
            "sceneId": this.document.actionData.sceneId,
            "tokenId": this.document.actionData.tokenId,
            "attributes": this.document.actionData.attributes,
            "activeAspects": this.document.actionData.activeAspects
        })
        this.#events.resolve(this.template);
    }

    /**
     * Cancel placement when the right mouse button is clicked.
     * @param event
     * @returns {Promise<void>}
     * @private
     */
    async _onCancelPlacement(event) {
        await this._finishPlacement(event);
        this.template = null;
        this.#events.resolve(this.template);
        // this.#events.reject();
    }

    static getTokensWithinTemplate(template) {
        const tokens = template.parent.tokens.contents;
        const shape = template.object.shape;
        const containedTokens = [];

        // Template's position on the canvas
        const templateX = template.x;
        const templateY = template.y;

        tokens.forEach(token => {
            // Token's center position on the canvas
            const tokenX = token.x;
            const tokenY = token.y;
            const gridSize = canvas.grid.size;

            let contains = false;
            switch (shape.constructor) {
                case PIXI.Rectangle: {
                    // Translate the rectangle to the canvas coordinates

                    const translatedShape = new PIXI.Rectangle(
                        shape.x + templateX - gridSize / 2,
                        shape.y + templateY - gridSize / 2,
                        shape.width + gridSize,
                        shape.height + gridSize
                    );

                    contains = translatedShape.contains(tokenX, tokenY);
                    break;
                }
                case PIXI.Circle: {
                    const translatedShape = new PIXI.Circle(
                        shape.x + templateX - gridSize / 2,
                        shape.y + templateY - gridSize / 2,
                        shape.radius
                    );
                    contains = translatedShape.contains(tokenX, tokenY);
                    break;
                }
                case PIXI.Polygon: {
                    const points = shape.points.map((point, index) =>
                        index % 2 === 0 ? point + templateX - gridSize / 2 : point + templateY - gridSize / 2
                    );
                    const translatedShape = new PIXI.Polygon(points);
                    contains = translatedShape.contains(tokenX, tokenY);
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
     * @param template
     * @return {{x: number, y: number}}
     */
    static getSpecialPosition(template) {
        // Calculate the center position of the template
        const center = { x: template.x, y: template.y }
        const gridSize = canvas.grid.size;

        // Calculate the position of the red square
        let x, y;
        if (template.t === "ray" || template.t === "cone") {
            const distanceInPixels = template.distance * gridSize;
            const rayAngleRadians = Math.toRadians(template.direction);
            x = template.x + Math.cos(rayAngleRadians) * distanceInPixels - gridSize / 2;
            y = template.y + Math.sin(rayAngleRadians) * distanceInPixels - gridSize / 2;
        }
        else {
            x = center.x - (gridSize / 2);
            y = center.y - (gridSize / 2);
        }

        // Create a PIXI.Point for snapping
        const point = new PIXI.Point(x, y);

        // Convert into snapped position with the appropriate mode and resolution
        return canvas.grid.getSnappedPoint(point, {mode:CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER} );
    }

}