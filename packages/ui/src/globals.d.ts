declare module '*.png' {
  const content: any
  export default content
}
declare module '*.jpeg' {
  const content: any
  export default content
}
declare module '*.jpg' {
  const content: any
  export default content
}
declare module '*.webp' {
  const content: any
  export default content
}
declare module '*.css' {
  const content: any
  export default content
}

declare module '*.svg' {
  import * as React from 'react'

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>

  export default ReactComponent
}
