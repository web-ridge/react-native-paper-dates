import { ComponentProps, CSSProperties } from 'react'
import type { ValidRangeType } from './Calendar'
import type { TextInput } from 'react-native-paper'

export type DatePickerInputProps = {
  inputMode: 'start' | 'end'
  locale: string
  onChange: (date: Date | undefined) => void
  value: Date | undefined
  validRange?: ValidRangeType | undefined
  withModal?: boolean
  withDateFormatInLabel?: boolean
  hideValidationErrors?: boolean
  hasError?: boolean
  onValidationError?: ((error: string | null) => void) | undefined
  calendarIcon?: string
  disableCalendarIcon?: boolean
  iconSize?: number
  iconStyle?: CSSProperties
  iconColor?: string
  saveLabel?: string
  saveLabelDisabled?: boolean
  uppercase?: boolean
  startYear?: number
  endYear?: number
  onChangeText?: (text: string | undefined) => void
  inputEnabled?: boolean
  disableStatusBarPadding?: boolean
  animationType?: 'slide' | 'fade' | 'none'
  presentationStyle?: 'pageSheet' | 'overFullScreen'
  startWeekOnMonday?: boolean
} & Omit<
  ComponentProps<typeof TextInput>,
  'value' | 'onChange' | 'onChangeText' | 'inputMode'
>
