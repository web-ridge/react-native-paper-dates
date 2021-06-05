import './App'

// @ts-ignore
const isHermesEnabled = !!global.HermesInternal

// in your index.js file
if (isHermesEnabled) {
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
  let RNLocalize = require('react-native-localize')
  if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
    // @ts-ignore
    Intl.DateTimeFormat.__setDefaultTimeZone(RNLocalize.getTimeZone())
  }
}
