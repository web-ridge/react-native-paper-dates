import { StyleSheet } from 'react-native'

export const sharedStyles = StyleSheet.create({
  flexDirectionRow: {
    flexDirection: 'row',
  },
  hug: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },
  minHeightZero: {
    minHeight: 0,
  },
  opacity0: {
    opacity: 0,
  },
  opacity1: {
    opacity: 1,
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  root: {
    flex: 1,
  },
})
