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

[![Demo of react-native-paper-dates](https://github.com/web-ridge/react-native-paper-dates/assets/7604441/c1ae6c92-94a6-43f8-90b0-8f21c20fd4e9)](https://www.youtube.com/watch?v=SHhQU2doTug)

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

React-Native-Paper-Dates currently supports `ar/ca/de/en/en-GB/es/fi/fr/he/hi/it/ko/nl/pl/pt/tr/zh/zh-TW/cs/el/ru/ro/id/ja/th/uk-UA/no-NO/sv` translations. Ideally you would do this somewhere before react-native-paper-dates is used. For example, you might add the follow to your `index.js` or `app.js`.

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
  mustBeHigherThan: (date) => `Must be later than ${date}`,
  mustBeLowerThan: (date) => `Must be earlier than ${date}`,
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

### Dynamic

React-Native-Paper-Dates also provides the ability to register dynamically resolved translations. This allows you to use a different translation provider to resolve the translations. For example:

```javascript
import { translate } from 'YOUR_TRANSLATION_PROVIDER'
import { registerTranslation } from 'react-native-paper-dates'
registerTranslation('dynamic', () => {
  return {
    save: translate('Save'),
    selectSingle: translate('Select date'),
    selectMultiple: translate('Select dates'),
    selectRange: translate('Select period'),
    notAccordingToDateFormat: (inputFormat) =>
      translate(`Date format must be ${inputFormat}`),
    mustBeHigherThan: (date) => translate(`Must be later than ${date}`),
    mustBeLowerThan: (date) => translate(`Must be earlier than ${date}`),
    mustBeBetween: (startDate, endDate) =>
      translate(`Must be between ${startDate} - ${endDate}`),
    dateIsDisabled: translate('Day is not allowed'),
    previous: translate('Previous'),
    next: translate('Next'),
    typeInDate: translate('Type in date'),
    pickDateFromCalendar: translate('Pick date from calendar'),
    close: translate('Close'),
  }
})
```

:::info Note

If a language is not supported, consider creating a pull request so that it can officially be supported.

:::

## Android Caveats

:::tip Tip

We recommend Hermes with React Native >= 0.66 you won't need these polyfills at all!

:::

## Tips & Tricks

- Use 0.14+ version of React-Native-Web (Modal and better number input)
- Try to avoid putting the Picker Modals inside of a scrollView If that is not possible use the following props on the surrounding ScrollViews/Flatlists

```javascript
keyboardDismissMode = 'on-drag'
keyboardShouldPersistTaps = 'handled'
contentInsetAdjustmentBehavior = 'always'
```

This is to prevent the need to press 2 times before save or close button in modal works (1 press for closing keyboard, 1 press for confirm/close) [React Native Issue: #10138](https://github.com/facebook/react-native/issues/10138)
