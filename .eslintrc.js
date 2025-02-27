module.exports = {
    "parser": "@typescript-eslint/parser",
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "env": {
        "browser": true,
        "node": true
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        // https://github.com/typescript-eslint/typescript-eslint/issues/363
        "@typescript-eslint/no-unused-vars": "off",
        "no-unused-vars": "off",
        "no-debugger": "warn", // statt default error
        // Regel explizit konfigurieren, um den Fehler zu beheben:
        "@typescript-eslint/no-unused-expressions": [
            "error",
            {
                "allowShortCircuit": true,
                "allowTernary": true,
                "allowTaggedTemplates": true
            }
        ],
        "react/react-in-jsx-scope": "off",
    }
};
