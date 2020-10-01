import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { getNumbers } from './timeUtils'
import { circleSize } from './AnalogClock'

const outerRange = getNumbers(false, circleSize, 12)
const innerRange = getNumbers(true, circleSize, 12)

export default function AnalogClockHours({
  is24Hour,
  hours,
}: {
  is24Hour: boolean
  hours: number
}) {
  return (
    <>
      {outerRange.map((a, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.outerHourRoot,
            {
              top: a[1],
              left: a[0],
            },
          ]}
        >
          <View style={styles.outerHourInner}>
            <Text
              style={hours === i + 1 ? { color: '#fff' } : null}
              selectable={false}
            >
              {i + 1}
            </Text>
          </View>
        </View>
      ))}
      {is24Hour
        ? innerRange.map((a, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={[
                styles.innerHourRoot,
                {
                  top: a[1],
                  left: a[0],
                },
              ]}
            >
              <View style={styles.innerHourInner}>
                <Text
                  selectable={false}
                  style={[
                    { fontSize: 13 },
                    i + 13 === hours ? { color: '#fff' } : null,
                  ]}
                >
                  {i + 13 === 24 ? '00' : i + 13}
                </Text>
              </View>
            </View>
          ))
        : null}
    </>
  )
}

const styles = StyleSheet.create({
  outerHourRoot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    width: 50,
    height: 50,
    marginLeft: -25,
    marginTop: -25,

    borderRadius: 25,
  },
  outerHourInner: { borderRadius: 25 },
  innerHourRoot: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderRadius: 20,
  },
  innerHourInner: { borderRadius: 20 },
})
