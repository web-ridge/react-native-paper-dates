import * as path from 'node:path'
import { defineConfig } from '@rspress/core'

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Paper Dates',
  description:
    'Cross-platform Material Design date and time pickers for React Native Paper',
  base: '/react-native-paper-dates/',
  icon: '/favicon.svg',
  logo: {
    light: '/logo.svg',
    dark: '/logo-dark.svg',
  },
  logoText: 'React Native Paper Dates',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-ridge/react-native-paper-dates',
      },
    ],
    footer: {
      message: `
        <div class="paper-footer">
          <div class="paper-footer__cols">
            <div>
              <h4>Docs</h4>
              <a href="/react-native-paper-dates/guide/introduction">Introduction</a>
              <a href="/react-native-paper-dates/guide/installation">Installation</a>
              <a href="/react-native-paper-dates/guide/localization">Localization</a>
            </div>
            <div>
              <h4>Other libraries</h4>
              <a href="https://github.com/web-ridge/react-native-use-form">React Native Use Form</a>
              <a href="https://github.com/web-ridge/react-native-paper-tabs">React Native Paper Tabs</a>
              <a href="https://github.com/web-ridge/react-native-ridge-navigation">React Native Ridge Navigation</a>
              <a href="https://github.com/web-ridge/react-ridge-translations">React Ridge Translations</a>
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
    editLink: {
      docRepoBaseUrl:
        'https://github.com/web-ridge/react-native-paper-dates/tree/master/website/docs',
    },
  },
})
