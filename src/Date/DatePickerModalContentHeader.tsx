import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { ModeType } from './Calendar'
import { LocalState } from './DatePickerModalContent'
import { useHeaderTextColor } from '../utils'

export interface HeaderPickProps {
  label?: string
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
}

export default function DatePickerModalHeader(props: HeaderContentProps) {
  const { onToggle, collapsed, mode } = props

  const label = props.label
    ? props.label
    : props.mode === 'range'
    ? 'Select period'
    : 'Select date'

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
        </View>
      </View>
      <View style={styles.fill} />
      <IconButton
        icon={collapsed ? 'pencil' : 'calendar'}
        color={color}
        onPress={onToggle}
      />
    </View>
  )
}

export function HeaderContentSingle({
  state,
  color,
}: HeaderContentProps & { color: string }) {
  //D MMM

  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }, [])

  return (
    <Text style={[styles.singleHeaderText, { color }]}>
      {formatter.format(state.date)}
    </Text>
  )
}
export function HeaderContentRange({
  state,
  headerSeparator = '-',
  startLabel = 'Start',
  endLabel = 'End',
  color,
}: HeaderContentProps & { color: string }) {
  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }, [])

  return (
    <>
      <Text
        style={[
          styles.rangeHeaderText,
          state.startDate ? styles.headerTextFilled : styles.headerTextEmpty,
          { color },
        ]}
      >
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text style={[styles.headerSeparator, { color }]}>{headerSeparator}</Text>
      <Text
        style={[
          styles.rangeHeaderText,
          state.endDate ? styles.headerTextFilled : styles.headerTextEmpty,
          { color },
        ]}
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
  headerTextFilled: { color: 'rgba(255,255,255,1)' },
  headerTextEmpty: { color: 'rgba(255,255,255,0.5)' },
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
})
