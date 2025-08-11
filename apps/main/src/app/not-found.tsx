import { t } from '@ui-kit/lib/i18n.ts'
import { PageNotFound } from '@ui-kit/pages/PageNotFound'

export default function NotFound() {
  return (
    <>
      <head>
        <title>{t`Error 404` + ' - Curve'}</title>
      </head>
      <PageNotFound />
    </>
  )
}
