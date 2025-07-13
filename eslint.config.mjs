import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ["next/core-web-vitals", "next/typescript", "prettier"],
        rules: {
            semi: ["error"],
            quotes: ["error", "double"],
            "prefer-arrow-callback": ["error"], //prefer arrow function
            "prefer-template": ["error"], //prefer template literal
            "no-restricted-imports": [
                "error",
                {
                    name: "next/link",
                    message: "Please import from `@/i18n/navigation` instead.",
                },
                {
                    name: "next/navigation",
                    importNames: ["redirect", "permanentRedirect", "useRouter", "usePathname"],
                    message: "Please import from `@/i18n/navigation` instead.",
                },
            ],
        },
    }),
];

export default eslintConfig;
