import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { ModeType } from './Calendar'
import { LocalState } from './DatePickerModalContent'
import { useHeaderTextColor } from '../utils'
import Color from 'color'

export interface HeaderPickProps {
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
  if (mode === 'excludeInRange') {
    return 'Select excluded dates'
  }
  return '...?'
}

export default function DatePickerModalHeader(props: HeaderContentProps) {
  const { onToggle, collapsed, mode } = props

  const label = getLabel(props.mode, props.label)

  const color = useHeaderTextColor()

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
          {mode === 'excludeInRange' ? (
            <HeaderContentExcludeInRange {...props} color={color} />
          ) : null}
        </View>
      </View>
      <View style={styles.fill} />
      {mode !== 'excludeInRange' ? (
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

export function HeaderContentExcludeInRange({
  state,
  emptyLabel = ' ',
  color,
  locale,
}: HeaderContentProps & { color: string }) {
  const lighterColor = Color(color).fade(0.5).rgb().toString()

  const dayFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
    })
  }, [locale])
  const monthFormatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
    })
  }, [locale])

  const excludedDaysPerMonth = React.useMemo(() => {
    // TODO: fix years :O
    let months: { [monthIndex: number]: Date[] } = {}
    state.excludedDates.forEach((ed) => {
      const existing = months[ed.getMonth()]
      months[ed.getMonth()] = existing ? [...existing, ed] : [ed]
    })
    return months
  }, [state.excludedDates])
  const dateColor =
    state.excludedDates && state.excludedDates.length > 0 ? color : lighterColor

  return (
    <View style={styles.column}>
      <View style={styles.row}>
        <Text style={[styles.excludeInRangeHeaderText, { color: dateColor }]}>
          {Object.keys(excludedDaysPerMonth)
            .map(
              (monthIndex: any) =>
                excludedDaysPerMonth[monthIndex]
                  .map((date) => dayFormatter.format(date))
                  .join(', ') +
                ' ' +
                monthFormatter.format(excludedDaysPerMonth[monthIndex][0]!)
            )
            .join(', ') || emptyLabel}
        </Text>
      </View>
    </View>
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
    // alignItems:'center'
  },
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row' },
})
