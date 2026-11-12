import { StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import type { ModeType } from './Calendar'
import type { LocalState } from './DatePickerModalContent'
import { useHeaderTextColor } from '../shared/utils'
import Color from 'color'
import { getTranslation } from '../translations/utils'
import { useMemo } from 'react'
import { sharedStyles } from '../shared/styles'
import type { DisableWeekDaysType } from './dateUtils'
import {
  alignTextToFirstWeekday,
  centerIconOnLastWeekday,
} from './weekdayColumns'

export interface HeaderPickProps {
  allowEditing?: boolean
  calendarIcon?: string
  closeIcon?: string
  editIcon?: string
  emptyLabel?: string
  endLabel?: string
  headerSeparator?: string
  label?: string
  moreLabel?: string
  placeholder?: string
  saveLabel?: string
  startLabel?: string
  uppercase?: boolean
  withDateFormatInLabel?: boolean
}

export interface HeaderContentProps extends HeaderPickProps {
  collapsed: boolean
  disableWeekDays?: DisableWeekDaysType
  locale: string | undefined
  mode: ModeType
  onToggle: () => any
  state: LocalState
}

function getLabel(
  locale: string | undefined,
  mode: ModeType,
  configuredLabel?: string
) {
  if (configuredLabel) {
    return configuredLabel
  }
  if (mode === 'range') {
    return getTranslation(locale, 'selectRange')
  }
  if (mode === 'multiple') {
    return getTranslation(locale, 'selectMultiple')
  }
  if (mode === 'single') {
    return getTranslation(locale, 'selectSingle')
  }
  return '...?'
}

export default function DatePickerModalContentHeader(
  props: HeaderContentProps
) {
  const {
    allowEditing,
    calendarIcon,
    collapsed,
    disableWeekDays,
    editIcon,
    mode,
    moreLabel,
    onToggle,
    uppercase,
  } = props
  const theme = useTheme()
  const label = getLabel(props.locale, props.mode, props.label)
  const color = useHeaderTextColor()
  const isEditingEnabled = allowEditing && mode !== 'multiple'
  const supportingTextColor = theme.colors.onSurfaceVariant
  const textFont = theme.fonts.labelMedium
  const finalCollapsedIcon = editIcon ?? 'pencil-outline'
  const finalExpandedIcon = calendarIcon ?? 'calendar-blank'

  return (
    <View style={styles.header}>
      <View style={alignTextToFirstWeekday(disableWeekDays)}>
        <Text
          maxFontSizeMultiplier={1.5}
          style={[styles.label, { color: supportingTextColor, ...textFont }]}
        >
          {uppercase ? label.toUpperCase() : label}
        </Text>
        <View style={styles.headerContentContainer}>
          {mode === 'range' ? (
            <HeaderContentRange {...props} color={color} />
          ) : null}
          {mode === 'single' ? (
            <HeaderContentSingle {...props} color={color} />
          ) : null}
          {mode === 'multiple' ? (
            <HeaderContentMulti
              {...props}
              color={color}
              moreLabel={moreLabel}
            />
          ) : null}
        </View>
      </View>
      <View style={sharedStyles.root} />
      {isEditingEnabled ? (
        <IconButton
          accessibilityLabel={
            collapsed
              ? getTranslation(props.locale, 'typeInDate')
              : getTranslation(props.locale, 'pickDateFromCalendar')
          }
          icon={collapsed ? finalCollapsedIcon : finalExpandedIcon}
          iconColor={theme.colors.onSurface}
          onPress={onToggle}
          style={[styles.editButton, centerIconOnLastWeekday(disableWeekDays)]}
          testID="react-native-paper-dates-toggle-edit"
        />
      ) : null}
    </View>
  )
}

export function HeaderContentSingle({
  color,
  emptyLabel = ' ',
  locale,
  state,
}: HeaderContentProps & { color: string }) {
  const theme = useTheme()

  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = state.date ? theme.colors.onSurface : lighterColor

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[styles.text, { color: dateColor }]}
    >
      {state.date ? formatter.format(state.date) : emptyLabel}
    </Text>
  )
}

export function HeaderContentMulti({
  color,
  emptyLabel = ' ',
  locale,
  moreLabel = 'more',
  state,
}: HeaderContentProps & { color: string; moreLabel: string | undefined }) {
  const theme = useTheme()

  const dateCount = state.dates?.length || 0
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = dateCount ? theme.colors.onSurface : lighterColor

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  let label = emptyLabel
  if (dateCount) {
    if (dateCount <= 2) {
      label = state.dates!.map((date) => formatter.format(date)).join(', ')
    } else {
      label =
        formatter.format(state.dates![0]) + ` (+ ${dateCount - 1} ${moreLabel})`
    }
  }

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[styles.text, { color: dateColor }]}
    >
      {label}
    </Text>
  )
}

export function HeaderContentRange({
  color,
  endLabel = 'End',
  headerSeparator = '-',
  locale,
  startLabel = 'Start',
  state,
}: HeaderContentProps & { color: string }) {
  const theme = useTheme()

  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const startColorFilled = theme.colors.onSurface
  const endColorFilled = theme.colors.onSurface
  const startColor = state.startDate ? startColorFilled : lighterColor
  const endColor = state.endDate ? endColorFilled : lighterColor

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  return (
    <>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.text, { color: startColor }]}
      >
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.headerSeparator, { color }]}
      >
        {headerSeparator}
      </Text>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.text, { color: endColor }]}
      >
        {state.endDate ? formatter.format(state.endDate) : endLabel}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  editButton: {
    marginBottom: 0,
    marginStart: 0,
    marginTop: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 75,
  },
  headerContentContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  headerSeparator: {
    color: 'rgba(255,255,255,1)',
    fontSize: 25,
    paddingLeft: 6,
    paddingRight: 6,
  },
  label: {
    color: '#fff',
    fontSize: 13,
    letterSpacing: 1,
  },
  text: {
    color: '#fff',
    fontSize: 25,
  },
})
