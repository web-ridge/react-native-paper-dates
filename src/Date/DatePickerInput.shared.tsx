import type { ValidRangeType } from './Calendar'
import type * as React from 'react'
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
  iconSize?: number
  iconStyle?: React.CSSProperties
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
  React.ComponentProps<typeof TextInput>,
  'value' | 'onChange' | 'onChangeText' | 'inputMode'
>
