import { useConnection } from 'wagmi'
import { useLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { networksIdMapper } from '@/dao/networks'
import { type NetworkUrlParams } from '@/dao/types/dao.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useParams } from '@evm-ui/hooks/router'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { FormCrvLocker } from './components/FormCrvLocker'
import { WrongNetwork } from './WrongNetwork'

const ETHEREUM_CHAIN_ID = 1

export const VeCrv = () => {
  const { network } = useParams<NetworkUrlParams>()
  const { curveApi } = useCurve()
  const rChainId = networksIdMapper[network]

  const { address: userAddress } = useConnection()

  const { data: vecrvInfo } = useLockerVecrvInfo({ chainId: curveApi?.chainId, userAddress })
  return (
    <DetailPageLayout
      testId="vecrv-page"
      formTabs={{
        content:
          rChainId === ETHEREUM_CHAIN_ID ? (
            vecrvInfo && curveApi ? (
              <FormCrvLocker curve={curveApi} rChainId={rChainId} vecrvInfo={vecrvInfo} />
            ) : undefined
          ) : (
            <WrongNetwork />
          ),
      }}
    />
  )
}
