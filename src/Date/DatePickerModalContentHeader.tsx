import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { IconButton, MD2Theme, Text, useTheme } from 'react-native-paper'
import type { ModeType } from './Calendar'
import type { LocalState } from './DatePickerModalContent'
import { useHeaderTextColor } from '../utils'
import Color from 'color'
import { getTranslation } from '../translations/utils'

export interface HeaderPickProps {
  moreLabel?: string
  label?: string
  emptyLabel?: string
  saveLabel?: string
  uppercase?: boolean
  headerSeparator?: string
  startLabel?: string
  endLabel?: string
  editIcon?: string
  calendarIcon?: string
  closeIcon?: string
  allowEditing?: boolean
}

export interface HeaderContentProps extends HeaderPickProps {
  state: LocalState
  mode: ModeType
  collapsed: boolean
  onToggle: () => any
  locale: string | undefined
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
    onToggle,
    collapsed,
    mode,
    moreLabel,
    uppercase,
    editIcon,
    calendarIcon,
    allowEditing,
  } = props
  const theme = useTheme()
  const label = getLabel(props.locale, props.mode, props.label)

  const color = useHeaderTextColor()

  const isEditingEnabled = allowEditing && mode !== 'multiple'

  const supportingTextColor = theme.isV3 ? theme.colors.onSurfaceVariant : color

  const textFont = theme?.isV3
    ? theme.fonts.labelMedium
    : (theme as any as MD2Theme).fonts.medium

  const collapsedIcon = theme.isV3 ? 'pencil-outline' : 'pencil'
  const expandedIcon = theme.isV3 ? 'calendar-blank' : 'calendar'
  const finalCollapsedIcon = editIcon ?? collapsedIcon
  const finalExpandedIcon = calendarIcon ?? expandedIcon
  return (
    <View style={styles.header}>
      <View>
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
      <View style={styles.fill} />
      {isEditingEnabled ? (
        <IconButton
          icon={collapsed ? finalCollapsedIcon : finalExpandedIcon}
          accessibilityLabel={
            collapsed
              ? getTranslation(props.locale, 'typeInDate')
              : getTranslation(props.locale, 'pickDateFromCalendar')
          }
          iconColor={theme.isV3 ? theme.colors.onSurface : color}
          onPress={onToggle}
        />
      ) : null}
    </View>
  )
}

export function HeaderContentSingle({
  state,
  emptyLabel = ' ',
  color,
  locale,
}: HeaderContentProps & { color: string }) {
  const theme = useTheme()
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = state.date
    ? theme.isV3
      ? theme.colors.onSurface
      : color
    : lighterColor

  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  return (
    <Text
      maxFontSizeMultiplier={1.5}
      style={[styles.singleHeaderText, { color: dateColor }]}
    >
      {state.date ? formatter.format(state.date) : emptyLabel}
    </Text>
  )
}

export function HeaderContentMulti({
  state,
  emptyLabel = ' ',
  moreLabel = 'more',
  color,
  locale,
}: HeaderContentProps & { color: string; moreLabel: string | undefined }) {
  const theme = useTheme()
  const dateCount = state.dates?.length || 0
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = dateCount
    ? theme.isV3
      ? theme.colors.onSurface
      : color
    : lighterColor

  const formatter = React.useMemo(() => {
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
      style={[styles.singleHeaderText, { color: dateColor }]}
    >
      {label}
    </Text>
  )
}

export function HeaderContentRange({
  locale,
  state,
  headerSeparator = '-',
  startLabel = 'Start',
  endLabel = 'End',
  color,
}: HeaderContentProps & { color: string }) {
  const theme = useTheme()
  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const startColorFilled = theme.isV3 ? theme.colors.onSurface : color
  const endColorFilled = theme.isV3 ? theme.colors.onSurface : color
  const startColor = state.startDate ? startColorFilled : lighterColor
  const endColor = state.endDate ? endColorFilled : lighterColor

  return (
    <>
      <Text
        maxFontSizeMultiplier={1.5}
        style={[styles.rangeHeaderText, { color: startColor }]}
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
        style={[styles.rangeHeaderText, { color: endColor }]}
      >
        {state.endDate ? formatter.format(state.endDate) : endLabel}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  animated: {
    paddingBottom: 0,
    elevation: 4,
  },
  safeContent: {
    paddingBottom: 0,
  },
  header: {
    height: 75,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 12,
  },
  headerContentContainer: { marginTop: 5, flexDirection: 'row' },
  label: { color: '#fff', letterSpacing: 1, fontSize: 13 },
  singleHeaderText: { color: '#fff', fontSize: 25 },
  rangeHeaderText: { color: '#fff', fontSize: 25 },
  excludeInRangeHeaderText: { fontSize: 25 },
  excludeInRangeHeaderTextSmall: {
    fontSize: 14,
    marginTop: -3,
    marginLeft: 3,
  },
  headerSeparator: {
    color: 'rgba(255,255,255,1)',
    fontSize: 25,
    paddingLeft: 6,
    paddingRight: 6,
  },
  appbarHeader: {
    elevation: 0,
  },
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row' },
})
