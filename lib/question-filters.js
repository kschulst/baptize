const pascalCase = require('uppercamelcase');
const _ = require('lodash');

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
        return _.upperCase(input);
    },

    /** lowercase */
    lc: (input) => {
        return _.lowerCase(input);
    },

    /** PascalCase */
    pc: (input) => {
        return pascalCase(input);
    },

    /** camelCase */
    cc: (input) => {
        return _.camelCase(input);
    },

    kc: (input) => {
        return _.kebabCase(input);
    },

    sc: (input) => {
        return _.snakeCase(input);
    }


};