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

/// <reference types="next-images" />
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const content: string

  export { ReactComponent }
  export default content
}
