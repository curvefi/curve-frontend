import Error404 from '@ui/Error404'
import { t } from '@ui-kit/lib/i18n'

const Page404 = () => (
  <>
    <title>{t`Error 404` + ' - Curve'}</title>
    <Error404 />
  </>
)

export default Page404
