import React from 'react'
import { LoaderWrapper } from './styled'
import Loader from '../Loader'

export const BlockSkeleton = ({ height = 30, width = 440 }: { height?: number; width?: number }) => (
  <LoaderWrapper>
    <Loader skeleton={[width, height]} />
    <Loader skeleton={[width, height]} />
    <Loader skeleton={[width, height * 2]} />
  </LoaderWrapper>
)
