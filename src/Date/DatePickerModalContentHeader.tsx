import { StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'
import type { DisableWeekDaysType, ModeType } from './types'
import type { LocalState } from './DatePickerModalContent'
import { displayCase, fadeColor, useHeaderTextColor } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import { useMemo } from 'react'
import { sharedStyles } from '../shared/styles'
import {
  alignTextToFirstWeekday,
  centerIconOnLastWeekday,
} from './weekdayColumns'

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
  const color = useHeaderTextColor()
  const finalCollapsedIcon = editIcon ?? 'pencil-outline'
  const finalExpandedIcon = calendarIcon ?? 'calendar-blank'
  const isEditingEnabled = allowEditing && mode !== 'multiple'
  const label = getLabel(props.locale, props.mode, props.label)
  const theme = useTheme()
  const supportingTextColor = theme.colors.onSurfaceVariant
  const textFont = theme.fonts.labelMedium

  return (
    <View style={styles.header}>
      <View style={alignTextToFirstWeekday(disableWeekDays)}>
        <Text
          maxFontSizeMultiplier={1.5}
          style={[styles.label, { color: supportingTextColor, ...textFont }]}
        >
          {displayCase(label, !!uppercase)}
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

export function HeaderContentMulti({
  color,
  emptyLabel = ' ',
  locale,
  moreLabel = 'more',
  state,
}: HeaderContentProps & { color: string; moreLabel: string | undefined }) {
  const dateCount = state.dates?.length || 0
  const { colorFor, formatter } = useShortDateLabel(color, locale)
  let label = emptyLabel

  if (dateCount) {
    if (dateCount <= 2) {
      label = state.dates!.map((date) => formatter.format(date)).join(', ')
    } else {
      label =
        formatter.format(state.dates![0]) + ` (+ ${dateCount - 1} ${moreLabel})`
    }
  }

  const dateColor = colorFor(dateCount > 0)

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
  const { colorFor, formatter } = useShortDateLabel(color, locale)
  const endColor = colorFor(!!state.endDate)
  const startColor = colorFor(!!state.startDate)

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

export function HeaderContentSingle({
  color,
  emptyLabel = ' ',
  locale,
  state,
}: HeaderContentProps & { color: string }) {
  const { colorFor, formatter } = useShortDateLabel(color, locale)
  const dateColor = colorFor(!!state.date)

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[styles.text, { color: dateColor }]}
    >
      {state.date ? formatter.format(state.date) : emptyLabel}
    </Text>
  )
}

function useShortDateLabel(color: string, locale: string | undefined) {
  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    })
  }, [locale])
  const theme = useTheme()
  const emptyColor = fadeColor(color, 0.5)
  const filledColor = theme.colors.onSurface

  return {
    colorFor: (filled: boolean) => (filled ? filledColor : emptyColor),
    formatter,
  }
}

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
  onToggle: () => void
  state: LocalState
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
