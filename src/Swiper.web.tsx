import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { VariableSizeList as List } from 'react-window'

import { useCallback, useState } from 'react'
import { getMonthHeight, getMonthsOffset } from './Month'
import { dayNamesHeight } from './DayNames'
import { allMonthsArray, startAtIndex } from './utils'

type RenderProps = {
  index: number
  onNext: () => any
  onPrev: () => any
}

function Swiper({
  scrollMode,
  renderItem,
  renderHeader,
  renderFooter,
}: {
  scrollMode: 'horizontal' | 'vertical'
  renderItem: (renderProps: RenderProps) => any
  renderHeader?: (renderProps: RenderProps) => any
  renderFooter?: (renderProps: RenderProps) => any
}) {
  const isHorizontal = scrollMode === 'horizontal'
  const swiper = React.useRef<List | null>(null)

  const [index, setIndex] = useState(startAtIndex)

  const onPrev = useCallback(() => {
    setIndex((prev) => prev - 1)
  }, [setIndex])

  const onNext = useCallback(() => {
    setIndex((prev) => prev + 1)
  }, [setIndex])

  const renderProps = {
    index: 0,
    onPrev,
    onNext,
  }

  const Row = (rowProps: any) => (
    <View style={rowProps.style}>
      {renderItem({ index: rowProps.index, onPrev, onNext })}
    </View>
  )

  const getItemSize = (idx: number): number => getMonthHeight(scrollMode, idx)

  return (
    <>
      {renderHeader && renderHeader(renderProps)}
      {isHorizontal ? (
        <View style={styles.flex1}>
          {renderItem({ index, onPrev, onNext })}
        </View>
      ) : (
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={swiper}
              height={height}
              itemCount={allMonthsArray.length}
              //@ts-ignore
              itemSize={getItemSize}
              layout={scrollMode}
              width={width}
              initialScrollOffset={
                getMonthsOffset(scrollMode, index) - dayNamesHeight
              }
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      )}

      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

type WidthAndHeight = {
  width: number
  height: number
}

function AutoSizer({
  children,
}: {
  children: ({ width, height }: WidthAndHeight) => any
}) {
  const [layout, setLayout] = React.useState<WidthAndHeight | null>(null)
  const onLayout = useCallback(
    (event: any) => {
      const nl = event.nativeEvent.layout

      // https://github.com/necolas/react-native-web/issues/1704
      if (!layout || layout.width !== nl.width || layout.height !== nl.height) {
        setLayout({ width: nl.width, height: nl.height })
      }
    },
    [layout, setLayout]
  )
  return (
    <View style={styles.autoSizer} onLayout={onLayout}>
      {layout ? children(layout) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  autoSizer: {
    flex: 1,
  },
})

export default React.memo(Swiper)
