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
      <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
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
  )
}
```

## Live Example

View an interactive [Expo snack](https://snack.expo.dev/@fitzwabs/react-native-paper-dates-multiple-picker).

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

**dates (Required)**  
`Type: Date[]`  
The date values used to populate the component.

**disableStatusBarPadding**  
`Type: boolean | undefined`  
Flag indicating if the status bar padding should be enabled or not. Defaults to `false`.

**disableStatusBar**  
`Type: boolean | undefined`  
Flag indicating if the date picker modal should avoid manipulating the status bar. When set to `true`, the modal will not modify the status bar's appearance or translucency. Defaults to `false`.

**editIcon**  
`Type: string | undefined`  
The edit icon used to toggle between calendar and input. Defaults to `pencil`. You can pass the name of an icon from [MaterialCommunityIcons](https://materialdesignicons.com/).

**endLabel**  
`Type: String | undefined`  
The label used as the suffix to the ending date in the component. Defaults to `'To'`.

**endYear**  
`Type: number | undefined`  
The end year when the component is rendered. Defaults to `2200`.

**label**  
`Type: String | undefined`  
The label used as the header in the component. Defaults to `'Select date'`.

**locale (Required)**  
`Type: String`  
A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de.

**mode (Required)**  
`Type: 'single' | 'multiple' | 'range'`  
The selection type for the date picker. For this example it is `"multiple"`.

**moreLabel**  
`Type: String | undefined`  
The label used display when multiple dates have been selected in the component. Defaults to `'More'`.

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

**startLabel**  
`Type: String | undefined`  
The label used as the prefix to the starting date in the component. Defaults to `'From'`.

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
`Type: 'overFullScreen' | 'pageSheet' | 'formSheet' | undefined`
Determines the visual presentation style of the date picker modal on iOS. This prop allows you to define how the modal appears on the screen when it is displayed.

- `'overFullScreen'`: Overlays the modal on top of the content, allowing interaction with the underlying content. (Default)
- `'pageSheet'`: Displays the modal as a card-style sheet. **On iPad (width and height > 650pt), automatically uses `formSheet` for better fit.**
- `'formSheet'`: Displays the modal as a centered form sheet. On iPad, this is ~540x620pt, providing optimal fit for the date picker content.

**Smart Detection**: When using `pageSheet` or `formSheet` on iOS devices with both width and height > 650pt (iPad in any orientation), the library automatically uses `formSheet` presentation to avoid excessive whitespace around the calendar. On smaller iOS devices (iPhone), it uses `pageSheet` as specified.

For example, if you set `presentationStyle` to `'pageSheet'` on iPad, the modal will automatically use `formSheet` for a better visual fit.
