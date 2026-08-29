import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Zero-Crossing zones.
 *
 * Adding an institute: call `instituteZones("<slug>", ["<public>", ...roles])`
 * in the same PR as the first page. Do not create `features/institutes/_shared`.
 */
const zeroCrossing = {
  patterns: [
    {
      regex: "@/(app/\\(institutes\\)|features/institutes)",
      message:
        "Zero-Crossing: university/auth/platform kernel must not import institutes.",
    },
  ],
};

function institutePatterns(slug, siblingPortals) {
  return [
    {
      regex: "@/app/\\(public\\)",
      message:
        "Zero-Crossing: institutes must not import university public UI.",
    },
    {
      regex: `@/app/\\(institutes\\)/\\((?!${slug}_institute\\))`,
      message: "Zero-Crossing: institutes must not import each other.",
    },
    ...(siblingPortals
      ? [
          {
            regex: `@/app/\\(institutes\\)/\\(${slug}_institute\\)/\\((${siblingPortals})\\)/_components`,
            message:
              "Zero-Crossing: a portal may import _shared only, not sibling portal _components.",
          },
        ]
      : []),
  ];
}

function instituteZones(slug, portals) {
  return [
    {
      files: [`app/(institutes)/(${slug}_institute)/_shared/**/*.{ts,tsx}`],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: institutePatterns(slug) },
        ],
      },
    },
    ...portals.map((portal) => ({
      files: [
        `app/(institutes)/(${slug}_institute)/(${portal})/**/*.{ts,tsx}`,
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: institutePatterns(
              slug,
              portals.filter((p) => p !== portal).join("|"),
            ),
          },
        ],
      },
    })),
  ];
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: [
      "app/layout.tsx",
      "app/(public)/**/*.{ts,tsx}",
      "app/(auth)/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
      "features/news/**/*.{ts,tsx}",
      "features/think-tanks/**/*.{ts,tsx}",
      "features/auth/**/*.{ts,tsx}",
      "features/finance/**/*.{ts,tsx}",
    ],
    rules: { "no-restricted-imports": ["error", zeroCrossing] },
  },
  ...instituteZones("psy", ["psy", "patient", "therapist", "admin"]),
]);

export default eslintConfig;
