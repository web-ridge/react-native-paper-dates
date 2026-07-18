# Localization

Register translations somewhere before react-native-paper-dates is used — for example in your `index.ts` or `app.ts`.

## Supported locales

React Native Paper Dates currently supports:

| Locale | Language | Locale | Language | Locale | Language |
| --- | --- | --- | --- | --- | --- |
| `ar` | Arabic | `ca` | Catalan | `cs` | Czech |
| `da` | Danish | `de` | German | `el` | Greek |
| `en` | English | `en-GB` | English (UK) | `es` | Spanish |
| `fi` | Finnish | `fr` | French | `he` | Hebrew |
| `hi` | Hindi | `id` | Indonesian | `it` | Italian |
| `ja` | Japanese | `ko` | Korean | `nl` | Dutch |
| `no-NO` | Norwegian | `pl` | Polish | `pt` | Portuguese |
| `ro` | Romanian | `ru` | Russian | `sv` | Swedish |
| `th` | Thai | `tr` | Turkish | `uk-UA` | Ukrainian |
| `zh` | Chinese (Simplified) | `zh-TW` | Chinese (Traditional) | | |

```javascript
import { enGB, registerTranslation } from 'react-native-paper-dates'

registerTranslation('en-GB', enGB)
```

## Custom translation

You can register your own translation object:

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

## Dynamic translation

Resolve strings through your own translation provider:

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
