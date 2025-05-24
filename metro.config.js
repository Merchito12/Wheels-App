// metro.config.js
const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push("cjs");

// ✅ This disables the use of the "exports" field in package.json,
// which fixes module resolution issues for some packages
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;

