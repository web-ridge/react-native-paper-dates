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
  am: 'AM',
  close: 'Close',
  dateIsDisabled: 'Day is not allowed',
  hour: 'Hour',
  minute: 'Minute',
  mustBeBetween: (startDate, endDate) =>
    `Must be between ${startDate} - ${endDate}`,
  mustBeHigherThan: (date) => `Must be later than ${date}`,
  mustBeLowerThan: (date) => `Must be earlier than ${date}`,
  next: 'Next',
  notAccordingToDateFormat: (inputFormat) =>
    `Date format must be ${inputFormat}`,
  pickDateFromCalendar: 'Pick date from calendar',
  pm: 'PM',
  previous: 'Previous',
  save: 'Save',
  selectMultiple: 'Select dates',
  selectRange: 'Select period',
  selectSingle: 'Select date',
  toggleKeyboard: 'Toggle keyboard',
  typeInDate: 'Type in date',
})
```

## Dynamic translation

Resolve strings through your own translation provider:

```javascript
import { translate } from 'YOUR_TRANSLATION_PROVIDER'
import { registerTranslation } from 'react-native-paper-dates'

registerTranslation('dynamic', () => {
  return {
    am: translate('AM'),
    close: translate('Close'),
    dateIsDisabled: translate('Day is not allowed'),
    hour: translate('Hour'),
    minute: translate('Minute'),
    mustBeBetween: (startDate, endDate) =>
      translate(`Must be between ${startDate} - ${endDate}`),
    mustBeHigherThan: (date) => translate(`Must be later than ${date}`),
    mustBeLowerThan: (date) => translate(`Must be earlier than ${date}`),
    next: translate('Next'),
    notAccordingToDateFormat: (inputFormat) =>
      translate(`Date format must be ${inputFormat}`),
    pickDateFromCalendar: translate('Pick date from calendar'),
    pm: translate('PM'),
    previous: translate('Previous'),
    save: translate('Save'),
    selectMultiple: translate('Select dates'),
    selectRange: translate('Select period'),
    selectSingle: translate('Select date'),
    toggleKeyboard: translate('Toggle keyboard'),
    typeInDate: translate('Type in date'),
  }
})
```

:::info Note

If a language is not supported, consider creating a pull request so that it can officially be supported.

:::
