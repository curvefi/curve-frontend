import { styled } from 'styled-components'
import {
  STABLESWAP,
  STABLESWAPOLD,
  THREECOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAPNG,
} from '@/dex/components/PageDeployGauge/constants'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { useStore } from '@/dex/store/useStore'
import { ChainId, type PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Button from '@mui/material/Button'
import { useParams, useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

export const AddGaugeLink = ({
  chainId,
  address,
  lpToken,
  poolDataCacheOrApi,
}: { chainId: ChainId; address: string; lpToken: string } & Pick<PageTransferProps, 'poolDataCacheOrApi'>) => {
  const setCurrentPoolType = useStore((state) => state.deployGauge.setCurrentPoolType)
  const setSidechainGauge = useStore((state) => state.deployGauge.setSidechainGauge)
  const setPoolAddress = useStore((state) => state.deployGauge.setPoolAddress)
  const setLpTokenAddress = useStore((state) => state.deployGauge.setLpTokenAddress)

  const params = useParams<PoolUrlParams>()
  const push = useNavigate()

  const handleClick = () => {
    if (chainId === 1) {
      setSidechainGauge(false)
      setPoolAddress(address)
    } else {
      setSidechainGauge(true)
      setLpTokenAddress(lpToken)
    }

    if (poolDataCacheOrApi.pool.isCrypto && poolDataCacheOrApi.pool.isNg && poolDataCacheOrApi.tokens.length === 2) {
      setCurrentPoolType(TWOCOINCRYPTOSWAPNG)
    } else if (poolDataCacheOrApi.pool.isCrypto && poolDataCacheOrApi.tokens.length === 2) {
      setCurrentPoolType(TWOCOINCRYPTOSWAP)
    } else if (poolDataCacheOrApi.pool.isCrypto && poolDataCacheOrApi.tokens.length === 3) {
      setCurrentPoolType(THREECOINCRYPTOSWAP)
    } else if (poolDataCacheOrApi.pool.isNg && !poolDataCacheOrApi.pool.isCrypto) {
      setCurrentPoolType(STABLESWAP)
    } else if (!poolDataCacheOrApi.pool.isNg && !poolDataCacheOrApi.pool.isCrypto) {
      setCurrentPoolType(STABLESWAPOLD)
    }

    push(getPath(params, `/deploy-gauge`))
  }

  return (
    <AddGaugeWrapper>
      <Button onClick={handleClick}>{t`Add Gauge`} </Button>
    </AddGaugeWrapper>
  )
}

const AddGaugeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
`
