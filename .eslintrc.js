module.exports = /** @type {import("eslint").ESLint.Options} */ ({
  extends: ["@nqminds/eslint-config-react"],
  rules: {
    "object-curly-spacing": "off", // conflicts with prettier
  },
});
