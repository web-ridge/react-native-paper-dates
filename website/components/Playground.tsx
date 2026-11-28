import { useDark, withBase } from '@rspress/core/runtime'
import {
  Editor,
  MonacoEditorLoader,
  Runner,
} from '@rspress/plugin-playground/web'
import getImport from '_rspress_playground_imports'
import { useEffect, useState } from 'react'
import { DarkTheme, LightTheme, PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

interface PlaygroundProps {
  code: string
  language: string
}

export default function Playground({
  code: initialCode,
  language,
}: PlaygroundProps) {
  const dark = useDark()
  const [code, setCode] = useState(initialCode)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    MonacoEditorLoader.config({
      paths: { vs: new URL(withBase('/playground/vs'), location.href).href },
    })
    setMounted(true)
  }, [])

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="paper-demo rp-not-doc">
      <div className="paper-demo__preview">
        {mounted ? (
          <SafeAreaProvider>
            <PaperProvider theme={dark ? DarkTheme : LightTheme}>
              <Runner code={code} getImport={getImport} language={language} />
            </PaperProvider>
          </SafeAreaProvider>
        ) : null}
      </div>
      <div className="paper-demo__toolbar">
        {code !== initialCode ? (
          <button onClick={() => setCode(initialCode)} type="button">
            Reset
          </button>
        ) : null}
        <button onClick={copy} type="button">
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          aria-expanded={showCode}
          onClick={() => setShowCode((value) => !value)}
          type="button"
        >
          {showCode ? 'Hide code' : 'Edit code'}
        </button>
      </div>
      {showCode ? (
        <Editor
          language={language === 'tsx' ? 'typescript' : 'javascript'}
          onChange={(value) => setCode(value ?? '')}
          options={{ minimap: { enabled: false } }}
          value={code}
        />
      ) : null}
    </div>
  )
}
