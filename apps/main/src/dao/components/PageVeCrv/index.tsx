import { networksIdMapper } from '@/dao/networks'
import type { NetworkUrlParams } from '@/dao/types/dao.types'
import { useParams } from '@evm-ui/hooks/router'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { FormCrvLocker } from './components/FormCrvLocker'

export const VeCrv = () => {
  const { network } = useParams<NetworkUrlParams>()
  return (
    <DetailPageLayout
      testId="vecrv-page"
      formTabs={{ content: <FormCrvLocker chainId={networksIdMapper[network]} /> }}
    />
  )
}
