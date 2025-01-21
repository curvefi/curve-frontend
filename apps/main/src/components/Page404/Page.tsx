import type { NextPage } from 'next'

import DocumentHead from '@main/layout/default/DocumentHead'
import Error404 from '@ui/Error404'

const Page: NextPage = () => (
  <>
    <DocumentHead title="Error 404" />
    <Error404 />
  </>
)

export default Page
