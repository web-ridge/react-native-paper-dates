---
sidebar_position: 3
---

# Input Date Picker

The input date picker provides a text field allowing for a date to be input or the date picker to be opened and selected.

## Usage

```jsx
import React from "react";
import { View, Text } from "react-native";
import { DatePickerInput } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [inputDate, setInputDate] = React.useState(undefined)

  return (
    <SafeAreaProvider>
      <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
        <DatePickerInput
          locale="en"
          label="Birthdate"
          value={inputDate}
          onChange={(d) => setInputDate(d)}
          inputMode="start"
        />
      </View>
    </SafeAreaProvider>
  );
}
```

## Live Example

View an interactive [Expo snack](https://snack.expo.dev/@fitzwabs/react-native-paper-dates-input).

## Props

**locale (Required)**  
`Type: String`  
A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de.

**label (Required)**  
`Type: String`  
The label used to display in the component.

**value (Required)**  
`Type: Date | undefined`  
The value used to populate the component.

**onChange**  
`Type: Function`  
Callback event when the component date mask length matches the text input length.

**onChangeText**  
`Type: Function`  
Callback event when the component text input changes.

**inputMode (Required)**  
`Type: String`  
The type of input needed for the the picker component.

**mode**  
`Type: 'flat' | 'outlined'`  
See [react-native-paper text-input](https://callstack.github.io/react-native-paper/text-input.html#mode).

**withDateFormatInLabel**
`Type: boolean | undefined`  
Flag indicating if the date format should be inside the components label.

**hasError**  
`Type: boolean | undefined`  
Flag indicating if the the component should display error styles.

**hideValidationErrors**  
`Type: boolean | undefined`  
Flag indicating if the the component should hide error styles along with the `helperText` component displaying the error message.

**onValidationError**  
`Type: Function | undefined`  
Callback used to return any error messages from the components validation.

**saveLabelDisabled**  
`Type: boolean | undefined`  
Flag indicating if the save label should be disabled and unable to receive events. Defaults to `false`.

**uppercase**  
`Type: boolean | undefined`  
Flag indicating if the text in the component should be uppercase. Defaults to `true`.

**startYear**  
`Type: number | undefined`  
The start year when the component is rendered. Defaults to `1800`.

**endYear**  
`Type: number | undefined`  
The end year when the component is rendered. Defaults to `2200`.

**inputEnabled**  
`Type: boolean | undefined`  
Flag indicating if the component should be enabled or not. Behavior similarly to `disabled`. Defaults to `true`.

* Other [react-native TextInput props](https://reactnative.dev/docs/textinput#props).*
