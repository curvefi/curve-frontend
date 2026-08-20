import { Loader } from '../Loader'
import { LoaderWrapper } from './styled'

export const BlockSkeleton = ({ height = 30, width = 440 }: { height?: number; width?: number }) => (
  <LoaderWrapper>
    <Loader skeleton={[width, height]} />
    <Loader skeleton={[width, height]} />
    <Loader skeleton={[width, height * 2]} />
  </LoaderWrapper>
)
