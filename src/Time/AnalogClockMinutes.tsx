import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { circleSize } from './timeUtils'
import { useTextColorOnPrimary } from '../utils'

function AnalogClockMinutes({ minutes }: { minutes: number }) {
  const range = getMinuteNumbers(circleSize, 12)
  const color = useTextColorOnPrimary()
  return (
    <>
      {range.map((a, i) => {
        const currentMinutes = i * 5
        const isZero = currentMinutes === 0
        let isCurrent =
          currentMinutes - 1 <= minutes && currentMinutes + 1 >= minutes
        if (isZero) {
          isCurrent = minutes >= 59 || currentMinutes + 1 >= minutes
        }
        return (
          <View
            key={i}
            pointerEvents="none"
            style={[
              styles.outerHourRoot,
              {
                top: a[1] || 0,
                left: a[0] || 0,
              },
            ]}
          >
            <View style={styles.outerHourInner}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={isCurrent ? { color } : undefined}
                selectable={false}
                variant="bodyLarge"
              >
                {isZero ? '00' : currentMinutes}
              </Text>
            </View>
          </View>
        )
      })}
    </>
  )
}

const styles = StyleSheet.create({
  outerHourRoot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    width: 48,
    height: 48,
    marginLeft: -24,
    marginTop: -24,
    borderRadius: 24,
  },
  outerHourInner: { borderRadius: 24 },
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
  innerHourText: { fontSize: 13 },
  textWhite: { color: '#fff' },
})

function getMinuteNumbers(size: number, count: number) {
  let angle = 0
  let step = (2 * Math.PI) / count
  let radius = size / 2.5

  angle = angle = (-90 * Math.PI) / 180

  return Array(12)
    .fill(true)
    .map(() => {
      let x = Math.round(size / 2 + radius * Math.cos(angle))
      let y = Math.round(size / 2 + radius * Math.sin(angle))
      angle += step
      return [x, y]
    })
}

export default React.memo(AnalogClockMinutes)
