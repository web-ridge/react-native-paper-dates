import { render } from '@testing-library/react-native'
import CalendarHeader, { layoutScrollbarWidth } from '../../Date/CalendarHeader'

it('renders CalendarHeader', async () => {
  const { toJSON } = await render(
    <CalendarHeader
      locale="en"
      onNext={() => null}
      onPrev={() => null}
      scrollMode="vertical"
      startWeekOnMonday={false}
    />
  )
  expect(toJSON()).toMatchSnapshot()
})

it('measures the document scrollbar and caches the width', () => {
  const globalDocument = globalThis as { document?: Document }
  const previous = globalDocument.document

  function measure(
    documentMock: Document,
    assert: (read: typeof layoutScrollbarWidth) => void
  ) {
    globalDocument.document = documentMock
    jest.isolateModules(() => {
      const loaded = require('../../Date/CalendarHeader') as {
        layoutScrollbarWidth: typeof layoutScrollbarWidth
      }
      assert(loaded.layoutScrollbarWidth)
    })
  }

  try {
    measure({} as Document, (read) => {
      expect(read()).toBe(0)
    })

    const zero = probe(40, 40)
    measure(documentWith(zero.probe, zero.body), (read) => {
      expect(read()).toBe(0)
      expect(read()).toBe(0)
      expect(zero.body.appendChild).toHaveBeenCalledTimes(1)
    })

    const wide = probe(100, 85)
    measure(documentWith(wide.probe, wide.body), (read) => {
      expect(read()).toBe(15)
      expect(read()).toBe(15)
      expect(wide.body.appendChild).toHaveBeenCalledTimes(1)
    })
  } finally {
    if (previous) globalDocument.document = previous
    else delete globalDocument.document
  }
})

function probe(offsetWidth: number, clientWidth: number) {
  return {
    probe: {
      style: { cssText: '' },
      offsetWidth,
      clientWidth,
      remove: jest.fn(),
    },
    body: { appendChild: jest.fn() },
  }
}

function documentWith(
  node: ReturnType<typeof probe>['probe'],
  body: ReturnType<typeof probe>['body']
) {
  return {
    body,
    createElement: () => node,
  } as unknown as Document
}
