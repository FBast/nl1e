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

    Handlebars.registerHelper('length', function(arr) {
        if (Array.isArray(arr) || typeof(arr) === "string") return arr.length;
        else return Object.keys(arr).length;
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
}