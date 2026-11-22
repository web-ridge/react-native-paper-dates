import type { ComponentProps, CSSProperties } from 'react'
import type { TextInput } from 'react-native-paper'

import type { ValidRangeType } from './types'

export type DateFieldProps = {
  hasError?: boolean
  hideValidationErrors?: boolean
  inputEnabled?: boolean
  inputMode: 'start' | 'end'
  locale: string
  onChange: (date: Date | undefined) => void
  onChangeText?: (text: string | undefined) => void
  onValidationError?: (error: string | null) => void
  validRange?: ValidRangeType
  value: Date | undefined
  withDateFormatInLabel?: boolean
} & TextFieldProps

export type DatePickerInputProps = DateFieldProps &
  DatePickerPresentationProps & {
    iconColor?: string
    iconSize?: number
    iconStyle?: CSSProperties
  }

type DatePickerPresentationProps = {
  animationType?: 'slide' | 'fade' | 'none'
  calendarIcon?: string
  disableCalendarIcon?: boolean
  disableStatusBar?: boolean
  disableStatusBarPadding?: boolean
  endYear?: number
  presentation?: 'auto' | 'modal' | 'docked'
  presentationStyle?: 'pageSheet' | 'overFullScreen'
  saveLabel?: string
  saveLabelDisabled?: boolean
  startWeekOnMonday?: boolean
  startYear?: number
  uppercase?: boolean
  withModal?: boolean
}

type TextFieldProps = Omit<
  ComponentProps<typeof TextInput>,
  'value' | 'onChange' | 'onChangeText' | 'inputMode' | 'endAccessory'
>
