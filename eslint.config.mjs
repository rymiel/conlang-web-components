import blueprint from "@blueprintjs/eslint-plugin";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["build/", "vite.config.mts", "eslint.config.mjs"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    settings: { react: { version: "detect" } },
    plugins: { "@blueprintjs": blueprint, "react-hooks": reactHooks },
    rules: {
      ...blueprint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-deprecated": "error",
      semi: "warn",
      "react/no-access-state-in-setstate": "warn",
      "react/jsx-tag-spacing": [
        "warn",
        { closingSlash: "allow", beforeSelfClosing: "always", afterOpening: "allow", beforeClosing: "allow" },
      ],
      "react/jsx-props-no-multi-spaces": "warn",
      "react/no-unescaped-entities": "off",
      "@blueprintjs/html-components": "error",
      "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "always" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
);
