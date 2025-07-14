import type { Metadata } from 'next'
import { t } from '@ui-kit/lib/i18n'
import { PageNotFound } from '@ui-kit/pages/PageNotFound'

export const metadata: Metadata = {
  title: t`Error 404` + ' - Curve',
  description: t`Page not found`,
}

export default function NotFound() {
  return <PageNotFound />
}
