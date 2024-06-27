import type { NextPage } from 'next'

import { t } from '@lingui/macro'

import DocumentHead from '@/layout/DocumentHead'
import ErrorVideo from '@/components/Page404/index'

const Page: NextPage = () => {
  return (
    <>
      <DocumentHead title={t`Error 404`} />
      <ErrorVideo />
    </>
  )
}

export default Page
