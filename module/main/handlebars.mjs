import {Pl1eHelpers} from "../helpers/helpers.mjs";

/**
 * Custom Handlebars for Pl1e
 */
export const registerHandlebars = function () {
    Handlebars.registerHelper('concat', function () {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('minus', function(a, b) {
        return a - b;
    });

    Handlebars.registerHelper('plus', function(a, b) {
        return a + b;
    });

    Handlebars.registerHelper('multiply', function(a, b) {
        return a * b;
    });

    Handlebars.registerHelper('config', function (...args) {
        return Pl1eHelpers.getConfig(...args);
    });

    // Register a new helper for custom handling of select options
    Handlebars.registerHelper('customSelectOptions', function(choices, options) {
        const modifiedChoices = {};
        for (const key in choices) {
            const value = choices[key];
            // Check if the choice has a label property and use it; otherwise, use the choice directly
            modifiedChoices[key] = value.label ? value.label : value;
        }
        // Call the original selectOptions helper with the modified choices
        return Handlebars.helpers.selectOptions(modifiedChoices, options);
    });

    Handlebars.registerHelper('join', function(arr, separator, localize = false) {
        const processedArray = localize ? arr.map(item => game.i18n.localize(item)) : arr;
        return processedArray.join(separator);
    });

    Handlebars.registerHelper('list', function(arr, localize = false) {
        const processedArray = localize ? arr.map(item => game.i18n.localize(item)) : arr;

        const listItems = processedArray.map(item => {
            // Use Handles.escapeExpression to escape all special characters
            const escapedItem = Handlebars.escapeExpression(item);
            return `<li>${escapedItem}</li>`;
        }).join('');

        return new Handlebars.SafeString(`<ul>${listItems}</ul>`);
    });

    Handlebars.registerHelper('length', function (value) {
        if (Array.isArray(value) || typeof value === "string") {
            return value.length;
        }
        if (value instanceof Map || value instanceof Set) {
            return value.size;
        }
        if (typeof value === "object" && value !== null) {
            return Object.keys(value).length;
        }
        return 0;
    });

    Handlebars.registerHelper('isEmpty', function(obj) {
        return Object.keys(obj).length === 0;
    });

    Handlebars.registerHelper('contains', function(array, item, options) {
        return Array.isArray(array) && array.indexOf(item) > -1;
    });

    Handlebars.registerHelper('range', function(start, end, options) {
        let accumulator = "";
        for (let i = start; i <= end; ++i) {
            // This adds the block content to the accumulator for each iteration, setting "this" to the current value
            accumulator += options.fn(i);
        }
        return accumulator;
    });

    Handlebars.registerHelper('clamp', function(value, min, max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        } else {
            return value;
        }
    });

    Handlebars.registerHelper('some', function(array, propertyPath, value) {
        if (!Array.isArray(array)) return false;

        const properties = propertyPath.split('.');

        return array.some(item => {
            let prop = item;
            for (let i = 0; i < properties.length; i++) {
                if (prop == null) return false;
                prop = prop[properties[i]];
            }
            return prop === value;
        });
    });

    Handlebars.registerHelper('all', function(array, propertyPath, value) {
        if (!Array.isArray(array)) return false;

        const properties = propertyPath.split('.');

        return array.every(item => {
            let prop = item;
            for (let i = 0; i < properties.length; i++) {
                if (prop == null) return false;
                prop = prop[properties[i]];
            }
            return prop === value;
        });
    });

    Handlebars.registerHelper('abs', function (value){
        return Math.abs(value);
    })

    Handlebars.registerHelper('isInfinite', function(value) {
        return value === Infinity || value === "Infinity";
    });
}