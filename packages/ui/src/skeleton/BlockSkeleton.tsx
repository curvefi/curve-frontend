import React from 'react'
import { LoaderWrapper } from './styled'
import Loader from '../Loader'

export const BlockSkeleton: React.FC<{
  height?: number
  width?: number
}> = ({ height = 30, width = 440 }) => (
  <LoaderWrapper>
    <Loader skeleton={[width, height]} />
    <Loader skeleton={[width, height]} />
    <Loader skeleton={[width, height * 2]} />
  </LoaderWrapper>
)
