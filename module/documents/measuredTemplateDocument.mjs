import {Pl1eMeasuredTemplate} from "./measuredTemplate.mjs";

export class Pl1eMeasuredTemplateDocument extends MeasuredTemplateDocument {

    get itemId() {
        return this.getFlag('pl1e', 'itemId');
    }

    get token() {
        return this.getFlag('pl1e', 'token');
    }

    get tokenId() {
        return this.getFlag('pl1e', 'tokenId');
    }

    get sceneId() {
        return this.getFlag('pl1e', 'sceneId');
    }

    get attributes() {
        return this.getFlag('pl1e', 'attributes');
    }

    get activeAspects() {
        return this.getFlag('pl1e', 'activeAspects');
    }

    /**
     * Get the primary position of a template
     * @return {{x: number, y: number}}
     */
    get primaryPosition() {
        const gridSize = canvas.grid.size;

        let x, y;
        x = this.x - gridSize / 2;
        y = this.y - gridSize / 2;

        const point = new PIXI.Point(x, y);
        return canvas.grid.getSnappedPoint(point, { mode: CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER });
    }

     /**
     * Get the secondary position of a template (fallback to primary)
     * @return {{x: number, y: number}}
     */
    get secondaryPosition() {
        const gridSize = canvas.grid.size;

        let x, y;
        if (this.t === "ray" || this.t === "cone") {
            const distanceInPixels = this.distance * gridSize;
            const rayAngleRadians = Math.toRadians(this.direction);
            x = this.x + Math.cos(rayAngleRadians) * distanceInPixels - gridSize / 2;
            y = this.y + Math.sin(rayAngleRadians) * distanceInPixels - gridSize / 2;
        } else {
            return this.primaryPosition;
        }

        const point = new PIXI.Point(x, y);
        return canvas.grid.getSnappedPoint(point, { mode: CONST.GRID_SNAPPING_MODES.TOP_LEFT_CORNER });
    }

    /**
     * Determine the position on the template based on primary or secondary.
     * @param {string} type - Either "templatePrimary" or "templateSecondary".
     * @returns {Object} - The position {x, y}.
     */
    getTemplatePosition(type) {
        if (type === "templatePrimary") {
            return this.primaryPosition;
        }
        else {
            return this.secondaryPosition;
        }
    }

    /**
     * Creates and places a template directly from item data.
     * @param {Pl1eItem} item - The item to create the template from.
     * @param {TokenDocument} token - The token associated with the item.
     * @param {Object} attributes - Template attributes.
     * @param {Object} activeAspects - Additional aspects for the template.
     * @returns {Promise<Pl1eMeasuredTemplateDocument>} - The placed template document.
     */
    static async fromItem(item, token, attributes, activeAspects) {
        const areaShape = attributes.areaShape;
        const templateData = {
            t: areaShape,
            user: game.user.id,
            direction: 0,
            x: 0,
            y: 0,
            fillColor: game.user.color,
            flags: {
                pl1e: {
                    itemId: item.id,
                    token: token,
                    tokenId: token.id,
                    sceneId: token.parent.id,
                    attributes: attributes,
                    activeAspects: activeAspects
                }
            }
        };

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

        // Create the template document and object
        const templateDocument = new Pl1eMeasuredTemplateDocument(templateData, { parent: canvas.scene });
        const templateObject = new Pl1eMeasuredTemplate(templateDocument);

        // Link object and document
        templateObject.document = templateDocument;

        // Draw the preview
        return await templateObject.drawPreview();
    }
}