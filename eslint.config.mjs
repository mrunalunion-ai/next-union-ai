import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      // These React Compiler diagnostics are stricter than the project's
      // existing Next.js lint behavior and would require behavior-changing
      // rewrites of established form and hydration patterns.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default eslintConfig;
