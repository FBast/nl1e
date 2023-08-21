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

    Handlebars.registerHelper('config', function (key) {
        if (key === undefined) {
            throw new Error(`PL1E | config key is undefined`);
        }
        return CONFIG.PL1E[key];
    });

    Handlebars.registerHelper('configEntry', function (key, entry) {
        if (key === undefined) {
            throw new Error(`PL1E | configEntry key is undefined`);
        }
        if (entry === undefined) {
            throw new Error(`PL1E | configEntry entry is undefined with key ${key}`);
        }
        return CONFIG.PL1E[key][entry];
    });

    Handlebars.registerHelper('configEntryLabel', function (key, entry) {
        return CONFIG.PL1E[key][entry].label;
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
        return arr.length;
    });

}