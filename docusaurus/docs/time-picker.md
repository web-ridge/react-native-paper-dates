---
sidebar_position: 1
---

# Time Picker

The time picker provides a modal allowing the selection or input of a time.

## Usage

```jsx
import React from "react";
import { View, Text } from "react-native";
import { Button } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
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
    <SafeAreaProvider>
      <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
        <Button onPress={() => setVisible(true)} uppercase={false} mode="outlined">
          Pick time
        </Button>
        <TimePickerModal
          visible={visible}
          onDismiss={onDismiss}
          onConfirm={onConfirm}
          hours={12}
          minutes={14}
        />
      </View>
    </SafeAreaProvider>
  );
}
```

## Live Example

View an interactive [Expo snack](https://snack.expo.dev/@fitzwabs/react-native-paper-dates-time-picker).

## Props

**locale (Required)**  
`Type: String`  
A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de.

**visible (Required)**  
`Type: boolean`  
Flag indicating if the component should be displayed.

**onDismiss (Required)**  
`Type: Function`  
The action to take when the component is closed.

**onConfirm (Required)**  
`Type: Function`  
The action to take when the date is selected.

**hours**  
`Type: number | undefined`  
The hours values used to populate the component. Defaults to the current hour.

**minutes**  
`Type: number | undefined`  
The minutes values used to populate the component. Defaults to the current minutes.

**label**  
`Type: String | undefined`  
The label used as the header in the component. Defaults to `'Select time'`.

**uppercase**  
`Type: boolean | undefined`  
Flag indicating if the text in the component should be uppercase. Defaults to `true`.

**cancelLabel**  
`Type: String | undefined`  
The label that will close the component. Defaults to `'Cancel'`.

**confirmLabel**  
`Type: String | undefined`  
The label that will confirm the component selection. Defaults to `'Ok'`.

**animationType**  
`Type: String | undefined`  
The animation used when opening the component. Defaults to `'slide'` on ios/android and `'none'` on web.

**keyboardIcon**  
`Type: string | undefined`  
The icon used to toggle between the OS input. Defaults to `keyboard-outline`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**clockIcon**  
`Type: string | undefined`  
The icon used to toggle between time picker and input. Defaults to `clock-outline`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**use24HourClock**
`Type: boolean | undefined`
Flag indicating if the time input should use the 24 hours clock. Defaults to the system clock.

**inputFontSize**
`Type: number | undefined`
Font size of the time input. Defaults to 57. Useful when using a custom font.
