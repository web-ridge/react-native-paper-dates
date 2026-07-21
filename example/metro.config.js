const path = require('path')
const fs = require('fs')
const escape = require('escape-string-regexp')
const { getDefaultConfig } = require('expo/metro-config')
const pak = require('../package.json')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '..')
const nodeModules = path.join(projectRoot, 'node_modules')
const librarySrc = path.join(workspaceRoot, 'src')
const libraryEntry = fs.realpathSync(path.join(librarySrc, 'index.tsx'))

const modules = Object.keys({
  ...pak.peerDependencies,
})

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// Watch only the library source — not the whole repo (avoids nested node_modules issues)
config.watchFolders = [librarySrc]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  ...modules.map(
    (m) =>
      new RegExp(
        `^${escape(path.join(workspaceRoot, 'node_modules', m))}\\/.*$`
      )
  ),
]

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  ...modules.reduce((acc, name) => {
    acc[name] = path.join(nodeModules, name)
    return acc
  }, {}),
  crypto: path.join(nodeModules, 'expo-crypto'),
}

const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === pak.name) {
    return {
      filePath: libraryEntry,
      type: 'sourceFile',
    }
  }

  if (moduleName === '@react-native-vector-icons/material-design-icons') {
    return context.resolveRequest(
      context,
      '@expo/vector-icons/MaterialCommunityIcons',
      platform
    )
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }

  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
