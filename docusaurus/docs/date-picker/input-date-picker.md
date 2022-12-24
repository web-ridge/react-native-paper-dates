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
Event handler when the component changes.

**inputMode (Required)**  
`Type: String`  
The type of input needed for the the picker component.

**mode**  
`Type: 'flat' | 'outlined'`  
See [react-native-paper text-input](https://callstack.github.io/react-native-paper/text-input.html#mode).

* Other [react-native TextInput props](https://reactnative.dev/docs/textinput#props).*
