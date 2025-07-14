import Skeleton from '@mui/material/Skeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight } = SizesAndSpaces
export const metadata = {
  title: 'Curve.finance',
}
/** Redirect is handled by the `ClientWrapper` component, as we need the client to access the url after # */
const LendRootPage = () => <Skeleton width="100%" height={MinHeight.pageContent} />

export default LendRootPage
