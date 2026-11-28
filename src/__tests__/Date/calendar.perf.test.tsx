import { Profiler, type ProfilerOnRenderCallback } from 'react'
import { PaperProvider } from 'react-native-paper'

import Calendar from '../../Date/Calendar'
import Day from '../../Date/Day'
import Month from '../../Date/Month'
import { getDaysInMonth } from '../../Date/dateUtils'
import { fireEvent, render } from '@testing-library/react-native'

type MemoComponent = {
  type: (props: never) => unknown
}

const enabled =
  (globalThis as { process?: { env?: { BENCH?: string } } }).process?.env
    ?.BENCH === '1'

function countRenders(component: MemoComponent) {
  let renders = 0
  const inner = component.type
  component.type = ((props: never) => {
    renders += 1
    return inner(props)
  }) as MemoComponent['type']
  return {
    read: () => renders,
    reset() {
      renders = 0
    },
  }
}

const dayRenders = countRenders(Day as unknown as MemoComponent)
const monthRenders = countRenders(Month as unknown as MemoComponent)

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid]
  return (sorted[mid - 1] + sorted[mid]) / 2
}

function time(runOnce: () => void, samples = 7) {
  const durations: number[] = []
  for (let sample = 0; sample < samples; sample += 1) {
    const start = performance.now()
    runOnce()
    durations.push(performance.now() - start)
  }
  return median(durations)
}

function SingleCalendar({
  onChange,
  value,
}: {
  onChange: () => void
  value: Date
}) {
  'use no memo'
  return (
    <PaperProvider>
      <Profiler id="single" onRender={collectRender}>
        <Calendar
          date={value}
          endYear={2027}
          locale="en"
          mode="single"
          onChange={onChange}
          startYear={2025}
        />
      </Profiler>
    </PaperProvider>
  )
}

function RangeCalendar({
  end,
  onChange,
  start,
}: {
  end: Date
  onChange: () => void
  start: Date
}) {
  'use no memo'
  return (
    <PaperProvider>
      <Profiler id="range" onRender={collectRender}>
        <Calendar
          endDate={end}
          endYear={2027}
          locale="en"
          mode="range"
          onChange={onChange}
          startDate={start}
          startYear={2025}
        />
      </Profiler>
    </PaperProvider>
  )
}

let reactMs = 0
const collectRender: ProfilerOnRenderCallback = (
  _id,
  _phase,
  actualDuration
) => {
  reactMs += actualDuration
}

function takeCounts() {
  const snapshot = {
    days: dayRenders.read(),
    months: monthRenders.read(),
    reactMs: Number(reactMs.toFixed(3)),
  }
  dayRenders.reset()
  monthRenders.reset()
  reactMs = 0
  return snapshot
}

it('records calendar render cost', async () => {
  'use no memo'
  if (!enabled) return
  const date = new Date(2026, 0, 15)
  const nextDate = new Date(2026, 0, 20)
  const startDate = new Date(2026, 0, 10)
  const endDate = new Date(2026, 0, 16, 23, 59, 59)
  const nextEnd = new Date(2026, 0, 24, 23, 59, 59)

  const ignore = () => null
  const ignoreAgain = () => null
  const ignoreRange = () => null
  const ignoreRangeAgain = () => null

  dayRenders.reset()
  monthRenders.reset()
  reactMs = 0
  const single = await render(<SingleCalendar onChange={ignore} value={date} />)
  const singleMount = takeCounts()

  await single.rerender(<SingleCalendar onChange={ignoreAgain} value={date} />)
  const singleParentRerender = takeCounts()

  await single.rerender(
    <SingleCalendar onChange={ignoreAgain} value={nextDate} />
  )
  const singleSelection = takeCounts()

  await fireEvent.press(single.getByLabelText('January 2026'))
  const yearMenu = takeCounts()
  await single.unmount()

  const range = await render(
    <RangeCalendar end={endDate} onChange={ignoreRange} start={startDate} />
  )
  const rangeMount = takeCounts()

  await range.rerender(
    <RangeCalendar
      end={endDate}
      onChange={ignoreRangeAgain}
      start={startDate}
    />
  )
  const rangeParentRerender = takeCounts()

  await range.rerender(
    <RangeCalendar
      end={nextEnd}
      onChange={ignoreRangeAgain}
      start={startDate}
    />
  )
  const rangeSelection = takeCounts()
  await range.unmount()

  let dayLookupTotal = 0
  const dayLookupMs = time(() => {
    let total = 0
    for (let index = 0; index < 2000000; index += 1) {
      total += getDaysInMonth({
        month: index % 12,
        year: 1800 + (index % 401),
      })
    }
    dayLookupTotal = total
  })

  console.log(
    `CALENDAR_BENCH ${JSON.stringify({
      dayLookupMs: Number(dayLookupMs.toFixed(3)),
      dayLookupTotal,
      rangeMount,
      rangeParentRerender,
      rangeSelection,
      singleMount,
      singleParentRerender,
      singleSelection,
      yearMenu,
    })}`
  )
  expect(singleMount.days).toBeGreaterThan(0)
})
