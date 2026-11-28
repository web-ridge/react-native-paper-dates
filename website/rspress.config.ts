import * as path from 'node:path'
import { pluginBabel } from '@rsbuild/plugin-babel'
import { defineConfig } from '@rspress/core'
import { pluginPlayground } from '@rspress/plugin-playground'

const base = '/react-native-paper-dates/'
const modules = path.join(__dirname, 'node_modules')
const src = path.join(__dirname, '..', 'src')

const pinned = [
  '@react-native-vector-icons/material-design-icons',
  'react',
  'react-dom',
  'react-native-paper',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-web',
  'react-native-worklets',
]

export default defineConfig({
  base,
  builderConfig: {
    output: {
      copy: [
        {
          from: path.join(modules, '@babel/standalone/babel.min.js'),
          info: { minimized: true },
          to: 'playground/babel.min.js',
        },
        {
          from: path.join(modules, 'monaco-editor/min/vs'),
          info: { minimized: true },
          to: 'playground/vs',
        },
      ],
    },
    plugins: [
      pluginBabel({
        babelLoaderOptions: {
          plugins: ['react-native-worklets/plugin'],
          presets: [
            ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
          ],
        },
        include: [src, /[\\/]node_modules[\\/]react-native-paper[\\/]/],
      }),
    ],
    resolve: {
      alias: {
        ...Object.fromEntries(
          pinned.map((name) => [name, path.join(modules, name)])
        ),
        '@react-native-vector-icons/get-image': false,
        '@react-native/assets-registry/registry': false,
        'expo-font': false,
        'react-native$': 'react-native-web',
        'react-native-paper-dates$': path.join(src, 'index.ts'),
        'react-native-paper-dates/translations': path.join(src, 'translations'),
      },
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.mjs',
        '.web.js',
        '.tsx',
        '.ts',
        '.mjs',
        '.js',
        '.json',
      ],
    },
    source: {
      define: {
        __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
        global: 'globalThis',
      },
      include: [src],
    },
    tools: {
      rspack: {
        module: {
          rules: [
            {
              test: /@react-native-vector-icons[\\/].*\.js$/,
              type: 'javascript/auto',
            },
          ],
        },
      },
    },
  },
  description:
    'Cross-platform Material Design date and time pickers for React Native Paper',
  icon: '/favicon.svg',
  logo: {
    dark: '/logo-dark.svg',
    light: '/logo.svg',
  },
  logoText: 'React Native Paper Dates',
  plugins: [
    pluginPlayground({
      babelUrl: `${base}playground/babel.min.js`,
      defaultDirection: 'vertical',
      include: [
        'react-native',
        'react-native-paper',
        'react-native-paper-dates',
        'react-native-safe-area-context',
      ],
      monacoLoader: { paths: { vs: `${base}playground/vs` } },
      render: path.join(__dirname, 'components', 'Playground.tsx'),
    }),
  ],
  root: path.join(__dirname, 'docs'),
  themeConfig: {
    editLink: {
      docRepoBaseUrl:
        'https://github.com/web-ridge/react-native-paper-dates/tree/master/website/docs',
    },
    footer: {
      message: `
        <div class="paper-footer">
          <div class="paper-footer__cols">
            <div>
              <h4>Docs</h4>
              <a href="/react-native-paper-dates/guide/introduction">Introduction</a>
              <a href="/react-native-paper-dates/guide/installation">Installation</a>
              <a href="/react-native-paper-dates/guide/migration">Migration</a>
              <a href="/react-native-paper-dates/guide/localization">Localization</a>
            </div>
            <div>
              <h4>Other libraries</h4>
              <a href="https://github.com/web-ridge/react-native-use-form">React Native Use Form</a>
              <a href="https://github.com/web-ridge/react-native-paper-tabs">React Native Paper Tabs</a>
              <a href="https://github.com/web-ridge/react-native-ridge-navigation">React Native Ridge Navigation</a>
              <a href="https://github.com/web-ridge/react-native-ridge-translations">React Ridge Translations</a>
              <a href="https://github.com/web-ridge/react-ridge-state">React Ridge State</a>
            </div>
            <div>
              <h4>More</h4>
              <a href="https://www.youtube.com/watch?v=SHhQU2doTug">YouTube</a>
              <a href="https://www.reactnativepaperdates.com/">Demo</a>
              <a href="https://www.webridge.nl/">webRidge</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="https://github.com/web-ridge/react-native-paper-dates/issues">Report Bug</a>
            </div>
          </div>
          <p class="paper-footer__copy">Copyright © ${new Date().getFullYear()} Web Ridge. Built with Rspress.</p>
        </div>
      `,
    },
    socialLinks: [
      {
        content: 'https://github.com/web-ridge/react-native-paper-dates',
        icon: 'github',
        mode: 'link',
      },
    ],
  },
  title: 'Paper Dates',
})
