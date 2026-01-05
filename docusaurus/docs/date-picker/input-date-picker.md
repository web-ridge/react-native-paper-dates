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
      <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        <DatePickerInput
          locale="en"
          label="Birthdate"
          value={inputDate}
          onChange={(d) => setInputDate(d)}
          inputMode="start"
        />
      </View>
    </SafeAreaProvider>
  )
}
```

## Live Example

View an interactive [Expo snack](https://snack.expo.dev/@fitzwabs/react-native-paper-dates-input).

## Props

**animationType**  
`Type: 'slide' | 'fade' | 'none' | undefined`  
The animation used when opening the date picker modal. Defaults to `'slide'`.

**disableCalendarIcon**  
`Type: boolean | undefined`  
Flag indicating if the calendar icon should be disabled. When set to `true`, the calendar icon will be disabled and users won't be able to click it to open the date picker modal. Defaults to `false`.

**disableStatusBarPadding**  
`Type: boolean | undefined`  
Flag indicating if the status bar padding should be enabled or not. Defaults to `false`.

**disableStatusBar**  
`Type: boolean | undefined`  
Flag indicating if the date picker modal should avoid manipulating the status bar. When set to `true`, the modal will not modify the status bar's appearance or translucency. Defaults to `false`.

**endYear**  
`Type: number | undefined`  
The end year when the component is rendered. Defaults to `2200`.

**hasError**  
`Type: boolean | undefined`  
Flag indicating if the the component should display error styles.

**hideValidationErrors**  
`Type: boolean | undefined`  
Flag indicating if the the component should hide error styles along with the `helperText` component displaying the error message.

**iconColor**  
`Type: String`  
Sets the color of the icon.

**iconSize**  
`Type: Number`  
Specifies the size of the icon in pixels.

**iconStyle**  
`Type: React.CSSProperties`  
Defines the CSS styles for the icon element.

**inputEnabled**  
`Type: boolean | undefined`  
Flag indicating if the component should be enabled or not. Behavior similarly to `disabled`. Defaults to `true`.

**inputMode (Required)**  
`Type: String`  
The type of input needed for the the picker component.

**label (Required)**  
`Type: String`  
The label used to display in the component.

**locale (Required)**  
`Type: String`  
A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de.

**mode**  
`Type: 'flat' | 'outlined'`  
See [react-native-paper text-input](https://callstack.github.io/react-native-paper/text-input.html#mode).

**onChange**  
`Type: Function`  
Callback event when the component date mask length matches the text input length.

**onChangeText**  
`Type: Function`  
Callback event when the component text input changes.

**onValidationError**  
`Type: Function | undefined`  
Callback used to return any error messages from the components validation.

**presentationStyle**
`Type: 'overFullScreen' | 'pageSheet' | 'formSheet' | undefined`
Determines the visual presentation style of the date picker modal on iOS. This prop allows you to define how the modal appears on the screen when it is displayed.

- `'overFullScreen'`: Overlays the modal on top of the content, allowing interaction with the underlying content. (Default)
- `'pageSheet'`: Displays the modal as a card-style sheet that covers a portion of the screen. On iPad, this is ~540pt wide.
- `'formSheet'`: Displays the modal as a centered form sheet. On iPad, this is ~540x620pt, which provides a better fit for the date picker content (recommended for iPad).

**Note for iPad users**: If you experience layout issues with `pageSheet` where the calendar appears too centered within the sheet, consider using `formSheet` instead for a better visual fit.

For example, if you set `presentationStyle` to `'formSheet'`, the modal will be presented as a centered form sheet, which works particularly well on iPad devices.

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

**value (Required)**  
`Type: Date | undefined`  
The value used to populate the component.

**withDateFormatInLabel**
`Type: boolean | undefined`  
Flag indicating if the date format should be inside the components label.

- Other [react-native TextInput props](https://reactnative.dev/docs/textinput#props).\*
