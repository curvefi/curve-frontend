import type { PageTransferProps } from '@main/components/PagePool/types'

import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useNavigate, useParams } from 'react-router-dom'

import { getPath } from '@main/utils/utilsRouter'
import useStore from '@main/store/useStore'
import {
  TWOCOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAPNG,
  THREECOINCRYPTOSWAP,
  STABLESWAP,
  STABLESWAPOLD,
} from '@main/components/PageDeployGauge/constants'

import InteralLinkButton from '@ui/InternalLinkButton'
import { ChainId } from '@main/types/main.types'

const AddGaugeLink = ({
  chainId,
  address,
  lpToken,
  poolDataCacheOrApi,
}: { chainId: ChainId; address: string; lpToken: string } & Pick<PageTransferProps, 'poolDataCacheOrApi'>) => {
  const { setCurrentPoolType, setSidechainGauge, setPoolAddress, setLpTokenAddress } = useStore(
    (state) => state.deployGauge,
  )

  const params = useParams()
  const navigate = useNavigate()

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

    navigate(getPath(params, `/deploy-gauge`))
  }

  return (
    <AddGaugeWrapper>
      <InteralLinkButton title={t`Add Gauge`} onClick={handleClick} />
    </AddGaugeWrapper>
  )
}

const AddGaugeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1.5rem;
`

export default AddGaugeLink
