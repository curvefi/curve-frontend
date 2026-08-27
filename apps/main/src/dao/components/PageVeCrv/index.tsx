import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { useLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { networksIdMapper } from '@/dao/networks'
import { useStore } from '@/dao/store/useStore'
import { type NetworkUrlParams } from '@/dao/types/dao.types'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { useParams } from '@evm-ui/hooks/router'
import { Chain } from '@evm-ui/utils'
import { DetailPageLayout } from '@evm-ui/widgets/DetailPageLayout/DetailPageLayout'
import { FormCrvLocker } from './components/FormCrvLocker'
import { WrongNetwork } from './WrongNetwork'

export const VeCrv = () => {
  const { network } = useParams<NetworkUrlParams>()
  const { curveApi } = useCurve()
  const rChainId = networksIdMapper[network]

  const { address: userAddress } = useConnection()

  const { data: vecrvInfo } = useLockerVecrvInfo({ chainId: curveApi?.chainId, userAddress })
  const resetState = useStore(state => state.lockedCrv.resetState)

  // onMount
  useEffect(
    () => () => resetState(),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [],
  )

  return (
    <DetailPageLayout
      testId="vecrv-page"
      formTabs={{
        content:
          rChainId === Chain.Ethereum ? (
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
