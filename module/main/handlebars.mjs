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
        let data = CONFIG.PL1E;
        for (let arg of args){
            // Ignore if not string
            if (typeof arg !== "string") continue;

            data = data[arg];
            if (data === undefined)
                console.warn(`PL1E | config return is undefined with args ${args}`);
        }
        return data;
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