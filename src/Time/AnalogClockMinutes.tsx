import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { circleSize } from './timeUtils'
import { useTextColorOnPrimary } from '../shared/utils'
import { memo } from 'react'

function AnalogClockMinutes({ minutes }: { minutes: number }) {
  const color = useTextColorOnPrimary()
  const range = minuteNumbers

  return (
    <>
      {range.map((a, i) => {
        const currentMinutes = i * 5
        let isCurrent =
          currentMinutes - 1 <= minutes && currentMinutes + 1 >= minutes
        const isZero = currentMinutes === 0
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
                left: a[0],
                top: a[1],
              },
            ]}
          >
            <View style={styles.outerHourInner}>
              <Text
                maxFontSizeMultiplier={1.5}
                selectable={false}
                style={isCurrent ? { color } : undefined}
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

function getMinuteNumbers(size: number, count: number) {
  let angle = 0
  let radius = size / 2.5
  let step = (2 * Math.PI) / count

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

const minuteNumbers = getMinuteNumbers(circleSize, 12)

const styles = StyleSheet.create({
  outerHourInner: { borderRadius: 24 },
  outerHourRoot: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginLeft: -24,
    marginTop: -24,
    position: 'absolute',
    width: 48,
    zIndex: 20,
  },
})

export default memo(AnalogClockMinutes)
