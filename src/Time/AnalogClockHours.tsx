import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { circleSize } from './timeUtils'
import { useTextColorOnPrimary } from '../shared/utils'
import { memo } from 'react'

function AnalogClockHours({
  is24Hour,
  hours,
}: {
  is24Hour: boolean
  hours: number
}) {
  const outerRange = getHourNumbers(false, circleSize, 12, 12)
  const innerRange = getHourNumbers(true, circleSize, 12, 12)
  const color = useTextColorOnPrimary()

  return (
    <>
      {outerRange.map((a, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.hourRoot,
            {
              top: a[1] || 0,
              left: a[0] || 0,
            },
          ]}
        >
          <View style={styles.hourInner}>
            {/* Display 00 instead of 12 for AM hours */}
            <Text
              maxFontSizeMultiplier={1.5}
              style={
                (!is24Hour && i + 1 === hours) ||
                (hours === i + 1 && hours !== 12) ||
                (i + 1 === 12 && hours === 0)
                  ? { color }
                  : null
              }
              variant="bodyLarge"
              selectable={false}
            >
              {is24Hour && i + 1 === 12 ? '00' : i + 1}
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
                styles.hourRoot,
                {
                  top: a[1] || 0,
                  left: a[0] || 0,
                },
              ]}
            >
              <View style={styles.hourInner}>
                <Text
                  maxFontSizeMultiplier={1.5}
                  selectable={false}
                  style={[
                    i + 13 === hours || (i + 13 === 24 && hours === 12)
                      ? { color }
                      : null,
                  ]}
                  variant="bodyLarge"
                >
                  {i + 13 === 24 ? '12' : i + 13}
                </Text>
              </View>
            </View>
          ))
        : null}
    </>
  )
}

const styles = StyleSheet.create({
  hourInner: {
    borderRadius: 24,
  },
  hourRoot: {
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
})

function getHourNumbers(
  is24Hour: boolean,
  size: number,
  count: number,
  arrayLength: number
) {
  let angle = 0
  let step = (2 * Math.PI) / count
  let radius = size / (is24Hour ? 4 : 2.5)

  angle = (-90 * Math.PI) / 180 + Math.PI / 6

  return Array(arrayLength)
    .fill(true)
    .map(() => {
      let x = Math.round(size / 2 + radius * Math.cos(angle))
      let y = Math.round(size / 2 + radius * Math.sin(angle))
      angle += step
      return [x, y]
    })
}

export default memo(AnalogClockHours)
