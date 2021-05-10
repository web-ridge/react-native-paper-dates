import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { ModeType } from './Calendar'
import { LocalState } from './DatePickerModalContent'
import { useHeaderTextColor } from '../utils'
import Color from 'color'

export interface HeaderPickProps {
  moreLabel?: string
  label?: string
  emptyLabel?: string
  saveLabel?: string
  headerSeparator?: string
  startLabel?: string
  endLabel?: string
}

export interface HeaderContentProps extends HeaderPickProps {
  state: LocalState
  mode: ModeType
  collapsed: boolean
  onToggle: () => any
  locale: undefined | string
  theme: ReactNativePaper.Theme
}

function getLabel(mode: ModeType, configuredLabel?: string) {
  if (configuredLabel) {
    return configuredLabel
  }
  if (mode === 'range') {
    return 'Select period'
  }
  if (mode === 'single') {
    return 'Select date'
  }

  if (mode === 'multiple') {
    return 'Select dates'
  }
  return '...?'
}

export default function DatePickerModalHeader(props: HeaderContentProps) {
  const { onToggle, collapsed, mode, moreLabel, theme } = props

  const label = getLabel(props.mode, props.label)

  const color = useHeaderTextColor(theme)
  const allowEditing = mode !== 'multiple'
  return (
    <View style={[styles.header]}>
      <View>
        <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>

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
      {allowEditing ? (
        <IconButton
          icon={collapsed ? 'pencil' : 'calendar'}
          color={color}
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
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = state.date ? color : lighterColor

  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  return (
    <Text style={[styles.singleHeaderText, { color: dateColor }]}>
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
  const dateCount = state.dates?.length || 0
  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const dateColor = dateCount ? color : lighterColor

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
    <Text style={[styles.singleHeaderText, { color: dateColor }]}>{label}</Text>
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
  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    })
  }, [locale])

  const lighterColor = Color(color).fade(0.5).rgb().toString()
  const startColor = state.startDate ? color : lighterColor
  const endColor = state.endDate ? color : lighterColor

  return (
    <>
      <Text style={[styles.rangeHeaderText, { color: startColor }]}>
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text style={[styles.headerSeparator, { color }]}>{headerSeparator}</Text>
      <Text style={[styles.rangeHeaderText, { color: endColor }]}>
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
