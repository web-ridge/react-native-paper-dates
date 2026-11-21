# Localization

English is registered automatically. Import any other built-in locale before the picker renders. Each module registers itself.

## Supported locales

React Native Paper Dates currently supports:

| Locale | Import | Locale | Import | Locale | Import |
| --- | --- | --- | --- | --- | --- |
| `ar` | `translations/ar` | `ca` | `translations/ca` | `cs` | `translations/cs` |
| `da` | `translations/da` | `de` | `translations/de` | `el` | `translations/el` |
| `en` | built in | `en-GB` | `translations/enGB` | `es` | `translations/es` |
| `fi` | `translations/fi` | `fr` | `translations/fr` | `he` | `translations/he` |
| `hi` | `translations/hi` | `id` | `translations/id` | `it` | `translations/it` |
| `ja` | `translations/ja` | `ko` | `translations/ko` | `nl` | `translations/nl` |
| `no-NO` | `translations/noNO` | `pl` | `translations/pl` | `pt` | `translations/pt` |
| `ro` | `translations/ro` | `ru` | `translations/ru` | `sv` | `translations/sv` |
| `th` | `translations/th` | `tr` | `translations/tr` | `uk-UA` | `translations/ukUA` |
| `zh` | `translations/zh` | `zh-TW` | `translations/zhTW` | | |

```javascript
import 'react-native-paper-dates/translations/enGB'
```

## Custom translation

Register your own translation object. Every key is required.

```javascript
import { registerTranslation } from 'react-native-paper-dates'

registerTranslation('pl', {
  am: 'AM',
  cancel: 'Cancel',
  close: 'Close',
  confirm: 'OK',
  dateIsDisabled: 'Day is not allowed',
  endDate: 'End date',
  enterDate: 'Enter date',
  enterDates: 'Enter dates',
  hour: 'Hour',
  hourOf: (hour, total) => `Hour ${hour} of ${total}`,
  invalidTime: 'Invalid time',
  minute: 'Minute',
  minuteOf: (minute, total) => `Minute ${minute} of ${total}`,
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
  startDate: 'Start date',
  toggleClock: 'Toggle dial picker',
  toggleKeyboard: 'Toggle input picker',
  toggleScroll: 'Toggle scroll picker',
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
    cancel: translate('Cancel'),
    close: translate('Close'),
    confirm: translate('OK'),
    dateIsDisabled: translate('Day is not allowed'),
    endDate: translate('End date'),
    enterDate: translate('Enter date'),
    enterDates: translate('Enter dates'),
    hour: translate('Hour'),
    hourOf: (hour, total) => translate(`Hour ${hour} of ${total}`),
    invalidTime: translate('Invalid time'),
    minute: translate('Minute'),
    minuteOf: (minute, total) => translate(`Minute ${minute} of ${total}`),
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
    startDate: translate('Start date'),
    toggleClock: translate('Toggle dial picker'),
    toggleKeyboard: translate('Toggle input picker'),
    toggleScroll: translate('Toggle scroll picker'),
    typeInDate: translate('Type in date'),
  }
})
```

:::info Note

If a language is not supported, consider creating a pull request so that it can officially be supported.

:::
