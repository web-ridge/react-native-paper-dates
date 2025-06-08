---
sidebar_position: 1
---

# Single Date Picker

The single date picker provides a modal allowing only a single date selection.

## Usage

```jsx
import React from "react";
import { View, Text } from "react-native";
import { Button } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [date, setDate] = React.useState(undefined);
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );

  return (
    <SafeAreaProvider>
      <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
          Pick single date
        </Button>
        <DatePickerModal
          locale="en"
          mode="single"
          visible={open}
          onDismiss={onDismissSingle}
          date={date}
          onConfirm={onConfirmSingle}
        />
      </View>
    </SafeAreaProvider>
  )
}
```

## Live Example

View an interactive [Expo snack](https://snack.expo.dev/@fitzwabs/react-native-paper-dates-single-picker).

## Props

**animationType**  
`Type: String | undefined`  
The animation used when opening the component. Defaults to `'slide'` on ios/android and `'none'` on web.

**calendarIcon**  
`Type: string | undefined`  
The edit icon used to toggle between input and calendar. Defaults to `calendar`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**closeIcon**  
`Type: string | undefined`  
The icon used to close the component. Defaults to `close`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**date (Required)**  
`Type: Date`  
The date value used to populate the component.

**disableStatusBarPadding**  
`Type: boolean | undefined`  
Flag indicating if the status bar padding should be enabled or not. Defaults to `false`.

**editIcon**  
`Type: string | undefined`  
The edit icon used to toggle between calendar and input. Defaults to `pencil`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**endYear**  
`Type: number | undefined`  
The end year when the component is rendered. Defaults to `2200`.

**inputEnabled**  
`Type: boolean | undefined`  
Flag indicating if the component should be enabled or not. Defaults to `true`.

**label**  
`Type: String | undefined`  
The label used as the header in the component. Defaults to `'Select date'`.

**locale (Required)**  
`Type: String`  
A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de.

**mode (Required)**  
`Type: 'single' | 'multiple' | 'range'`  
The selection type for the date picker. For this example it is `"single"`.

**onChange**  
`Type: Function`  
Event handler when the component changes.

**onConfirm (Required)**  
`Type: Function`  
The action to take when the date is selected.

**onDismiss (Required)**  
`Type: Function`  
The action to take when the component is closed.

**saveLabel**  
`Type: String | undefined`  
The label used confirm a date selection. Defaults to `'Save'`.

**saveLabelDisabled**  
`Type: boolean | undefined`  
Flag indicating if the save label should be disabled and unable to receive events. Defaults to `false`.

**startWeekOnMonday**  
`Type: boolean | undefined`  
Flag indicating if calendar grid sould show monday as the first column. Defaults to `false`.

**startYear**  
`Type: number | undefined`  
The start year when the component is rendered. Defaults to `1800`.

**uppercase**  
`Type: boolean | undefined`  
Flag indicating if the text in the component should be uppercase. Defaults to `true`.

**validRange**  
`Type: {
  startDate: Date | undefined,
  endDate: Date | undefined,
  disabledDates: Date[] | undefined
}`  
Limits which dates the user can navigate to and where events can go. Dates outside of the valid range will be grayed-out.

**visible (Required)**  
`Type: boolean`  
Flag indicating if the component should be displayed.

**presentationStyle**
`Type: `'overFullScreen' | 'pageSheet' | undefined`
Determines the visual presentation style of the date picker modal. This prop allows you to define how the modal appears on the screen when it is displayed.

- `'overFullScreen'`: Overlays the modal on top of the content, allowing interaction with the underlying content.
- `'pageSheet'`: Displays the modal as a card-style sheet that covers a portion of the screen.

For example, if you set `presentationStyle` to `'pageSheet'`, the modal will be presented as a card-like sheet.
