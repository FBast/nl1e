export class AbilityTemplate extends MeasuredTemplate {

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

  #targets = [];
  #templates = [];

  /* -------------------------------------------- */

  /**
   * A factory method to create an AbilityTemplate instance using provided data from an Pl1eItem instance
   * @param {Pl1eItem} item               The Item object for which to construct the template
   * @param {object} attributes
   * @param {object} optionalAttributes
   * @returns {AbilityTemplate|null}    The template object, or null if the item does not produce a template
   */
  static async fromItem(item, attributes, optionalAttributes) {
    const areaShape = attributes.areaShape.value;

    // Save targetGroups for token selection
    let targetGroups = [];
    for (const [id, optionalAttribute] of Object.entries(optionalAttributes)) {
      if (targetGroups.includes(optionalAttribute.targetGroup)) continue;
      targetGroups.push(optionalAttribute.targetGroup);
    }

    // Prepare template data
    const templateData = {
      t: areaShape,
      user: game.user.id,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color,
      flags: {pl1e: {origin: item.uuid}}
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
        templateData.distance = attributes.circleRadius.value * game.system.gridDistance;
        break;
      case "cone":
        templateData.distance = attributes.coneLength.value * game.system.gridDistance;
        templateData.angle = attributes.coneAngle.value;
        break;
      case "square":
        templateData.t = "rect";
        templateData.distance = attributes.squareLength.value * game.system.gridDistance;
        templateData.width = attributes.squareLength.value * game.system.gridDistance;
        templateData.height = attributes.squareLength.value * game.system.gridDistance;
        templateData.direction = 45;
        break;
      case "ray":
        templateData.width = game.system.gridDistance;
        templateData.distance = attributes.rayLength.value * game.system.gridDistance;
        break;
    }

    // Return the template constructed from the item data
    const cls = CONFIG.MeasuredTemplate.documentClass;
    const template = new cls(templateData, {parent: canvas.scene});
    const object = new this(template);
    object.item = item;
    object.actorSheet = item.actor?.sheet || null;
    object.token = item.actor?.bestToken;
    object.targetGroups = targetGroups;

    //TODO-fred change the controlIcon sprite

    // object.controlIcon = new ControlIcon({
    //   texture: item.img,
    //   size: 50,
    //   icon: item.img,
    //   title: item.name,
    //   onClick: () => {
    //     //Handle click event here
    //   },
    //   layer: "myLayer" // replace myLayer with the name of your desired layer
    // });
    return object;
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

  /**
   * Delete the templates after releasing targets
   */
  releaseTemplate() {
    for (let document of this.#templates) {
      document.delete();
    }
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
  * @param {Event} event  Triggering event that ended the placement.
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
  * Move the template preview when the mouse moves.
  * @param {Event} event  Triggering mouse event.
  */
  _onMovePlacement(event) {
    event.stopPropagation();
    let now = Date.now(); // Apply a 20ms throttle
    if (now - this.#moveTime <= 20) return;
    let templateCenter = event.data.getLocalPosition(this.layer);
    const offset = 50;
    templateCenter.x -= offset;
    templateCenter.y -= offset;
    // Clamp with range
    const range = this.item.system.attributes.range.value * game.system.gridDistance;
    templateCenter = this._clampVectorRadius(templateCenter, this.token, range * 100);
    // Snap position
    templateCenter = canvas.grid.getSnappedPosition(templateCenter.x, templateCenter.y, 1);
    // Move position
    this.document.updateSource({x: templateCenter.x + offset, y: templateCenter.y + offset});
    this.refresh();
    // Target tokens
    const gridPositions = this._getGridHighlightPositions();
    this._targetTokensInPositions(gridPositions);
    this.#moveTime = now;
  }

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
  * @param {Event} event  Triggering mouse event.
  */
  _onRotatePlacement(event) {
    if ( event.ctrlKey ) event.preventDefault(); // Avoid zooming the browser window
    if (["square", "circle"].includes(this.document.t)) return;
    event.stopPropagation();
    let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
    let snap = (event.shiftKey ? delta : 5);
    const update = {direction: this.document.direction + (snap * Math.sign(event.deltaY))};
    this.document.updateSource(update);
    this.refresh();
    // Target tokens
    const gridPositions = this._getGridHighlightPositions();
    this._targetTokensInPositions(gridPositions);
  }

  /**
  * Confirm placement when the left mouse button is clicked.
  * @param {Event} event  Triggering mouse event.
  */
  async _onConfirmPlacement(event) {
    await this._finishPlacement(event);
    const destination = canvas.grid.getSnappedPosition(this.document.x, this.document.y, 2);
    this.document.updateSource(destination);
    this.#templates = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]);
    this.#events.resolve(this.#templates);
  }

  /**
  * Cancel placement when the right mouse button is clicked.
  * @param {Event} event  Triggering mouse event.
  */
  async _onCancelPlacement(event) {
    await this._finishPlacement(event);
    this.#events.reject();
  }

  /**
   * Target all tokens inside the template
   * @param gridPositions
   * @private
   */
  _targetTokensInPositions(gridPositions) {
    // Untarget previous targeted
    for (let token of this.#targets) {
      token.setTarget(false, { user: game.user, releaseOthers: false, groupSelection: false });
    }
    // Target current position
    for (let gridPosition of gridPositions) {
      for (let token of canvas.tokens.placeables) {
        // Check if target position in template
        if (token.x === gridPosition.x && token.y === gridPosition.y) {
          // Filter non valid targets
          if (!this.targetGroups.includes('all')) {
            if (!this.targetGroups.includes('self') && token.document === this.token) continue;
            if (!this.targetGroups.includes('allies') && token.document.disposition === this.token.disposition) continue;
            if (!this.targetGroups.includes('opponents') && token.document.disposition !== this.token.disposition) continue;
          }
          // Dont target a token which is already targeted
          if (token.targeted.has(game.user)) continue;
          // Set target and add to target list
          token.setTarget(true, { user: game.user, releaseOthers: false, groupSelection: false });
          this.#targets.push(token);
        }
      }
    }
  }

  _getGridHighlightPositions() {
    const grid = canvas.grid.grid;
    const d = canvas.dimensions;
    const {x, y, distance} = this.document;

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
    for ( let r = -nRows; r < nRows; r++ ) {
      for ( let c = -nCols; c < nCols; c++ ) {
        const [gx, gy] = grid.getPixelsFromGridPosition(row0 + r, col0 + c);
        const [testX, testY] = [(gx+hx) - x, (gy+hy) - y];
        const contains = ((r === 0) && (c === 0) && isCenter ) || grid._testShape(testX, testY, this.shape);
        if ( !contains ) continue;
        positions.push({x: gx, y: gy});
      }
    }
    return positions;
  }

}