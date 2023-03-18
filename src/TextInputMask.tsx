import * as React from 'react'
import { TextInput } from 'react-native-paper'

const splitCharacters = ['-', '/', '.', '年', ' ']
function detectCharacter(mask: string): string {
  const c = splitCharacters.find((ch) => mask.includes(ch))
  return c || ''
}

function TextInputWithMask(
  {
    onChangeText,
    onChange,
    value,
    mask,
    disabled,
    ...rest
  }: React.ComponentProps<typeof TextInput> & { mask: string; value: string },
  ref: any
) {
  const [controlledValue, setControlledValue] = React.useState<string>(
    value || ''
  )

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
      new RegExp(splitCharacter, 'g'),
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

  React.useEffect(() => {
    setControlledValue(value || '')
  }, [value])

  return (
    <TextInput
      ref={ref}
      {...rest}
      disabled={disabled}
      value={controlledValue}
      onChangeText={onInnerChange}
      onChange={(e) => {
        onChange && onChange(e)
      }}
      maxLength={10}
    />
  )
}

export default React.forwardRef(TextInputWithMask)
