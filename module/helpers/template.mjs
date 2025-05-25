export const Pl1eTemplate = {
    /**
     * Get the primary position of a template
     * @param {MeasuredTemplateDocument} template - The template document.
     * @return {{x: number, y: number}}
     */
    getPrimaryPosition(template) {
        const gridSize = canvas.grid.size;

        let x = template.x - gridSize / 2;
        let y = template.y - gridSize / 2;

        const point = new PIXI.Point(x, y);
        return canvas.grid.getSnappedPoint(point, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
    },

    /**
     * Get the secondary position of a template (fallback to primary)
     * @param {MeasuredTemplateDocument} template - The template document.
     * @return {{x: number, y: number}}
     */
    getSecondaryPosition(template) {
        const gridSize = canvas.grid.size;

        let x, y;
        if (template.t === "ray" || template.t === "cone") {
            const distanceInPixels = template.distance * gridSize;
            const rayAngleRadians = Math.toRadians(template.direction);
            x = template.x + Math.cos(rayAngleRadians) * distanceInPixels - gridSize / 2;
            y = template.y + Math.sin(rayAngleRadians) * distanceInPixels - gridSize / 2;
        } else {
            // Fallback to primary if no secondary position is defined
            return Pl1eTemplate.getPrimaryPosition(template);
        }

        const point = new PIXI.Point(x, y);
        return canvas.grid.getSnappedPoint(point, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
    },

    /**
     * Determine the position on the template based on primary or secondary.
     * @param {MeasuredTemplateDocument} template - The template document.
     * @param {string} type - Either "templatePrimary" or "templateSecondary".
     * @returns {Object} - The position {x, y}.
     */
    getTemplatePosition(template, type) {
        if (type === "templatePrimary") {
            return Pl1eTemplate.getPrimaryPosition(template);
        } else if (type === "templateSecondary") {
            return Pl1eTemplate.getSecondaryPosition(template);
        } else {
            console.warn(`Unknown movement destination type: ${type}`);
            return null;
        }
    }
}