declare module '*.png' {
  const content: string
  export default content
}
declare module '*.jpeg' {
  const content: string
  export default content
}
declare module '*.jpg' {
  const content: string
  export default content
}
declare module '*.webp' {
  const content: string
  export default content
}
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

/**
 * This module declaration is used to import SVG files as React components.
 * According to the documentation we should add a reference to `vite-plugin-svgr/client` but that was not working.
 */
declare module '*.svg?react' {
  import * as React from 'react'

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>

  export default ReactComponent
}
