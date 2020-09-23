import * as React from 'react'

export function useLatest<T>(value: T) {
  const valueRef = React.useRef<T>(value)
  React.useEffect(() => {
    valueRef.current = value
  }, [value])
  return valueRef
}
