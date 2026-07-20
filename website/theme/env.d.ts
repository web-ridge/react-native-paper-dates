declare module '*.css'

declare module '*.ttf' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly SSG_MD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
