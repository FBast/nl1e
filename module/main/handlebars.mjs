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

    Handlebars.registerHelper('join', function(arr, separator) {
        return arr.join(separator);
    });

    Handlebars.registerHelper('length', function(arr) {
        if (Array.isArray(arr) || typeof(arr) === "string") return arr.length;
        else return Object.keys(arr).length;
    });

    Handlebars.registerHelper('isEmpty', function(obj) {
        return Object.keys(obj).length === 0;
    });
}