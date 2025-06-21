import Skeleton from '@mui/material/Skeleton'

export const metadata = {
  title: 'Curve.finance',
}

/** Redirect is handled by the `ClientWrapper` component, as we need the client to access the url after # */
const RootPage = () => <Skeleton width="100%" height="80vh" />

export default RootPage
