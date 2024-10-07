import Error404 from '@/ui/Error404'
import { t } from '@lingui/macro'
import type { NextPage } from 'next'


import DocumentHead from '@/layout/DocumentHead'

const Page: NextPage = () => {
  return (
    <>
      <DocumentHead title={t`Error 404`} />
      <Error404 />
    </>
  )
}

export default Page
