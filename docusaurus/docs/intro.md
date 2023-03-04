---
sidebar_position: 1
---

# Introduction

![Minified zip badge](https://badgen.net/bundlephobia/minzip/react-native-paper-dates)
![NPM downloads per year badge](https://badgen.net/npm/dy/react-native-paper-dates)
![Types logo](https://badgen.net/npm/types/react-native-paper-dates)
![License badge](https://badgen.net/npm/license/react-native-paper-dates)
![Runs with expo badge](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?style=flat-square&logo=EXPO&labelColor=f3f3f3&logoColor=000)

[React Native Paper Dates](https://github.com/web-ridge/react-native-paper-dates) is a cross-platform [Material Design](https://m3.material.io/) date and time picker library for [React Native Paper](https://reactnativepaper.com/).

[![Demo of react-native-paper-dates](https://user-images.githubusercontent.com/6492229/98866767-bd3f2780-246d-11eb-890e-3491b47c95c5.gif)](https://www.youtube.com/watch?v=SHhQU2doTug)

## Installation

### Prerequisites

Install and follow the guide at [react-native-paper](https://callstack.github.io/react-native-paper/getting-started.html).

### Yarn

```bash
yarn add react-native-paper-dates
```

### Npm

```bash
npm install react-native-paper-dates --save
```

## Register Translation

### Supported

React-Native-Paper-Dates currently supports `en/nl/de/pl/pt/ar/ko/fr/he/tr/enGB` translations. Ideally you would do this somewhere before react-native-paper-dates is used. For example, you might add the follow to your `index.js` or `app.js`.

```javascript
import { enGB, registerTranslation } from 'react-native-paper-dates'
registerTranslation('en-GB', enGB)
```

### Custom

React-Native-Paper-Dates also provides the ability to register your own translation. Ideally you would do this somewhere before react-native-paper-dates is used. For example, you might add the follow to your `index.js` or `app.js`.

```javascript
import { registerTranslation } from 'react-native-paper-dates'
registerTranslation('pl', {
  save: 'Save',
  selectSingle: 'Select date',
  selectMultiple: 'Select dates',
  selectRange: 'Select period',
  notAccordingToDateFormat: (inputFormat) =>
    `Date format must be ${inputFormat}`,
  mustBeHigherThan: (date) => `Must be later then ${date}`,
  mustBeLowerThan: (date) => `Must be earlier then ${date}`,
  mustBeBetween: (startDate, endDate) =>
    `Must be between ${startDate} - ${endDate}`,
  dateIsDisabled: 'Day is not allowed',
  previous: 'Previous',
  next: 'Next',
  typeInDate: 'Type in date',
  pickDateFromCalendar: 'Pick date from calendar',
  close: 'Close',
})
```

:::info Note

If a language is not supported. Consider creating a pull request so that it can officially be supported.

:::

## Android Caveats

:::tip Tip

We recommend Hermes with React Native >= 0.66 you won't need these polyfills at all!

:::

### Below React Native 0.66

You will need to add a polyfill for the Intl API on Android if:

- You have [Hermes](https://github.com/facebook/hermes/issues/23) enabled and are below React Native 0.66.
- You have [Hermes](https://github.com/facebook/hermes/issues/23) disabled and you want to support locales outside of en-US and you don't have the org.webkit:android-jsc-intl:+ variant enabled in your `app/build.gradle`.

### Yarn Polyfills

```bash
yarn add react-native-localize @formatjs/intl-pluralrules @formatjs/intl-getcanonicallocales @formatjs/intl-listformat @formatjs/intl-displaynames @formatjs/intl-locale @formatjs/intl-datetimeformat @formatjs/intl-numberformat @formatjs/intl-relativetimeformat
```

### Npm Polyfills

```bash
npm install react-native-localize @formatjs/intl-pluralrules @formatjs/intl-getcanonicallocales @formatjs/intl-listformat @formatjs/intl-displaynames @formatjs/intl-locale @formatjs/intl-datetimeformat @formatjs/intl-numberformat @formatjs/intl-relativetimeformat --save
```

If using [Expo](https://docs.expo.dev/), omit `react-native-localize` and use `expo install expo-localization` instead. Read more [here](https://docs.expo.dev/versions/latest/sdk/localization/#installation).

In your app starting entrypoint e.g. `./index.js` or even better use a `index.android.js` to prevent importing on iOS/web add the following code.

:::info Note

Don't forget to import the languages you want to support, in the example only english language is supported.

:::

```javascript
// on top of your index.android.js file
const isAndroid = require('react-native').Platform.OS === 'android' // this line is only needed if you don't use an .android.js file
const isHermesEnabled = !!global.HermesInternal // this line is only needed if you don't use an .android.js file

// in your index.js file
if (isHermesEnabled || isAndroid) {
  // this line is only needed if you don't use an .android.js file

  require('@formatjs/intl-getcanonicallocales/polyfill')
  require('@formatjs/intl-locale/polyfill')

  require('@formatjs/intl-pluralrules/polyfill')
  require('@formatjs/intl-pluralrules/locale-data/en.js') // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

  require('@formatjs/intl-displaynames/polyfill')
  require('@formatjs/intl-displaynames/locale-data/en.js') // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

  require('@formatjs/intl-listformat/polyfill')
  require('@formatjs/intl-listformat/locale-data/en.js') // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

  require('@formatjs/intl-numberformat/polyfill')
  require('@formatjs/intl-numberformat/locale-data/en.js') // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

  require('@formatjs/intl-relativetimeformat/polyfill')
  require('@formatjs/intl-relativetimeformat/locale-data/en.js') // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

  require('@formatjs/intl-datetimeformat/polyfill')
  require('@formatjs/intl-datetimeformat/locale-data/en.js') // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

  require('@formatjs/intl-datetimeformat/add-golden-tz.js')

  // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone
  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    // If you are using react-native-cli
    let RNLocalize = require('react-native-localize')
    Intl.DateTimeFormat.__setDefaultTimeZone(RNLocalize.getTimeZone())

    //  Are you using Expo, use this instead of previous 2 lines
    //  Intl.DateTimeFormat.__setDefaultTimeZone(
    //    require("expo-localization").timezone
    //  );
  }
} // this line is only needed if you don't use an .android.js file
```

## Tips & Tricks

- Use 0.14+ version of React-Native-Web (Modal and better number input)
- Try to avoid putting the Picker Modals inside of a scrollView If that is not possible use the following props on the surrounding ScrollViews/Flatlists

```javascript
keyboardDismissMode = 'on-drag'
keyboardShouldPersistTaps = 'handled'
contentInsetAdjustmentBehavior = 'always'
```

This is to prevent the need to press 2 times before save or close button in modal works (1 press for closing keyboard, 1 press for confirm/close) [React Native Issue: #10138](https://github.com/facebook/react-native/issues/10138)
