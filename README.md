## react-native-paper-dates

- Smooth and fast cross platform Material Design date picker for React Native Paper
- Tested on Android, iOS and the web platform!
- Uses the native Date.Intl API's which work out of the box on the web / iOS
- Simple API
- Typesafe
- Endless scrolling
- Performant

Older demo of this library.   
<img src="https://user-images.githubusercontent.com/6492229/90681177-4970f280-e263-11ea-8257-6810c5166f92.gif"/>

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
        saveLabel={'Save'} // optional
        label={'Select period'} // optional
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
          saveLabel={'Save'} // optional
          label={'Select period'} // optional
          startLabel={'From'} // optional
          endLabel={'To'} // optional
      />
      <Button onPress={()=> setVisible(true)}>
        Pick range
      </Button>
    </>
  )
}
```



## Roadmap
Things on our roadmap are labeled with enhancement.
https://github.com/web-ridge/react-native-paper-dates/issues

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

  require('@formatjs/intl-datetimeformat/add-all-tz.js');

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
