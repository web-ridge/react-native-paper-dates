declare module '*.css'

interface ImportMetaEnv {
  readonly SSG_MD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '_rspress_playground_imports' {
  const getImport: (name: string, getDefault?: boolean) => unknown
  export default getImport
}
