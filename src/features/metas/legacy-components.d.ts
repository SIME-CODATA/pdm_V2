// Componentes JSX do legado mantidos sem reescrever seus layouts.
declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const Component: ComponentType<Record<string, unknown>>
  export default Component
}
