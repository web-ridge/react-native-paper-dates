
<img align="left" width="56" height="56" src="https://user-images.githubusercontent.com/6492229/98982291-70b42480-251f-11eb-8d67-4b0b1b6e917b.png"> react-native-paper-dates
---
<br>
<p float="left">
<img src="https://badgen.net/bundlephobia/minzip/react-native-paper-dates" />
<img src="https://badgen.net/npm/dy/react-native-paper-dates" />
<img src="https://badgen.net/npm/types/react-native-paper-dates" />
<img src="https://badgen.net/npm/license/react-native-paper-dates" />
</p>
   
- Smooth and fast cross platform Material Design **date** picker and **time** picker for React Native Paper
- Tested on Android, iOS and the web platform!
- Uses the native Date.Intl API's which work out of the box on the web / iOS (automatic day name, month translations without bundle size increase)
- Simple API
- Typesafe
- Endless scrolling
- Performant
- Great React Native Web support


[![Demo of react-native-paper-dates](https://user-images.githubusercontent.com/6492229/98866767-bd3f2780-246d-11eb-890e-3491b47c95c5.gif)](https://www.youtube.com/watch?v=SHhQU2doTug)   
GIF above is sluggish, click on the image to view video in better frame rate. (https://www.youtube.com/watch?v=SHhQU2doTug)
## Getting started

Yarn
```
yarn add react-native-paper-dates
```

npm
```
npm install react-native-paper-dates --save
```

### Web
If you use react-native-web and want to use this library you'll need to install react-window.

Yarn
```
yarn add react-window
```

npm
```
npm install react-window --save
```

## Usage

### Date Picker

```tsx
import * as React from 'react'
import { Button } from 'react-native-paper'
import { DatePickerModal } from 'react-native-paper-dates'

function SingleDatePage() {
  const [visible, setVisible] = React.useState(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const onChange = React.useCallback(({ date }) => {
    setVisible(false)
    console.log({ date })
  }, [])

  const date = new Date()

  return (
    <>
      <DatePickerModal
        mode="single"
        visible={visible}
        onDismiss={onDismiss}
        date={date}
        onConfirm={onChange}
        saveLabel="Save" // optional
        label="Select date" // optional
        animationType="slide" // optional, default is 'slide' on ios/android and 'none' on web
        locale={'en'} // optional, default is automically detected by your system
      />
      <Button onPress={()=> setVisible(true)}>
        Pick date
      </Button>
    </>
  )
}
```

### Range picker
```tsx
import * as React from 'react'
import { Button } from 'react-native-paper'
import { DatePickerModal } from 'react-native-paper-dates'

export default function RangeDatePage() {
  const [visible, setVisible] = React.useState(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const onChange = React.useCallback(({ startDate, endDate }) => {
    setVisible(false)
    console.log({ startDate, endDate })
  }, [])


  return (
    <>
      <DatePickerModal
        mode="range"
        visible={visible}
        onDismiss={onDismiss}
        startDate={undefined}
        endDate={undefined}
        onConfirm={onChange}
        saveLabel="Save" // optional
        label="Select period" // optional
        startLabel="From" // optional
        endLabel="To" // optional
        animationType="slide" // optional, default is slide on ios/android and none on web
        locale={'en'} // optional, default is automically detected by your system
      />
      <Button onPress={()=> setVisible(true)}>
        Pick range
      </Button>
    </>
  )
}
```


### Time picker
```tsx
import * as React from 'react'
import { Button } from 'react-native-paper'
import { TimePickerModal } from 'react-native-paper-dates'

export default function TimePickerPage() {
  const [visible, setVisible] = React.useState(false)
  const onDismiss = React.useCallback(() => {
    setVisible(false)
  }, [setVisible])

  const onConfirm = React.useCallback(
    ({ hours, minutes }) => {
      setVisible(false);
      console.log({ hours, minutes });
    },
    [setVisible]
  );


  return (
    <>
      <TimePickerModal
        visible={visible}
        onDismiss={onDismiss}
        onConfirm={onConfirm}
        hours={12} // default: current hours
        minutes={14} // default: current minutes
        label="Select time" // optional, default 'Select time'
        cancelLabel="Cancel" // optional, default: 'Cancel'
        confirmLabel="Ok" // optional, default: 'Ok'
        animationType="fade" // optional, default is 'none'
        locale={'en'} // optional, default is automically detected by your system
      />
      <Button onPress={()=> setVisible(true)}>
        Pick time
      </Button>
    </>
  )
}
```






## Roadmap
Things on our roadmap have labels with `enhancement`.
https://github.com/web-ridge/react-native-paper-dates/issues

## Tips & Tricks
- Use 0.14+ version of React-Native-Web (Modal and better number input)
- Try to avoid putting the Picker Modals inside of a scrollView
If that is **not possible** use the following props on the surrounding ScrollViews/Flatlists

```javascript
    keyboardDismissMode="on-drag"
    keyboardShouldPersistTaps="handled"
    contentInsetAdjustmentBehavior="always"
```
This is to prevent the need to press 2 times before save works (1 press for closing keyboard, 1 press for confirm/close)
(https://github.com/facebook/react-native/issues/10138)

## Android Caveats

You will need to add a polyfill for the Intl API on Android if:

- You have Hermes enabled (https://github.com/facebook/hermes/issues/23)
- You have Hermes disabled and you want to support locales outside of en-US and you don't have the org.webkit:android-jsc-intl:+ variant enabled in your app/build.gradle

Install polyfills with Yarn

```
yarn add react-native-localize @formatjs/intl-pluralrules @formatjs/intl-getcanonicallocales @formatjs/intl-listformat @formatjs/intl-displaynames @formatjs/intl-locale @formatjs/intl-datetimeformat @formatjs/intl-numberformat @formatjs/intl-relativetimeformat
```

or npm

```
npm install react-native-localize @formatjs/intl-pluralrules @formatjs/intl-getcanonicallocales @formatjs/intl-listformat @formatjs/intl-displaynames @formatjs/intl-locale @formatjs/intl-datetimeformat @formatjs/intl-numberformat @formatjs/intl-relativetimeformat --save
```

`./index.js`

```javascript
// on top of your index.js file
const isAndroid = require('react-native').Platform.OS === 'android';
const isHermesEnabled = !!global.HermesInternal;

// in your index.js file
if (isHermesEnabled || isAndroid) {
  require('@formatjs/intl-getcanonicallocales/polyfill');

  require('@formatjs/intl-pluralrules/polyfill');
  require('@formatjs/intl-pluralrules/locale-data/nl.js'); // use your language files

  require('@formatjs/intl-relativetimeformat/polyfill');
  require('@formatjs/intl-relativetimeformat/locale-data/nl.js'); // use your language files

  require('@formatjs/intl-listformat/polyfill');
  require('@formatjs/intl-listformat/locale-data/nl.js'); // use your language files

  require('@formatjs/intl-displaynames/polyfill');
  require('@formatjs/intl-displaynames/locale-data/nl.js'); // use your language files

  require('@formatjs/intl-numberformat/polyfill');
  require('@formatjs/intl-numberformat/locale-data/nl.js'); // use your language files

  require('@formatjs/intl-datetimeformat/polyfill');
  require('@formatjs/intl-datetimeformat/locale-data/nl.js'); // use your language files

  require('@formatjs/intl-datetimeformat/add-golden-tz.js');

  require('@formatjs/intl-locale/polyfill');

  // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone
  let RNLocalize = require('react-native-localize');
  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    Intl.DateTimeFormat.__setDefaultTimeZone(RNLocalize.getTimeZone());
  }
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT


## About us
We want developers to be able to build software faster using modern tools like GraphQL, Golang, React Native.

Follow us on Twitter:
- https://twitter.com/RichardLindhout
- https://twitter.com/web_ridge

### You probably like these
- Simple translations in React (Native): https://github.com/web-ridge/react-ridge-translations
- Simple global state management in React (Native): https://github.com/web-ridge/react-ridge-state
- 1 command utility for React Native (Web) project: https://github.com/web-ridge/create-react-native-web-application
