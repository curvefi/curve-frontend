import {
  STABLESWAP,
  STABLESWAPOLD,
  THREECOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAPNG,
} from '@/dex/components/PageDeployGauge/constants'
import { usePoolContext } from '@/dex/features/pool-context'
import { useStore } from '@/dex/store/useStore'
import type { PoolUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { useParams } from '@evm-ui/hooks/router'
import Button from '@mui/material/Button'
import { RouterLink } from '@ui/components/RouterLink'
import { t } from '@ui/lib/i18n'

export const AddGaugeLink = () => {
  const {
    chainId,
    poolData: { pool, tokens },
  } = usePoolContext()
  const setCurrentPoolType = useStore(state => state.deployGauge.setCurrentPoolType)
  const setSidechainGauge = useStore(state => state.deployGauge.setSidechainGauge)
  const setPoolAddress = useStore(state => state.deployGauge.setPoolAddress)
  const setLpTokenAddress = useStore(state => state.deployGauge.setLpTokenAddress)

  const params = useParams<PoolUrlParams>()
  const deployGaugePath = getPath(params, `/deploy-gauge`)

  const handleClick = () => {
    if (chainId === 1) {
      setSidechainGauge(false)
      setPoolAddress(pool.address)
    } else {
      setSidechainGauge(true)
      setLpTokenAddress(pool.lpToken)
    }

    if (pool.isCrypto && pool.isNg && tokens.length === 2) {
      setCurrentPoolType(TWOCOINCRYPTOSWAPNG)
    } else if (pool.isCrypto && tokens.length === 2) {
      setCurrentPoolType(TWOCOINCRYPTOSWAP)
    } else if (pool.isCrypto && tokens.length === 3) {
      setCurrentPoolType(THREECOINCRYPTOSWAP)
    } else if (pool.isNg && !pool.isCrypto) {
      setCurrentPoolType(STABLESWAP)
    } else if (!pool.isNg && !pool.isCrypto) {
      setCurrentPoolType(STABLESWAPOLD)
    }
  }

  return (
    <Button component={RouterLink} href={deployGaugePath} onClick={handleClick}>
      {t`Add Gauge`}
    </Button>
  )
}
