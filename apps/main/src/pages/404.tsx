import Error404 from '@/ui/Error404'
import type { NextPage } from 'next'

import DocumentHead from '@/layout/default/DocumentHead'

const Page404: NextPage = () => (
  <>
    <DocumentHead title="Error 404" />
    <Error404 />
  </>
)

export default Page404
