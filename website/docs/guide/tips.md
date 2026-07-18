# Tips

## Android

:::tip Tip

We recommend Hermes with React Native >= 0.66 — you won't need Intl polyfills at all!

:::

## React Native Web

Use React Native Web `0.14+` for better Modal support and number input behavior.

## Pickers inside ScrollViews

Try to avoid putting picker modals inside a `ScrollView`. If that is not possible, set these props on the surrounding `ScrollView` / `FlatList`:

```javascript
keyboardDismissMode = 'on-drag'
keyboardShouldPersistTaps = 'handled'
contentInsetAdjustmentBehavior = 'always'
```

This prevents needing to press twice before the save or close button works (one press closes the keyboard, one confirms/closes). See [React Native Issue #10138](https://github.com/facebook/react-native/issues/10138).
