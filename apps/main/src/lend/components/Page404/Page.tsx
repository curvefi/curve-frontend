import type { NextPage } from 'next'

import { t } from '@ui-kit/lib/i18n'

import DocumentHead from '@/lend/layout/DocumentHead'
import Error404 from '@ui/Error404'

const Page: NextPage = () => (
  <>
    <DocumentHead title={t`Error 404`} />
    <Error404 />
  </>
)

export default Page
