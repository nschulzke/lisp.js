module.exports = {
    "extends": "eslint:recommended",
    "env": {
        "node": true,
        "es6": true,
        "jest": true,
    },
    "rules": {
        "semi": ["error", "always"],
    },
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    }
};
