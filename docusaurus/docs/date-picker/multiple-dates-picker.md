---
sidebar_position: 3
---

# Multiple Dates Picker

The multiple dates picker provides a modal allowing for multiple dates selection.

## Usage

```jsx
import React from "react";
import { View, Text } from "react-native";
import { Button } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [dates, setDates] = React.useState();
  const [open, setOpen] = React.useState(false);

  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback((params) => {
    setOpen(false);
    setDates(params.dates);
    console.log('[on-change-multi]', params);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>
        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
          Pick multiple dates
        </Button>
        <DatePickerModal
          locale="en"
          mode="multiple"
          visible={open}
          onDismiss={onDismiss}
          dates={dates}
          onConfirm={onConfirm}
        />
      </View>
    </SafeAreaProvider>
  );
}
```

## Live Example

View an interactive [Expo snack](https://snack.expo.dev/@fitzwabs/react-native-paper-dates-multiple-picker).

## Props

**locale (Required)**  
`Type: String`  
A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de.

**mode (Required)**  
`Type: 'single' | 'multiple' | 'range'`  
The selection type for the date picker. For this example it is `"multiple"`.

**visible (Required)**  
`Type: boolean`  
Flag indicating if the component should be displayed.

**onDismiss (Required)**  
`Type: Function`  
The action to take when the component is closed.

**dates (Required)**  
`Type: Date[]`  
The date values used to populate the component.

**onConfirm (Required)**  
`Type: Function`  
The action to take when the date is selected.

**moreLabel**  
`Type: String | undefined`  
The label used display when multiple dates have been selected in the component. Defaults to `'More'`.

**validRange**  
`Type: {
  startDate: Date | undefined,
  endDate: Date | undefined,
  disabledDates: Date[] | undefined
}`  
Limits which dates the user can navigate to and where events can go. Dates outside of the valid range will be grayed-out.

**onChange**  
`Type: Function`  
Event handler when the component changes.

**saveLabel**  
`Type: String | undefined`  
The label used confirm a date selection. Defaults to `'Save'`.

**saveLabelDisabled**  
`Type: boolean | undefined`  
Flag indicating if the save label should be disabled and unable to receive events. Defaults to `false`.

**uppercase**  
`Type: boolean | undefined`  
Flag indicating if the text in the component should be uppercase. Defaults to `true`.

**label**  
`Type: String | undefined`  
The label used as the header in the component. Defaults to `'Select date'`.

**startLabel**  
`Type: String | undefined`  
The label used as the prefix to the starting date in the component. Defaults to `'From'`.

**endLabel**  
`Type: String | undefined`  
The label used as the suffix to the ending date in the component. Defaults to `'To'`.

**animationType**  
`Type: String | undefined`  
The animation used when opening the component. Defaults to `'slide'` on ios/android and `'none'` on web.

**startYear**  
`Type: number | undefined`  
The start year when the component is rendered. Defaults to `1800`.

**endYear**  
`Type: number | undefined`  
The end year when the component is rendered. Defaults to `2200`.

**closeIcon**  
`Type: string | undefined`  
The icon used to close the component. Defaults to `close`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**editIcon**  
`Type: string | undefined`  
The edit icon used to toggle between calendar and input. Defaults to `pencil`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**calendarIcon**  
`Type: string | undefined`  
The edit icon used to toggle between input and calendar. Defaults to `calendar`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).
