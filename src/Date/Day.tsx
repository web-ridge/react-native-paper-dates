import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewInstance,
  type ViewStyle,
} from 'react-native'
import { Text } from 'react-native-paper'

import { formatDayLabel } from '../shared/intl'
import StateLayer from '../shared/StateLayer'
import { type PaperTheme, withAlpha } from '../shared/utils'
import { getTranslation } from '../translations/utils'
import FocusRing from '../Time/FocusRing'
import { dayCellSize, daySize } from './dateUtils'
import DayRange from './DayRange'
import type { DayContentPosition, DayContentRenderer } from './types'

const contentPositions = StyleSheet.create({
  'bottom': {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  'bottom-left': { alignItems: 'flex-start', justifyContent: 'flex-end' },
  'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
  'center': { alignItems: 'center', justifyContent: 'center' },
  'top': { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  'top-left': { alignItems: 'flex-start', justifyContent: 'flex-start' },
  'top-right': { alignItems: 'flex-end', justifyContent: 'flex-start' },
})

export type DayRangeRole = 'end' | 'in-range' | 'start' | 'start-end'

function dayAccessibilityLabel(
  locale: string | undefined,
  year: number,
  month: number,
  day: number,
  isToday: boolean,
  rangeRole?: DayRangeRole
) {
  const parts = [formatDayLabel(locale, year, month, day)]
  if (isToday) parts.push(getTranslation(locale, 'today', 'Today'))
  if (rangeRole === 'start' || rangeRole === 'start-end') {
    parts.push(getTranslation(locale, 'startDate', 'Start date'))
  }
  if (rangeRole === 'end' || rangeRole === 'start-end') {
    parts.push(getTranslation(locale, 'endDate', 'End date'))
  }
  if (rangeRole === 'in-range') {
    parts.push(getTranslation(locale, 'inRange', 'In selected range'))
  }
  return parts.join(', ')
}

function Day(props: {
  cellHeight?: number
  day: number
  dayContent?: DayContentRenderer
  dayContentPosition?: DayContentPosition
  dayContentStyle?: StyleProp<ViewStyle>
  disabled: boolean
  focused?: boolean
  indicatorSize?: number
  inRange: boolean
  isTabStop?: boolean
  isToday: boolean
  leftCrop: boolean
  locale?: string
  month: number
  onPressDate: (date: Date) => void
  outside?: boolean
  primaryColor: string
  rangeRole?: DayRangeRole
  rightCrop: boolean
  selectColor: string
  selected: boolean
  textColorOnPrimary: string
  theme: PaperTheme
  year: number
}) {
  const [hovered, setHovered] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [pressed, setPressed] = useState(false)
  const pressableRef = useRef<ViewInstance>(null)

  const {
    cellHeight = dayCellSize,
    day,
    dayContent,
    dayContentPosition,
    dayContentStyle,
    disabled,
    focused,
    indicatorSize = daySize,
    inRange,
    isTabStop,
    isToday,
    leftCrop,
    locale,
    month,
    onPressDate,
    outside,
    primaryColor,
    rangeRole,
    rightCrop,
    selectColor,
    selected,
    textColorOnPrimary,
    theme,
    year,
  } = props

  const accessibilityLabel = useMemo(
    () => dayAccessibilityLabel(locale, year, month, day, isToday, rangeRole),
    [day, isToday, locale, month, rangeRole, year]
  )

  useEffect(() => {
    if (focused && Platform.OS === 'web') {
      pressableRef.current?.focus?.()
    }
  }, [focused])

  const baseTextColor = selected
    ? textColorOnPrimary
    : inRange && !disabled
      ? theme.colors.onSecondaryContainer
      : theme.colors.onSurface

  const circle = Math.min(indicatorSize, cellHeight)
  const muted = (disabled || outside) && !selected
  const showFocus = !disabled && (focused || inputFocused)

  const stateLayerColor = selected
    ? theme.colors.onPrimary
    : isToday
      ? theme.colors.primary
      : inRange
        ? theme.colors.onPrimaryContainer
        : theme.colors.onSurfaceVariant

  const stateSize = Math.min(daySize, circle)
  const stateOffset = (circle - stateSize) / 2

  const textColor =
    isToday && !selected && !disabled ? theme.colors.primary : baseTextColor

  const textFont = theme.fonts.bodyLarge

  const onPress = useCallback(() => {
    onPressDate(new Date(year, month, day))
  }, [onPressDate, year, month, day])

  return (
    <View style={styles.root}>
      <DayRange
        inRange={inRange}
        leftCrop={leftCrop}
        rightCrop={rightCrop}
        selectColor={selectColor}
      />
      <Pressable
        ref={pressableRef}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected }}
        {...(Platform.OS === 'web' && isToday
          ? { 'aria-current': 'date' as const }
          : null)}
        disabled={disabled}
        {...(Platform.OS === 'web' ? { tabIndex: isTabStop ? 0 : -1 } : null)}
        onBlur={() => setInputFocused(false)}
        onFocus={() => setInputFocused(true)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={disabled ? undefined : onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[
          styles.button,
          cellHeight === dayCellSize ? null : { height: cellHeight },
        ]}
        testID={`react-native-paper-dates-day-${year}-${month}-${day}`}
      >
        <View
          style={[
            styles.indicator,
            circle === daySize ? null : { height: circle, width: circle },
          ]}
        >
          <View
            style={[
              styles.day,
              circle === daySize
                ? null
                : {
                    borderRadius: circle / 2,
                    height: circle,
                    width: circle,
                  },
              isToday && !selected
                ? { borderColor: theme.colors.primary }
                : null,
              selected
                ? {
                    backgroundColor: disabled
                      ? withAlpha(primaryColor, 0.38)
                      : primaryColor,
                  }
                : null,
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.stateLayer,
                {
                  borderRadius: stateSize / 2,
                  height: stateSize,
                  left: stateOffset,
                  top: stateOffset,
                  width: stateSize,
                },
              ]}
            >
              <StateLayer
                color={stateLayerColor}
                focused={showFocus}
                hovered={!disabled && hovered}
                pressed={!disabled && pressed}
              />
            </View>
            <Text
              maxFontSizeMultiplier={1.5}
              selectable={false}
              style={[
                {
                  color:
                    selected && disabled
                      ? withAlpha(textColorOnPrimary, 0.38)
                      : textColor,
                },
                textFont,
                muted && styles.muted,
              ]}
            >
              {day}
            </Text>
          </View>
          {showFocus ? (
            <FocusRing
              color={theme.colors.secondary}
              focused
              radius={circle / 2}
            />
          ) : null}
        </View>
        {dayContent ? (
          <View
            pointerEvents="none"
            style={[
              styles.content,
              circle === daySize ? null : { height: circle, width: circle },
              contentPositions[dayContentPosition || 'bottom'],
              dayContentStyle,
            ]}
          >
            {dayContent({
              date: new Date(year, month, day),
              day,
              disabled,
              isToday,
              month,
              selected,
              year,
            })}
          </View>
        ) : null}
      </Pressable>
    </View>
  )
}

function EmptyDayPure() {
  return <View style={styles.empty} />
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    height: dayCellSize,
    justifyContent: 'center',
    width: dayCellSize,
  },
  content: {
    height: daySize,
    position: 'absolute',
    width: daySize,
  },
  day: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: daySize / 2,
    borderWidth: 1,
    height: daySize,
    justifyContent: 'center',
    overflow: 'hidden',
    width: daySize,
  },
  empty: {
    flex: 1,
    flexBasis: 0,
  },
  indicator: {
    height: daySize,
    width: daySize,
  },
  muted: {
    opacity: 0.38,
  },
  root: {
    alignItems: 'center',
    flex: 1,
    flexBasis: 0,
    justifyContent: 'center',
    position: 'relative',
  },
  stateLayer: {
    overflow: 'hidden',
    position: 'absolute',
  },
})

export const EmptyDay = memo(EmptyDayPure)

export default memo(Day)
