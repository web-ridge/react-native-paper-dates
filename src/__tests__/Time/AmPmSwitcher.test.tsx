import { render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'

import { TimePickerPlacementContext } from '../../contexts/TimePickerPlacementContext'
import AmPmSwitcher from '../../Time/AmPmSwitcher'
import { inputTypes } from '../../Time/timeUtils'
import en from '../../translations/en'
import { registerTranslation } from '../../translations/utils'

registerTranslation('en', en)

function radio(screen: Awaited<ReturnType<typeof render>>, name: string) {
  return StyleSheet.flatten(
    screen.getByRole('radio', { name }).props.style
  ) as { borderRadius?: number; height?: number; width?: number }
}

it('uses the 56dp modal period selector with corner.large in a modal', async () => {
  const screen = await render(
    <TimePickerPlacementContext.Provider value="modal">
      <AmPmSwitcher
        hours={9}
        inputType={inputTypes.scroll}
        onChange={() => null}
      />
    </TimePickerPlacementContext.Provider>
  )

  expect(radio(screen, 'AM')).toMatchObject({
    borderRadius: 16,
    height: 56,
    width: 56,
  })
})

it('uses the 40dp inline period selector with a 48dp target inline', async () => {
  const screen = await render(
    <AmPmSwitcher
      hours={9}
      inputType={inputTypes.scroll}
      onChange={() => null}
    />
  )

  expect(radio(screen, 'AM')).toMatchObject({
    borderRadius: 12,
    height: 40,
    width: 40,
  })
  expect(screen.getByRole('radio', { name: 'AM' }).props.hitSlop).toBe(4)
})
