const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx');

const { resolver } = config;

// Get the tsconfig paths
const tsconfig = require('./tsconfig.json');
const { compilerOptions } = tsconfig;

// Create a map of aliases
const aliases = Object.keys(compilerOptions.paths).reduce((acc, key) => {
  const newKey = key.replace('/*', '');
  const value = compilerOptions.paths[key][0].replace('/*', '');
  acc[newKey] = value;
  return acc;
}, {});

// Apply the aliases to the Metro config
config.resolver.alias = aliases;

module.exports = config;
