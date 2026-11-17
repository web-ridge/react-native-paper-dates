const { version } = require('../package.json')

module.exports = function (api) {
  api.cache.using(() => version)

  return {
    plugins: [
      function inlineLibraryVersion({ types: t }) {
        return {
          visitor: {
            StringLiteral(path) {
              if (path.node.value === '__LIBRARY_VERSION__') {
                path.replaceWith(t.stringLiteral(version))
              }
            },
          },
        }
      },
    ],
    presets: ['babel-preset-expo'],
  }
}
