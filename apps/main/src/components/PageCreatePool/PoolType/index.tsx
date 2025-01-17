import styled from 'styled-components'
import { t } from '@lingui/macro'
import useStore from '@/store/useStore'
import { STABLESWAP, CRYPTOSWAP } from '@/components/PageCreatePool/constants'
import Box from '@/ui/Box'
import SelectButton from '@/components/PageCreatePool/components/SelectButton'
import { ChainId } from '@/types/main.types'

type Props = {
  chainId: ChainId
}

const PoolType = ({ chainId }: Props) => {
  const swapType = useStore((state) => state.createPool.swapType)
  const updateSwapType = useStore((state) => state.createPool.updateSwapType)
  const networks = useStore((state) => state.networks.networks)

  const { stableswapFactory, stableswapFactoryOld, tricryptoFactory, twocryptoFactory } = networks[chainId]

  return (
    <>
      <Wrapper flex flexColumn>
        <OptionsWrapper flex flexColumn>
          <SectionLabel>{t`Pool Type`}</SectionLabel>
          <SelectButtonWrapper>
            <SelectButton
              selected={swapType === STABLESWAP}
              name={STABLESWAP}
              descriptionName={t`Stableswap`}
              description={t`Bonding Curve specialising in pegged assets.`}
              handleClick={() => updateSwapType(STABLESWAP, chainId)}
              disabled={!stableswapFactory && !stableswapFactoryOld}
            />
            {!stableswapFactory && !stableswapFactoryOld && (
              <DisabledMessage>{t`Stableswap pools are currently unavailable on this chain`}</DisabledMessage>
            )}
          </SelectButtonWrapper>
          <SelectButtonWrapper>
            <SelectButton
              selected={swapType === CRYPTOSWAP}
              name={CRYPTOSWAP}
              descriptionName={t`Cryptoswap`}
              description={t`Bonding Curve specialising in unpegged assets.`}
              handleClick={() => updateSwapType(CRYPTOSWAP, chainId)}
              disabled={!tricryptoFactory && !twocryptoFactory}
            />
            {!tricryptoFactory && !twocryptoFactory && (
              <DisabledMessage>{t`Cryptoswap pools are currently unavailable on this chain`}</DisabledMessage>
            )}
          </SelectButtonWrapper>
        </OptionsWrapper>
      </Wrapper>
    </>
  )
}
const Wrapper = styled(Box)`
  margin: 0 var(--spacing-normal) var(--spacing-normal);
  padding: var(--spacing-narrow) 0 var(--spacing-wide);
  min-height: 380px;
`

const OptionsWrapper = styled(Box)`
  padding: var(--spacing-normal) 0;
  margin: auto;
  min-width: 90%;
  max-width: 33rem;
  @media (min-width: 33.75rem) {
    padding: var(--spacing-normal) 0 0;
  }
`

const SelectButtonWrapper = styled(Box)`
  margin-bottom: var(--spacing-3);
`

const DisabledMessage = styled.p`
  font-size: var(--font-size-1);
  font-style: italic;
  margin-left: var(--spacing-normal);
  margin-top: var(--spacing-2);
  color: var(--box--primary--color);
`

const SectionLabel = styled.p`
  margin-bottom: var(--spacing-narrow);
  margin-left: var(--spacing-2);
  color: var(--box--primary--color);
  font-size: var(--font-size-2);
`

export default PoolType
