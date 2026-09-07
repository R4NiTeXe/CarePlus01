import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/**", ".next/**", "out/**", "coverage/**", "next-env.d.ts"] },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-namespace": "off",
    },
  },
);
