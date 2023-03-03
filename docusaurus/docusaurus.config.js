// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Paper Dates',
  tagline:
    'Cross-platform Material Design date and time pickers for React Native Paper',
  url: 'https://web-ridge.github.io',
  baseUrl: '/react-native-paper-dates/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'web-ridge', // Usually your GitHub org/user name.
  projectName: 'react-native-paper-dates', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'React Native Paper Dates',
        logo: {
          alt: 'Docusaurus Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/web-ridge/react-native-paper-dates',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Other libraries',
            items: [
              {
                label: 'React Native Use Form',
                href: 'https://github.com/web-ridge/react-native-use-form',
              },
              {
                label: 'React Native Paper Tabs',
                href: 'https://github.com/web-ridge/react-native-paper-tabs',
              },
              {
                label: 'React Native Ridge Navigation',
                href: 'https://github.com/web-ridge/react-native-ridge-navigation',
              },
              {
                label: 'React Ridge Translations',
                href: 'https://github.com/web-ridge/react-ridge-translations',
              },
              {
                label: 'React Ridge State',
                href: 'https://github.com/web-ridge/react-ridge-state',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/watch?v=SHhQU2doTug',
              },
              {
                label: 'Demo',
                href: 'https://www.reactnativepaperdates.com/',
              },
              {
                label: 'webRidge',
                href: 'https://www.webridge.nl/',
              },
            ],
          },
          {
            title: 'Support',
            items: [
              {
                label: 'Report Bug',
                href: 'https://github.com/web-ridge/react-native-paper-dates/issues',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Web Ridge. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
}

module.exports = config
