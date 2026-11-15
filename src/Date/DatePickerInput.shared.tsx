import type { ComponentProps, CSSProperties } from 'react'
import type { TextInput } from 'react-native-paper'

import type { ValidRangeType } from './types'

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
  onValidationError?: (error: string | null) => void
  presentation?: 'auto' | 'modal' | 'docked'
  presentationStyle?: 'pageSheet' | 'overFullScreen'
  saveLabel?: string
  saveLabelDisabled?: boolean
  startWeekOnMonday?: boolean
  startYear?: number
  uppercase?: boolean
  validRange?: ValidRangeType
  value: Date | undefined
  withDateFormatInLabel?: boolean
  withModal?: boolean
} & Omit<
  ComponentProps<typeof TextInput>,
  'value' | 'onChange' | 'onChangeText' | 'inputMode' | 'endAccessory'
>
