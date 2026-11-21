import {
  cloneElement,
  type ComponentProps,
  forwardRef,
  isValidElement,
  type ReactNode,
  type Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { TextInput, type TextInputHandles } from 'react-native-paper'

function TextInputWithMask(
  {
    disabled,
    inputButton,
    mask,
    onBlur,
    onChange,
    onChangeText,
    onSubmitEditing,
    value,
    ...rest
  }: ComponentProps<typeof TextInput> & {
    inputButton: ReactNode
    mask: string
    value: string
  },
  ref: Ref<TextInputHandles>
) {
  const [controlledValue, setControlledValue] = useState(value || '')
  const valueRef = useRef(value || '')
  useEffect(() => {
    valueRef.current = value || ''
    setControlledValue(value || '')
  }, [value])
  const layout = useMemo(() => maskLayout(mask), [mask])

  const commit = (text: string) => {
    const formatted = formatDigits(
      digitsFromText(text.trim(), layout.groups),
      layout.groups,
      layout.separators
    )
    valueRef.current = formatted
    setControlledValue(formatted)
    if (formatted.length === mask.length) {
      onChangeText?.(formatted)
    }
  }

  const onInnerChange = (text: string) => {
    valueRef.current = text
    setControlledValue(text)
  }

  return (
    <TextInput
      {...rest}
      ref={ref}
      disabled={disabled}
      endAccessory={
        isValidElement(inputButton)
          ? (props) => cloneElement(inputButton, props)
          : undefined
      }
      maxLength={mask.length}
      onBlur={(event) => {
        commit(valueRef.current)
        onBlur?.(event)
      }}
      onChange={(e) => {
        onChange?.(e)
      }}
      onChangeText={onInnerChange}
      onSubmitEditing={(event) => {
        commit(valueRef.current)
        onSubmitEditing?.(event)
      }}
      value={controlledValue}
    />
  )
}

function digitsFromText(text: string, groups: number[]) {
  let count = 0
  let digits = ''
  let groupIndex = 0
  for (const char of text) {
    if (groupIndex >= groups.length) break
    if (/\d/.test(char)) {
      digits += char
      count += 1
      if (count === groups[groupIndex]) {
        groupIndex += 1
        count = 0
      }
      continue
    }
    if (count === 1 && groups[groupIndex] === 2) {
      digits = `${digits.slice(0, -1)}0${digits.slice(-1)}`
      groupIndex += 1
      count = 0
    }
  }
  return digits
}

function formatDigits(digits: string, groups: number[], separators: string[]) {
  let offset = 0
  let result = ''
  for (let index = 0; index < groups.length; index += 1) {
    const size = groups[index]
    const chunk = digits.slice(offset, offset + size)
    if (!chunk) break
    result += chunk
    offset += chunk.length
    if (chunk.length === size) result += separators[index]
  }
  return result
}

function isPlaceholder(char: string) {
  return (
    char === 'D' ||
    char === 'M' ||
    char === 'Y' ||
    char === 'A' ||
    char === 'd' ||
    char === 'm' ||
    char === 'y' ||
    char === 'a'
  )
}

function maskLayout(mask: string) {
  const groups: number[] = []
  let index = 0
  const separators: string[] = []
  while (index < mask.length) {
    let size = 0
    while (index < mask.length && isPlaceholder(mask[index])) {
      size += 1
      index += 1
    }
    if (size === 0) break
    let separator = ''
    while (index < mask.length && !isPlaceholder(mask[index])) {
      separator += mask[index]
      index += 1
    }
    groups.push(size)
    separators.push(separator)
  }
  return { groups, separators }
}

export default forwardRef(TextInputWithMask)
