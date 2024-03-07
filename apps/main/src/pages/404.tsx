import type { NextPage } from 'next'

import DocumentHead from '@/layout/default/DocumentHead'
import Error404 from '@/ui/Error404'

const Page404: NextPage = () => {
  return (
    <>
      <DocumentHead title="Error 404" />
      <Error404 />
    </>
  )
}

export default Page404
