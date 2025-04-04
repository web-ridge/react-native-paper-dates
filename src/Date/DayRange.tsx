import { StyleSheet, View } from 'react-native'
import { daySize } from './dateUtils'
import { memo } from 'react'
import { sharedStyles } from '../shared/styles'

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
          sharedStyles.flexDirectionRow,
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
                sharedStyles.root,
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
                sharedStyles.root,
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
})

export default memo(DayRange)
