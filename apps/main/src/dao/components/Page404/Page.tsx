import type { NextPage } from 'next'

import DocumentHead from '@/dao/layout/DocumentHead'
import Error404 from '@ui/Error404'

const Page: NextPage = () => (
  <>
    <DocumentHead title="Error 404" />
    <Error404 />
  </>
)

export default Page
