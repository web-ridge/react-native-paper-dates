import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, Text, useTheme } from 'react-native-paper'

import { dateTimeFormat } from '../shared/intl'
import { displayCase, themeColor, useIsLargeScreen } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import type { LocalState } from './DatePickerModalContent'
import type { DisableWeekDaysType, ModeType } from './types'

interface HeaderContentProps extends HeaderPickProps {
  collapsed: boolean
  disableWeekDays?: DisableWeekDaysType
  layout?: 'card'
  locale: string | undefined
  mode: ModeType
  onToggle: () => void
  state: LocalState
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

const selectionLabel = {
  multiple: 'selectMultiple',
  range: 'selectRange',
  single: 'selectSingle',
} as const

function getLabel(
  locale: string | undefined,
  mode: ModeType,
  configuredLabel?: string
) {
  if (configuredLabel) {
    return configuredLabel
  }
  const key = selectionLabel[mode]
  if (!key) {
    return ''
  }
  return getTranslation(locale, key)
}

function useShortDateLabel(locale: string | undefined, withWeekday = false) {
  const formatter = useMemo(
    () =>
      dateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        ...(withWeekday ? { weekday: 'short' as const } : {}),
      }),
    [locale, withWeekday]
  )

  return { formatter }
}

export default function DatePickerModalContentHeader(
  props: HeaderContentProps
) {
  const isLargeScreen = useIsLargeScreen()
  const theme = useTheme()

  const {
    allowEditing,
    calendarIcon,
    collapsed,
    editIcon,
    mode,
    moreLabel,
    onToggle,
    uppercase,
  } = props

  const finalCollapsedIcon = editIcon ?? 'pencil-outline'
  const finalExpandedIcon = calendarIcon ?? 'calendar-blank'
  const headlineColor = themeColor(theme.colors.onSurfaceVariant)
  const isEditingEnabled = allowEditing && mode !== 'multiple'
  const isRange = mode === 'range'
  const compactRange = isRange && !isLargeScreen && props.layout !== 'card'
  const label = getLabel(props.locale, props.mode, props.label)
  const supportingTextColor = theme.colors.onSurfaceVariant
  const textFont = theme.fonts.labelLarge

  return (
    <View style={[styles.header, compactRange && styles.compactRangeHeader]}>
      <View style={styles.supporting}>
        <Text
          maxFontSizeMultiplier={1.5}
          style={[
            textFont,
            styles.supportingText,
            { color: supportingTextColor },
          ]}
        >
          {displayCase(label, !!uppercase)}
        </Text>
      </View>
      <View style={styles.headlineRow}>
        <View
          style={[
            styles.headerContentContainer,
            compactRange && styles.rangeHeaderContent,
            compactRange &&
              isEditingEnabled &&
              styles.rangeHeaderContentWithToggle,
          ]}
        >
          {mode === 'range' ? (
            <HeaderContentRange {...props} color={headlineColor} />
          ) : null}
          {mode === 'single' ? (
            <HeaderContentSingle {...props} color={headlineColor} />
          ) : null}
          {mode === 'multiple' ? (
            <HeaderContentMulti
              {...props}
              color={headlineColor}
              moreLabel={moreLabel}
            />
          ) : null}
        </View>
        {isEditingEnabled ? (
          <IconButton
            accessibilityLabel={
              collapsed
                ? getTranslation(props.locale, 'typeInDate')
                : getTranslation(props.locale, 'pickDateFromCalendar')
            }
            icon={collapsed ? finalCollapsedIcon : finalExpandedIcon}
            iconColor={theme.colors.onSurfaceVariant}
            onPress={onToggle}
            size={24}
            style={[styles.editButton, compactRange && styles.rangeEditButton]}
            testID="react-native-paper-dates-toggle-edit"
          />
        ) : null}
      </View>
    </View>
  )
}

function HeaderContentMulti({
  color,
  emptyLabel = ' ',
  locale,
  moreLabel = 'more',
  state,
}: HeaderContentProps & { color: string; moreLabel: string | undefined }) {
  const { formatter } = useShortDateLabel(locale)

  const dateCount = state.dates?.length || 0
  let label = emptyLabel

  if (dateCount) {
    if (dateCount <= 2) {
      label = state.dates!.map((date) => formatter.format(date)).join(', ')
    } else {
      label =
        formatter.format(state.dates![0]) + ` (+ ${dateCount - 1} ${moreLabel})`
    }
  }

  const headlineFont = useTheme().fonts.headlineLarge

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[headlineFont, styles.headlineText, { color }]}
    >
      {label}
    </Text>
  )
}

function HeaderContentRange({
  color,
  endLabel = 'End',
  headerSeparator = '-',
  locale,
  startLabel = 'Start',
  state,
}: HeaderContentProps & { color: string }) {
  const { formatter } = useShortDateLabel(locale)
  const headlineFont = useTheme().fonts.titleLarge

  return (
    <>
      <Text
        maxFontSizeMultiplier={1.5}
        numberOfLines={1}
        style={[headlineFont, styles.headlineText, { color }]}
      >
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[
          styles.headerSeparator,
          headlineFont,
          styles.headlineText,
          { color },
        ]}
      >
        {headerSeparator}
      </Text>
      <Text
        maxFontSizeMultiplier={1.5}
        numberOfLines={1}
        style={[headlineFont, styles.headlineText, { color }]}
      >
        {state.endDate ? formatter.format(state.endDate) : endLabel}
      </Text>
    </>
  )
}

function HeaderContentSingle({
  color,
  emptyLabel = ' ',
  locale,
  state,
}: HeaderContentProps & { color: string }) {
  const { formatter } = useShortDateLabel(locale, true)
  const headlineFont = useTheme().fonts.headlineLarge

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      numberOfLines={1}
      style={[headlineFont, styles.headlineText, { color }]}
    >
      {state.date ? formatter.format(state.date) : emptyLabel}
    </Text>
  )
}

const styles = StyleSheet.create({
  compactRangeHeader: {
    paddingEnd: 12,
    paddingStart: 64,
  },
  editButton: {
    alignSelf: 'flex-end',
    height: 48,
    marginBottom: 0,
    marginEnd: 0,
    marginStart: 8,
    marginTop: 0,
    width: 48,
  },
  header: {
    paddingBottom: 12,
    paddingEnd: 12,
    paddingStart: 24,
    paddingTop: 16,
  },
  headerContentContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height: 40,
  },
  headerSeparator: {
    marginHorizontal: 4,
  },
  headlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    marginTop: 0,
  },
  headlineText: {
    includeFontPadding: false,
  },
  rangeEditButton: {
    end: 0,
    margin: 0,
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
  },
  rangeHeaderContent: {
    height: 40,
  },
  rangeHeaderContentWithToggle: {
    paddingEnd: 60,
  },
  supporting: {
    height: 36,
    justifyContent: 'center',
  },
  supportingText: {
    includeFontPadding: false,
    lineHeight: 20,
  },
})
