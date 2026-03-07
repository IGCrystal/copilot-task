import js from "@eslint/js";
import globals from "globals";
import eslintReact from "@eslint-react/eslint-plugin";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

const reactRefreshRecommendedRules =
  reactRefresh.configs?.flat?.recommended?.rules ?? reactRefresh.configs?.recommended?.rules ?? {};

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "snapshot/**",
      "assets/static/**",
      "assets/**/fonts/**",
      "assets/**/images/**",
      "**/*.min.*",
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (syntax-level; type-checking is done via `pnpm typecheck`)
  ...tseslint.configs.recommended,

  // React (recommended rules; plugin registers multiple internal namespaces like @eslint-react/rsc)
  {
    files: ["src/**/*.{ts,tsx}"],
    ...eslintReact.configs.recommended,
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ...eslintReact.configs["recommended-typescript"],
  },

  // App-specific overrides
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      ...reactRefreshRecommendedRules,

      // Prefer TS for unused checks; keep noise low.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Vite + React refresh: warn when exporting non-components from React modules.
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Make lint non-blocking for existing code patterns in this repo.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // This codebase currently uses `any` in a few boundary layers; keep as warnings.
      "@typescript-eslint/no-explicit-any": "warn",

      // Some code still uses createRef; warn instead of error for now.
      "@eslint-react/no-create-ref": "warn",
    },
  },

  // Utility scripts: allow intentional switch fallthrough.
  {
    files: ["scripts/**/*.{js,mjs,cjs}"],
    rules: {
      "no-fallthrough": "off",
    },
  },

  // Node-ish config files
  {
    files: ["vite.config.ts", "scripts/**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },

  // Disable formatting-related rules that conflict with Prettier.
  prettier,
);
