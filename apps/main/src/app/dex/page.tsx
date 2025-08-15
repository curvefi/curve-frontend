import Skeleton from '@mui/material/Skeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight } = SizesAndSpaces

/** Redirect is handled by the `ClientWrapper` component, rendered in the layout */
export default function Component() {
  return <Skeleton width="100%" height={MinHeight.pageContent} />
}
