import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { daySize } from './dateUtils'

function DayRange({
  leftCrop,
  rightCrop,
  inRange,
  selectColor,
}: {
  leftCrop: boolean
  rightCrop: boolean
  inRange: boolean
  selectColor: string
}) {
  const bothWays = inRange && leftCrop && rightCrop
  const isCrop = inRange && (leftCrop || rightCrop) && !(leftCrop && rightCrop)

  if (inRange || isCrop) {
    return (
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.rangeRoot,
          bothWays && styles.rangeRootBoth,
          inRange && !isCrop
            ? {
                backgroundColor: selectColor,
              }
            : null,
        ]}
      >
        {isCrop && (
          <>
            <View
              style={[
                styles.flex1,
                rightCrop
                  ? {
                      backgroundColor: selectColor,
                    }
                  : null,
              ]}
            />
            <View
              style={[
                {
                  backgroundColor: selectColor,
                  minWidth: daySize,
                  minHeight: daySize,
                },
                leftCrop ? styles.leftRadius : null,
                rightCrop ? styles.rightRadius : null,
              ]}
            />
            <View
              style={[
                styles.flex1,
                leftCrop
                  ? {
                      backgroundColor: selectColor,
                    }
                  : null,
              ]}
            />
          </>
        )}
      </View>
    )
  }
  return null
}

const styles = StyleSheet.create({
  leftRadius: {
    borderBottomLeftRadius: daySize / 2,
    borderTopLeftRadius: daySize / 2,
  },
  rightRadius: {
    borderBottomRightRadius: daySize / 2,
    borderTopRightRadius: daySize / 2,
  },
  rangeRootBoth: {
    borderRadius: daySize / 2,
  },
  flex1: {
    flex: 1,
  },
  rangeRoot: {
    flexDirection: 'row',
  },
})

export default React.memo(DayRange)
