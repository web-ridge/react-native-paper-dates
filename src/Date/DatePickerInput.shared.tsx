import { ComponentProps, CSSProperties } from 'react'
import type { ValidRangeType } from './Calendar'
import type { TextInput } from 'react-native-paper'

export type DatePickerInputProps = {
  animationType?: 'slide' | 'fade' | 'none'
  calendarIcon?: string
  disableCalendarIcon?: boolean
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  endYear?: number
  hasError?: boolean
  hideValidationErrors?: boolean
  iconColor?: string
  iconSize?: number
  iconStyle?: CSSProperties
  inputEnabled?: boolean
  inputMode: 'start' | 'end'
  locale: string
  onChange: (date: Date | undefined) => void
  onChangeText?: (text: string | undefined) => void
  onValidationError?: ((error: string | null) => void) | undefined
  presentationStyle?: 'pageSheet' | 'overFullScreen'
  saveLabel?: string
  saveLabelDisabled?: boolean
  startWeekOnMonday?: boolean
  startYear?: number
  uppercase?: boolean
  validRange?: ValidRangeType | undefined
  value: Date | undefined
  withDateFormatInLabel?: boolean
  withModal?: boolean
} & Omit<
  ComponentProps<typeof TextInput>,
  'value' | 'onChange' | 'onChangeText' | 'inputMode' | 'endAccessory'
>
