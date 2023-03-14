import * as React from 'react'
import { TextInput } from 'react-native-paper'

const splitCharacters = ['-', '/', '.', '年', ' ']
function detectCharacter(mask: string): string {
  const c = splitCharacters.find((ch) => mask.includes(ch))
  return c || ''
}

function enhanceTextWithMask(
  text: string,
  mask: string,
  previousValue: string
): string {
  const isBackSpace = previousValue.length > text.length
  const splitCharacter = detectCharacter(mask)

  const maskParts = mask.split(splitCharacter)
  const textParts = text.split(splitCharacter)

  let finalString: string[] = []
  for (let maskPartIndex = 0; maskPartIndex < mask.length; maskPartIndex++) {
    let partString: string[] = []

    const maskPart = maskParts[maskPartIndex]
    const textPart = textParts[maskPartIndex]
    if (!textPart) {
      continue
    }

    for (
      let maskDigitIndex = 0;
      maskDigitIndex < maskPart.length;
      maskDigitIndex++
    ) {
      const currentCharacter = textPart[maskDigitIndex]

      if (isBackSpace && currentCharacter === undefined) {
        continue
      }

      const character = textPart[maskDigitIndex]

      if (character !== undefined) {
        partString.push(character)
      }
    }

    finalString.push(partString.join(''))
  }

  const lastPart = finalString[finalString.length - 1]
  const lastMaskPart = maskParts[finalString.length - 1]
  if (
    // if mask is completed
    finalString.length !== maskParts.length &&
    // or ...
    lastPart &&
    lastMaskPart &&
    lastPart.length === lastMaskPart.length
  ) {
    return (
      finalString.join(splitCharacter) + (isBackSpace ? '' : splitCharacter)
    )
  }
  return finalString.join(splitCharacter)
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
    let trimmedText = text.trim()
    const format = 'mm/dd/yyyy'
    const match = new RegExp(
      format
        .replace(/(\w+)\W(\w+)\W(\w+)/, '^\\s*($1)\\W*($2)?\\W*($3)?([0-9]*).*')
        .replace(/m|d|y/g, '\\d')
    )
    const replaceValue = format.match(/\W/)
    const replace = '$1/$2/$3$4'.replace(/\//g, (replaceValue ?? '') as string)

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

  const onInnerBlur = () => {
    const enhancedText = enhanceTextWithMask(value, mask, controlledValue)
    setControlledValue(enhancedText)
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
      onBlur={onInnerBlur}
    />
  )
}

export default React.forwardRef(TextInputWithMask)
