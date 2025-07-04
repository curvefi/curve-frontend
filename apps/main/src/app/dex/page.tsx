import Skeleton from '@mui/material/Skeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight } = SizesAndSpaces

/** Redirect is handled by the `ClientWrapper` component, as we need the client to access the url after # */
const DexRootPage = () => <Skeleton width="100%" height={MinHeight.pageContent} />

export default DexRootPage
