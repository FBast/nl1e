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

    // Save a reference to the original selectOptions helper
    const originalSelectOptions = Handlebars.helpers.selectOptions;
    Handlebars.registerHelper('selectOptions', function(choices, options) {
        const modifiedChoices = {};
        for (const key in choices) {
            const value = choices[key];
            if (value.label) modifiedChoices[key] = value.label;
            else modifiedChoices[key] = value;
        }
        return originalSelectOptions(modifiedChoices, options);
    });

    Handlebars.registerHelper('selectOptionsWithLabel', function(choices, options) {
        const optionsData = {};
        for (const key in choices) {
            const value = choices[key];
            optionsData[key] = value.label;
        }
        return Handlebars.helpers.selectOptions(optionsData, options);
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