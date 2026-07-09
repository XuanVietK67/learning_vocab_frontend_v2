// Metro config for the Expo app inside a pnpm/Turborepo monorepo.
// Lets Metro see and transpile workspace packages (e.g. @repo/shared) and
// resolve dependencies hoisted to the repo root (node-linker=hoisted).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the workspace root IN ADDITION to Expo's defaults, so edits to
//    packages/* trigger reloads (keep the defaults so expo-doctor stays happy).
config.watchFolders = Array.from(
  new Set([...(config.watchFolders ?? []), workspaceRoot]),
);

// 2. Resolve node modules from the app first, then the hoisted workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force a single copy of React / React Native into the bundle. The web app
//    pins a different React version elsewhere in the monorepo; this guarantees
//    the mobile bundle never loads two Reacts (which causes invalid-hook-call
//    crashes).
config.resolver.extraNodeModules = {
  react: path.resolve(workspaceRoot, "node_modules/react"),
  "react-native": path.resolve(workspaceRoot, "node_modules/react-native"),
};

module.exports = config;
