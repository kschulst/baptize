/**
 * Generator functions
 * -------------------
 * Can be referenced using a 'function' placeholder according to the following format:
 * f:<function name>(<args>)
 *
 * Examples:
 * f:myFunction()
 * f:myFunction(myparam, 123)
 * f:randomDigits(12)
 */
module.exports = {
    randomDigits: (length) => {
        let digits = "0123456789";
        let result = '';
        for (let i = length; i > 0; --i) {
            result += digits[Math.floor(Math.random() * 10)];
        }
        return result;
    },

    randomChars: (length) => {
        let chars = "abcdefghijklmnopqrstuvwxyz";
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * 26)];
        }
        return result;
    },

    randomCharsUpperCase: (length) => {
        return module.exports.randomChars(length).toUpperCase();
    },

    randomAlphanum: (length) => {
        let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * 36)];
        }
        return result;
    },

    randomAlphanumUpperCase: (length) => {
        return module.exports.randomAlphanum(length).toUpperCase();
    },

};