export class ActionTemplate extends MeasuredTemplate {

    /**
     * Track the timestamp when the last mouse move event was captured.
     * @type {number}
     */
    #moveTime = 0;

    /**
     * The initially active CanvasLayer to re-activate after the workflow is complete.
     * @type {CanvasLayer}
     */
    #initialLayer;

    /**
     * Track the bound event handlers so they can be properly canceled later.
     * @type {object}
     */
    #events;

    template;

    /* -------------------------------------------- */

    /**
     * A factory method to create an ActionTemplate instance using provided data from an Pl1eItem instance
     * @param {Pl1eItem} item               The Item object for which to construct the template
     * @param {object} attributes
     * @param {object} activeAspects
     * @returns {ActionTemplate|null}    The template object, or null if the item does not produce a template
     */
    static async fromItem(item, attributes, activeAspects) {
        const areaShape = attributes.areaShape;

        // Prepare template data
        const templateData = {
            // _id: randomID(),
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
                const gridSize = game.system.gridDistance;
                templateData.t = "rect";
                templateData.direction = 0;
                templateData.distance = gridSize;
                templateData.width = gridSize;
                templateData.height = gridSize;
                break;
            case "circle":
                templateData.distance = attributes.circleRadius * game.system.gridDistance;
                break;
            case "cone":
                templateData.distance = attributes.coneLength * game.system.gridDistance;
                templateData.angle = attributes.coneAngle;
                break;
            case "square":
                templateData.t = "rect";
                templateData.distance = attributes.squareLength * game.system.gridDistance;
                templateData.width = attributes.squareLength * game.system.gridDistance;
                templateData.height = attributes.squareLength * game.system.gridDistance;
                templateData.direction = 45;
                break;
            case "ray":
                templateData.width = game.system.gridDistance;
                templateData.distance = attributes.rayLength * game.system.gridDistance;
                break;
        }

        // Return the template constructed from the item data
        // const template = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData])
        const cls = CONFIG.MeasuredTemplate.documentClass;
        const template = new cls(templateData, {parent: canvas.scene});
        const token = item.actor.bestToken;
        template.actionData = {
            "item": item,
            "itemId": item.id,
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

    /**
     * Move the template preview when the mouse moves
     * @param event
     * @private
     */
    _onMovePlacement(event) {
        event.stopPropagation();
        let now = Date.now(); // Apply a 20ms throttle
        if (now - this.#moveTime <= 20) return;
        let templateCenter = event.data.getLocalPosition(this.layer);
        const offset = canvas.dimensions.size / 2;
        templateCenter.x -= offset;
        templateCenter.y -= offset;
        // Clamp with range
        const range = this.document.actionData.attributes.range * game.system.gridDistance;
        templateCenter = this._clampVectorRadius(templateCenter, this.document.actionData.token, range * canvas.dimensions.size);
        // Snap position
        templateCenter = canvas.grid.getSnappedPosition(templateCenter.x, templateCenter.y, 1);
        // Move position
        this.document.updateSource({x: templateCenter.x + offset, y: templateCenter.y + offset});
        this.refresh();
        // Target tokens
        const targets = ActionTemplate.getTemplateTargets(this.document);
        for (const token of canvas.tokens.placeables) {
            // Target the current token and group with others
            token.setTarget(targets.includes(token), {user: game.user, releaseOthers: false, groupSelect: false});
        }
        this.#moveTime = now;
    }

    /**
     * Clamp a vector position within a radius
     * @param source
     * @param destination
     * @param max
     * @returns {{x: *, y: *}}
     * @private
     */
    _clampVectorRadius(source, destination, max) {
        let x = source.x - destination.x;
        let y = source.y - destination.y;
        let distance = Math.sqrt(x * x + y * y);
        let clamp = Math.min(distance, max) / distance;
        return {
            x: clamp * x + destination.x,
            y: clamp * y + destination.y
        }
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
        let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        let snap = (event.shiftKey ? delta : 5);
        const update = {direction: this.document.direction + (snap * Math.sign(event.deltaY))};
        this.document.updateSource(update);
        this.refresh();
        // Target tokens
        const targets = ActionTemplate.getTemplateTargets(this.document);
        for (const token of canvas.tokens.placeables) {
            // Target the current token and group with others
            token.setTarget(targets.includes(token), {user: game.user, releaseOthers: false, groupSelect: false});
        }
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

    /**
     * Get targets currently inside the template
     * @param {MeasuredTemplateDocument} template
     * @returns {Token[]}     */
    static getTemplateTargets(template) {
        const actionData = template.actionData;

        // Get targetGroups for token selection
        let targetGroups = [];
        for (const [id, aspect] of Object.entries(actionData.activeAspects)) {
            if (targetGroups.includes(aspect.targetGroup)) continue;
            targetGroups.push(aspect.targetGroup);
        }

        const targets = [];
        if (template.object.shape === undefined) return targets;
        const gridPositions = this._getGridHighlightPositions(template);

        // Target current position
        for (let gridPosition of gridPositions) {
            for (let token of canvas.tokens.placeables) {
                // Check if target position in template
                if (token.x === gridPosition.x && token.y === gridPosition.y) {
                    // Filter non valid targets
                    if (!targetGroups.includes("all")) {
                        if (!targetGroups.includes("self") && token.document === actionData.token) continue;
                        if (!targetGroups.includes("allies") && token.document.disposition === actionData.token.disposition) continue;
                        if (!targetGroups.includes("opponents") && token.document.disposition !== actionData.token.disposition) continue;
                    }

                    // Filter if excludeSelf
                    if (actionData.attributes.excludeSelf && token.document === actionData.token) continue;

                    // Add to targets array
                    targets.push(token);
                }
            }
        }
        return targets;
    }

    /**
     * Return the positions inside a template
     * @param {MeasuredTemplate} template
     * @returns {*[]}
     * @private
     */
    static _getGridHighlightPositions(template) {
        const grid = canvas.grid.grid;
        const d = canvas.dimensions;
        const {x, y, distance} = template;

        // Get number of rows and columns
        const [maxRow, maxCol] = grid.getGridPositionFromPixels(d.width, d.height);
        let nRows = Math.ceil(((distance * 1.5) / d.distance) / (d.size / grid.h));
        let nCols = Math.ceil(((distance * 1.5) / d.distance) / (d.size / grid.w));
        [nRows, nCols] = [Math.min(nRows, maxRow), Math.min(nCols, maxCol)];

        // Get the offset of the template origin relative to the top-left grid space
        const [tx, ty] = grid.getTopLeft(x, y);
        const [row0, col0] = grid.getGridPositionFromPixels(tx, ty);
        const [hx, hy] = [Math.ceil(grid.w / 2), Math.ceil(grid.h / 2)];
        const isCenter = (x - tx === hx) && (y - ty === hy);

        // Identify grid coordinates covered by the template Graphics
        const positions = [];
        for (let r = -nRows; r < nRows; r++) {
            for (let c = -nCols; c < nCols; c++) {
                const [gx, gy] = grid.getPixelsFromGridPosition(row0 + r, col0 + c);
                const [testX, testY] = [(gx + hx) - x, (gy + hy) - y];
                const contains = ((r === 0) && (c === 0) && isCenter) || grid._testShape(testX, testY, template.object.shape);
                if (!contains) continue;
                positions.push({x: gx, y: gy});
            }
        }
        return positions;
    }

}