import * as React from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  VirtualizedList,
} from 'react-native'
import { useWindowDimensions } from 'react-native'
import { getMonthHeight, getMonthsOffset } from './Month'
import { allMonthsArray, daySize, startAtIndex } from './dateUtils'

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
})

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
  selectedYear,
}: {
  scrollMode: 'horizontal' | 'vertical'
  renderItem: (renderProps: RenderProps) => any
  renderHeader?: (renderProps: RenderProps) => any
  renderFooter?: (renderProps: RenderProps) => any
  selectedYear: number | undefined
}) {
  const isHorizontal = scrollMode === 'horizontal'
  const { width, height } = useWindowDimensions()
  const lazyIndex = React.useRef<number>()
  const swiper = React.useRef<VirtualizedList<any> | null>(null)

  const getItemLayout = (_: any[], index: number) => {
    if (index < 0) {
      return {
        length: 0,
        offset: 0,
        index,
      }
    }

    const length = getMonthHeight(scrollMode, index)
    const offset = getMonthsOffset(scrollMode, index)

    const itemLayout = isHorizontal
      ? {
          length: width,
          offset: width * index,
          index,
        }
      : {
          length: length,
          offset: offset,
          index,
        }

    return itemLayout
  }
  const getItemCount = (data: any[]) => data.length
  const keyExtractor = (_: any, index: number) => `${index}`
  const getItem = (_: any[], index: number) => ({ index })
  const renderPage = ({ index }: { index: number }) => {
    if (index < 0) {
      return null
    }
    return (
      <View style={isHorizontal ? { width, height } : null} key={index}>
        {renderItem({ index, onPrev, onNext })}
      </View>
    )
  }
  const onPrev = () => {
    if (swiper.current) {
      swiper.current.scrollToIndex({
        index: (lazyIndex.current || startAtIndex) - 1,
        animated: true,
      })
    }
  }

  const onNext = () => {
    if (swiper.current) {
      swiper.current.scrollToIndex({
        index: (lazyIndex.current || startAtIndex) + 1,
        animated: true,
      })
    }
  }

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = e.nativeEvent.contentOffset
    const viewSize = e.nativeEvent.layoutMeasurement
    lazyIndex.current = Math.floor(contentOffset.x / viewSize.width)
  }

  const renderProps = {
    index: 0,
    onPrev,
    onNext,
  }

  React.useEffect(() => {
    if (selectedYear && swiper.current) {
      // // every month is index
      // // so calculate months between startIndex === currentYear
      const currentIndex = lazyIndex.current || startAtIndex
      //
      // // | 0 = bitwise rule, remove decimals always go down
      // // eslint-disable-next-line no-bitwise
      const differenceWithStartIndex = ((currentIndex - startAtIndex) / 12) | 0
      console.log({
        selectedYear,
        before: (currentIndex - startAtIndex) / 12,
        downed: differenceWithStartIndex,
      })
      // // calculate which index to go
      const year = new Date().getFullYear() + differenceWithStartIndex
      const difference = selectedYear - year
      const differenceInMonths = difference * 12
      //
      const newIndex = currentIndex + differenceInMonths
      console.log({
        differenceInMonths,
        was: currentIndex,
        becomes: newIndex,
      })
      if (currentIndex !== newIndex) {
        lazyIndex.current = newIndex
        swiper.current.scrollToIndex({
          index: newIndex,
          animated: false,
        })
      }
    }
  }, [lazyIndex, swiper, selectedYear])

  React.useEffect(() => {
    if (swiper.current) {
      swiper.current.scrollToOffset({
        offset: getMonthsOffset(scrollMode, startAtIndex) - daySize,
        animated: false,
      })
    }
  }, [swiper, scrollMode])

  return (
    <>
      {renderHeader && renderHeader(renderProps)}
      <VirtualizedList
        ref={swiper}
        horizontal={isHorizontal}
        pagingEnabled={isHorizontal}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        getItemCount={getItemCount}
        data={allMonthsArray}
        initialScrollIndex={startAtIndex}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        windowSize={scrollMode === 'horizontal' ? 1 : 3}
        getItem={getItem}
        renderItem={renderPage}
        style={styles.viewPager}
        onMomentumScrollEnd={onMomentumScrollEnd}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      {renderFooter && renderFooter(renderProps)}
    </>
  )
}

export default React.memo(Swiper)
