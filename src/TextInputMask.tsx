import {
  cloneElement,
  ComponentProps,
  forwardRef,
  isValidElement,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { TextInput } from 'react-native-paper'

const splitCharacters = ['-', '/', '.', '年', ' ']
function detectCharacter(mask: string): string {
  const c = splitCharacters.find((ch) => mask.includes(ch))
  return c || ''
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function TextInputWithMask(
  {
    disabled,
    inputButton,
    mask,
    onChange,
    onChangeText,
    value,
    ...rest
  }: ComponentProps<typeof TextInput> & {
    inputButton: ReactNode
    mask: string
    value: string
  },
  ref: any
) {
  const [controlledValue, setControlledValue] = useState(value || '')

  useEffect(() => {
    setControlledValue(value || '')
  }, [value])

  const onInnerChange = (text: string) => {
    const splitCharacter = detectCharacter(mask)
    const maskParts = mask.split(splitCharacter)

    let trimmedText = text.trim()
    const format =
      maskParts[0].toLowerCase() +
      splitCharacter +
      maskParts[1].toLowerCase() +
      splitCharacter +
      maskParts[2].toLowerCase()
    const match = new RegExp(
      format
        .replace(/(\w+)\W(\w+)\W(\w+)/, '^\\s*($1)\\W*($2)?\\W*($3)?([0-9]*).*')
        .replace(/m|d|y/g, '\\d')
    )
    const replaceValue = format.match(/\W/)
    const replace = `$1${splitCharacter}$2${splitCharacter}$3$4`.replace(
      new RegExp(escapeForRegExp(splitCharacter), 'g'),
      (replaceValue ?? '') as string
    )

    const isBackSpace = controlledValue.length > trimmedText.length

    if (!isBackSpace) {
      trimmedText = trimmedText
        .replace(/(^|\W)(?=\d\W)/g, '$10')
        .replace(match, replace)
        .replace(/(\W)+/g, '$1')
    }

    if (trimmedText.length === mask.length) {
      onChangeText && onChangeText(trimmedText)
    }

    setControlledValue(trimmedText)
  }

  return (
    <TextInput
      ref={ref}
      {...rest}
      disabled={disabled}
      endAccessory={
        isValidElement(inputButton)
          ? (props) => cloneElement(inputButton, props)
          : undefined
      }
      maxLength={mask.length}
      onChange={(e) => {
        onChange && onChange(e)
      }}
      onChangeText={onInnerChange}
      value={controlledValue}
    />
  )
}

export default forwardRef(TextInputWithMask)
