import { Chain } from 'curve-ui-kit/src/utils/network'
import { useEffect, useMemo } from 'react'
import { styled } from 'styled-components'
import { DialogSelect } from '@/dex/components/PageDeployGauge/components/DialogSelect'
import { TextInput } from '@/dex/components/PageDeployGauge/components/TextInput'
import {
  TWOCOINCRYPTOSWAP,
  THREECOINCRYPTOSWAP,
  STABLESWAP,
  STABLESWAPOLD,
  TWOCOINCRYPTOSWAPNG,
} from '@/dex/components/PageDeployGauge/constants'
import type { PoolType } from '@/dex/components/PageDeployGauge/types'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  chainId: ChainId
}

export const DeploySidechain = ({ chainId }: Props) => {
  const curveNetworks = useStore((state) => state.deployGauge.curveNetworks)
  const currentPoolType = useStore((state) => state.deployGauge.currentPoolType)
  const setCurrentPoolType = useStore((state) => state.deployGauge.setCurrentPoolType)
  const currentSidechain = useStore((state) => state.deployGauge.currentSidechain)
  const setCurrentSidechain = useStore((state) => state.deployGauge.setCurrentSidechain)
  const lpTokenAddress = useStore((state) => state.deployGauge.lpTokenAddress)
  const setLpTokenAddress = useStore((state) => state.deployGauge.setLpTokenAddress)
  const sidechainNav = useStore((state) => state.deployGauge.sidechainNav)

  const currentChainId = sidechainNav === 0 ? chainId : (currentSidechain ?? 1)

  // keep unavailable pool types out of state
  useEffect(() => {
    if (currentPoolType === STABLESWAP && !curveNetworks[currentChainId].poolTypes.stableswap) {
      setCurrentPoolType('')
    }
    if (currentPoolType === STABLESWAPOLD && !curveNetworks[currentChainId].poolTypes.stableswapOld) {
      setCurrentPoolType('')
    }
    if (currentPoolType === TWOCOINCRYPTOSWAP && !curveNetworks[currentChainId].poolTypes.twoCrypto) {
      setCurrentPoolType('')
    }
    if (currentPoolType === THREECOINCRYPTOSWAP && !curveNetworks[currentChainId].poolTypes.threeCrypto) {
      setCurrentPoolType('')
    }
  }, [currentSidechain, currentPoolType, curveNetworks, currentChainId, setCurrentPoolType])

  const poolTypesList: PoolType[] = useMemo(() => {
    const poolTypes = curveNetworks[currentChainId].poolTypes
    const list: PoolType[] = []

    if (poolTypes.stableswap) {
      list.push(STABLESWAP)
    }
    if (poolTypes.twoCryptoNg) {
      list.push(TWOCOINCRYPTOSWAPNG)
    }
    if (poolTypes.threeCrypto) {
      list.push(THREECOINCRYPTOSWAP)
    }
    if (poolTypes.stableswapOld) {
      list.push(STABLESWAPOLD)
    }
    if (poolTypes.twoCrypto) {
      list.push(TWOCOINCRYPTOSWAP)
    }
    return list
  }, [currentChainId, curveNetworks])

  const networksList = useMemo(
    () =>
      Object.keys(curveNetworks)
        .filter(
          (key) => +key !== Chain.Ethereum && !curveNetworks[+key].isTestnet && curveNetworks[+key].isCrvRewardsEnabled,
        )
        .map((key) => curveNetworks[+key].name)
        .sort(),
    [curveNetworks],
  )

  return (
    <Wrapper flex flexColumn>
      {sidechainNav === 1 && chainId !== 1 ? (
        <ConnectEthMessage>{t`Connect to Ethereum in order to deploy mirror gauge.`}</ConnectEthMessage>
      ) : (
        <>
          {chainId === 1 && sidechainNav === 0 ? (
            <ConnectEthMessage>{t`Connect to a sidechain in order to complete the first step and deploy a sidechain gauge.`}</ConnectEthMessage>
          ) : (
            <>
              <SelectorWrapper>
                <Box flex>
                  <SelectorLabel>{t`Network:`}</SelectorLabel>
                  {chainId === 1 ? (
                    <DialogSelect
                      label={t`Select Network`}
                      currentData={currentSidechain !== null ? curveNetworks[currentSidechain].name : null}
                      data={networksList}
                      setCurrentData={setCurrentSidechain}
                      isDisabled={false}
                    />
                  ) : (
                    <NetworkLabel>{curveNetworks[chainId].name}</NetworkLabel>
                  )}
                </Box>
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
              <TextInput
                label={t`LP Token Address`}
                value={lpTokenAddress}
                onChange={setLpTokenAddress}
                maxLength={42}
              />
            </>
          )}
        </>
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

const NetworkLabel = styled.h5`
  padding: var(--spacing-2);
  font-size: var(--font-size-2);
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
