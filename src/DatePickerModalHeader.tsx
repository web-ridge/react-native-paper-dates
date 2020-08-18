import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Appbar, Button, IconButton, Text, useTheme } from 'react-native-paper'
import { ModeType } from './Calendar'
import { LocalState } from './DatePickerModal'

export interface HeaderPickProps {
  label?: string
  saveLabel?: string
  headerSeparator?: string
  startLabel?: string
  endLabel?: string
}
export interface HeaderProps extends HeaderPickProps {
  state: LocalState
  mode: ModeType
  onDismiss: () => any
  onSave: () => any
  collapsed: boolean
  onToggle: () => any
}

export default function DatePickerModalHeader(props: HeaderProps) {
  const theme = useTheme()

  const { onToggle, collapsed, mode, saveLabel = 'Save' } = props

  const label = props.label
    ? props.label
    : props.mode === 'range'
    ? 'Select period'
    : 'Select date'

  return (
    <>
      <Appbar.Header style={styles.appbarHeader}>
        <Appbar.Action icon="close" onPress={props.onDismiss} />
        <Appbar.Content title={''} />
        <Button color={'#fff'} onPress={props.onSave}>
          {saveLabel}
        </Button>
      </Appbar.Header>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <View>
          <Text style={styles.label}>{label.toUpperCase()}</Text>

          <View style={styles.headerContentContainer}>
            {mode === 'range' ? <HeaderContentRange {...props} /> : null}
            {mode === 'single' ? <HeaderContentSingle {...props} /> : null}
          </View>
        </View>
        <View style={styles.fill} />
        <IconButton
          icon={collapsed ? 'pencil' : 'calendar'}
          color={'#fff'}
          onPress={onToggle}
        />
      </View>
    </>
  )
}

export function HeaderContentSingle({ state }: HeaderProps) {
  //D MMM

  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }, [])

  return (
    <Text style={styles.singleHeaderText}>{formatter.format(state.date)}</Text>
  )
}
export function HeaderContentRange({
  state,
  headerSeparator = '-',
  startLabel = 'Start',
  endLabel = 'End',
}: HeaderProps) {
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
          {
            color: state.startDate
              ? 'rgba(255,255,255,1)'
              : 'rgba(255,255,255,0.5)',
          },
        ]}
      >
        {state.startDate ? formatter.format(state.startDate) : startLabel}
      </Text>
      <Text style={styles.headerSeparator}>{headerSeparator}</Text>
      <Text
        style={[
          styles.rangeHeaderText,
          {
            color: state.endDate
              ? 'rgba(255,255,255,1)'
              : 'rgba(255,255,255,0.5)',
          },
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
  headerSeparator: {
    color: 'rgba(255,255,255,1)',
    fontSize: 25,
    paddingLeft: 6,
    paddingRight: 6,
  },
  appbarHeader: {
    elevation: 0,
  },
})
