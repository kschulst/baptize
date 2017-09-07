const pascalCase = require('uppercamelcase');
const camelCase = require('camelcase');

/**
 * Question filter functions
 *
 * Can be referenced using a 'filter' placeholder according to the following format:
 * <filterName>:<questionName>
 *
 * Examples:
 * pc:myQuestion
 */
module.exports = {

    /** UPPERCASE */
    uc: (input) => {
        return input.toUpperCase();
    },

    /** lowercase */
    lc: (input) => {
        return input.toLowerCase();
    },

    /** PascalCase */
    pc: (input) => {
        return pascalCase(input);
    },

    /** camelCase */
    cc: (input) => {
        return camelCase(input);
    }

};