import { render } from '@testing-library/react-native'
import { I18nManager } from 'react-native'

import { iconName } from '../../testUtils'

import DayName from '../../Date/DayName'
import CalendarHeader, {
  layoutScrollbarWidth,
  overlayScrollbarPadding,
  weekdayScrollbarInset,
} from '../../Date/CalendarHeader'

it('measures the document scrollbar and caches the width', () => {
  const globalDocument = globalThis as { document?: Document }

  let overlayPadding: typeof overlayScrollbarPadding = () => 0
  let weekdayInset: typeof weekdayScrollbarInset = () => 0

  function measure(
    documentMock: Document,
    assert: (read: typeof layoutScrollbarWidth) => void
  ) {
    globalDocument.document = documentMock
    jest.isolateModules(() => {
      const loaded = require('../../Date/CalendarHeader') as {
        layoutScrollbarWidth: typeof layoutScrollbarWidth
        overlayScrollbarPadding: typeof overlayScrollbarPadding
        weekdayScrollbarInset: typeof weekdayScrollbarInset
      }
      overlayPadding = loaded.overlayScrollbarPadding
      weekdayInset = loaded.weekdayScrollbarInset
      assert(loaded.layoutScrollbarWidth)
    })
  }

  const previous = globalDocument.document

  try {
    measure({} as Document, (read) => {
      expect(read()).toBe(0)
      expect(weekdayInset()).toBe(15)
      expect(overlayPadding()).toBe(15)
    })

    const zero = probe(40, 40)
    measure(documentWith(zero.probe, zero.body), (read) => {
      expect(read()).toBe(0)
      expect(read()).toBe(0)
      expect(weekdayInset()).toBe(15)
      expect(overlayPadding()).toBe(15)
      expect(zero.body.appendChild).toHaveBeenCalledTimes(1)
    })

    const wide = probe(100, 85)
    measure(documentWith(wide.probe, wide.body), (read) => {
      expect(read()).toBe(15)
      expect(read()).toBe(15)
      expect(weekdayInset()).toBe(15)
      expect(overlayPadding()).toBe(0)
      expect(wide.body.appendChild).toHaveBeenCalledTimes(1)
    })
  } finally {
    if (previous) globalDocument.document = previous
    else delete globalDocument.document
  }
})

function documentWith(
  node: ReturnType<typeof probe>['probe'],
  body: ReturnType<typeof probe>['body']
) {
  return {
    body,
    createElement: () => node,
  } as unknown as Document
}

function probe(offsetWidth: number, clientWidth: number) {
  return {
    body: { appendChild: jest.fn() },
    probe: {
      clientWidth,
      offsetWidth,
      remove: jest.fn(),
      style: { cssText: '' },
    },
  }
}

it('labels the month arrows and flips them in RTL', async () => {
  const wasRtl = I18nManager.isRTL
  try {
    const header = await render(
      <CalendarHeader
        locale="en"
        onNext={() => null}
        onPrev={() => null}
        scrollMode="horizontal"
        startWeekOnMonday={false}
      />
    )
    const previous = header.getByTestId('react-native-paper-dates-prev-month')
    const next = header.getByTestId('react-native-paper-dates-next-month')
    expect(previous).toHaveProp('accessibilityLabel', 'Previous month')
    expect(previous).toHaveProp('accessibilityHint', 'Page Up')
    expect(iconName(previous)).toBe('chevron-left')
    expect(next).toHaveProp('accessibilityLabel', 'Next month')
    expect(next).toHaveProp('accessibilityHint', 'Page Down')
    expect(iconName(next)).toBe('chevron-right')

    I18nManager.isRTL = true
    const rtl = await render(
      <CalendarHeader
        locale="en"
        onNext={() => null}
        onPrev={() => null}
        scrollMode="horizontal"
        startWeekOnMonday={false}
      />
    )
    expect(
      iconName(rtl.getByTestId('react-native-paper-dates-prev-month'))
    ).toBe('chevron-right')
    expect(
      iconName(rtl.getByTestId('react-native-paper-dates-next-month'))
    ).toBe('chevron-left')
  } finally {
    I18nManager.isRTL = wasRtl
  }
})

it('uses the long weekday name for the column header when it is provided', async () => {
  const labeled = await render(<DayName label="M" />)
  expect(labeled.getByLabelText('M')).toBeTruthy()
  const named = await render(<DayName label="M" name="Monday" />)
  expect(named.getByLabelText('Monday')).toBeTruthy()
  expect(named.queryByLabelText('M')).toBeNull()
})
