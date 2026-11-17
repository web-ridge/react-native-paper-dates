const escape = require('escape-string-regexp')
const fs = require('fs')
const { getDefaultConfig } = require('expo/metro-config')
const pak = require('../package.json')
const path = require('path')
const projectRoot = __dirname
const nodeModules = path.join(projectRoot, 'node_modules')
const workspaceRoot = path.resolve(projectRoot, '..')
const librarySrc = path.join(workspaceRoot, 'src')
const libraryEntry = fs.realpathSync(path.join(librarySrc, 'index.ts'))

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)
const modules = Object.keys(pak.peerDependencies)

// Watch only the library source — not the whole repo (avoids nested node_modules issues)
config.watchFolders = [librarySrc]

config.resolver.nodeModulesPaths = [
  nodeModules,
  path.join(workspaceRoot, 'node_modules'),
]

config.resolver.blockList = [
  ...config.resolver.blockList,
  ...modules.map(
    (name) =>
      new RegExp(
        `^${escape(path.join(workspaceRoot, 'node_modules', name))}\\/.*$`
      )
  ),
]

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...Object.fromEntries(
    modules.map((name) => [name, path.join(nodeModules, name)])
  ),
}

const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === pak.name) {
    return {
      filePath: libraryEntry,
      type: 'sourceFile',
    }
  }

  const translationsPrefix = `${pak.name}/translations/`
  if (moduleName.startsWith(translationsPrefix)) {
    return {
      filePath: path.join(
        librarySrc,
        'translations',
        `${moduleName.slice(translationsPrefix.length)}.ts`
      ),
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

  return (originalResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform
  )
}

module.exports = config
