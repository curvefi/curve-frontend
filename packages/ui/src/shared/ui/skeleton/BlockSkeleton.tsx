import React from 'react'
import Loader from 'ui/src/Loader'
import { LoaderWrapper } from '@/shared/ui/skeleton/styled'

export const BlockSkeleton: React.FC<{
  height?: number
  width?: number
}> = ({ height = 30, width = 440 }) => {
  return (
    <LoaderWrapper>
      <Loader skeleton={[width, height]} />
      <Loader skeleton={[width, height]} />
      <Loader skeleton={[width, height * 2]} />
    </LoaderWrapper>
  )
}
