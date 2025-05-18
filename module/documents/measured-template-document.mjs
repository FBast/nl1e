import {Pl1eMeasuredTemplate} from "./measured-template.mjs";

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