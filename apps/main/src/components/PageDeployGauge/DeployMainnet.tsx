import type { PoolType } from '@/components/PageDeployGauge/types'
import { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import useStore from '@/store/useStore'
import {
  TWOCOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAPNG,
  THREECOINCRYPTOSWAP,
  STABLESWAP,
  STABLESWAPOLD,
} from '@/components/PageDeployGauge/constants'

import Box from '@/ui/Box/Box'
import TextInput from '@/components/PageDeployGauge/components/TextInput'
import DialogSelect from '@/components/PageDeployGauge/components/DialogSelect'
import { ChainId } from '@/types/main.types'

type Props = {
  chainId: ChainId
}

const mainnet = 1

const DeployMainnet = ({ chainId }: Props) => {
  const currentPoolType = useStore((state) => state.deployGauge.currentPoolType)
  const setCurrentPoolType = useStore((state) => state.deployGauge.setCurrentPoolType)
  const poolAddress = useStore((state) => state.deployGauge.poolAddress)
  const setPoolAddress = useStore((state) => state.deployGauge.setPoolAddress)

  const network = useStore((state) => state.networks.networks[mainnet])

  const poolTypesList: PoolType[] = useMemo(() => {
    const list: PoolType[] = []
    if (network.stableswapFactory) {
      list.push(STABLESWAP)
    }
    if (network.twocryptoFactory) {
      list.push(TWOCOINCRYPTOSWAPNG)
    }
    if (network.tricryptoFactory) {
      list.push(THREECOINCRYPTOSWAP)
    }
    if (network.stableswapFactoryOld) {
      list.push(STABLESWAPOLD)
    }
    if (network.twocryptoFactoryOld) {
      list.push(TWOCOINCRYPTOSWAP)
    }
    return list
  }, [network])

  return (
    <Wrapper flex flexColumn>
      {chainId === mainnet ? (
        <>
          <SelectorWrapper>
            <Box flex>
              <SelectorLabel>{t`Pool Type:`}</SelectorLabel>
              <DialogSelect
                label={t`Set Pool Type`}
                currentData={currentPoolType}
                data={poolTypesList}
                setCurrentData={setCurrentPoolType}
                isDisabled={false}
              />
            </Box>
          </SelectorWrapper>
          <TextInput label={t`Pool Address`} value={poolAddress} onChange={setPoolAddress} maxLength={42} />
        </>
      ) : (
        <ConnectEthMessage>{t`Connect to Ethereum in order to deploy gauge.`}</ConnectEthMessage>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
`

const SelectorWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-3);
`

const SelectorLabel = styled.h5`
  margin: auto auto auto var(--spacing-1);
  opacity: 0.7;
`

const ConnectEthMessage = styled.p`
  font-size: var(--font-size-2);
  padding: var(--spacing-4) var(--spacing-3);
  margin: auto;
  max-width: 17.5rem;
  text-align: center;
`

export default DeployMainnet
