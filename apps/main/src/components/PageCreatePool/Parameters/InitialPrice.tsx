import { TOKEN_A, TOKEN_B, TOKEN_C } from '@/components/PageCreatePool/constants'

import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import NumberField from '@/components/PageCreatePool/components/NumberField'
import SwitchTokensButton from '@/components/PageCreatePool/components/SwitchTokensButton'

type Props = {
  curve: CurveApi
  chainId: ChainId
  haveSigner: boolean
}

const InitialPrice = ({ curve, chainId }: Props) => {
  const {
    tokensInPool: { tokenA, tokenB, tokenC, tokenAmount },
    initialPrice,
  } = useStore((state) => state.createPool)
  const updateTokenPrice = useStore((state) => state.createPool.updateTokenPrice)

  return (
    <Box flex flexColumn>
      {(tokenA.address && tokenB.address) === '' ? (
        <DisabledMessage>{t`Please select tokens to be able to set initial price`}</DisabledMessage>
      ) : (
        <Wrapper>
          <InputSwitchWrapper flex>
            <InputsWrapper flex flexColumn>
              <InitialPriceInput
                label={t`${tokenA.symbol} price in USD`}
                value={initialPrice[TOKEN_A]}
                onChange={(value) => updateTokenPrice(TOKEN_A, value)}
                formatOptions={{
                  maximumSignificantDigits: 21,
                  maximumFractionDigits: 21,
                }}
                className={initialPrice[TOKEN_A] === 0 ? 'warning' : ''}
              />

              <InitialPriceInput
                label={t`${tokenB.symbol} price in USD`}
                value={initialPrice[TOKEN_B]}
                onChange={(value) => updateTokenPrice(TOKEN_B, value)}
                formatOptions={{
                  maximumSignificantDigits: 21,
                  maximumFractionDigits: 21,
                }}
                className={initialPrice[TOKEN_B] === 0 ? 'warning' : ''}
              />
              {tokenAmount === 3 && (
                <>
                  <InitialPriceInput
                    label={t`${tokenC.symbol} price in USD`}
                    value={initialPrice[TOKEN_C]}
                    onChange={(value) => updateTokenPrice(TOKEN_C, value)}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    className={initialPrice[TOKEN_C] === 0 ? 'warning' : ''}
                  />
                </>
              )}
            </InputsWrapper>
            <SwitchWrapper>
              <StyledSwitchTokensButton curve={curve} chainId={chainId} from={'tokenA'} to={'tokenB'} />
              {tokenAmount === 3 && (
                <StyledSwitchTokensButton curve={curve} chainId={chainId} from={'tokenB'} to={'tokenC'} />
              )}
            </SwitchWrapper>
          </InputSwitchWrapper>
          <InitialPriceWrapper>
            <InitialPriceSumTitle>{t`Initial Price ${
              tokenAmount === 2 ? `(${tokenA.symbol})` : ''
            }`}</InitialPriceSumTitle>
            <SumWrapper>
              <InitialPriceSumData>
                {tokenAmount === 3 && <InitialPriceTitle>{t`Price A (${tokenA.symbol})`}</InitialPriceTitle>}
                <InitialPriceSum>{initialPrice.initialPrice[0]}</InitialPriceSum>
              </InitialPriceSumData>
              {tokenAmount === 3 && (
                <InitialPriceSumData>
                  <InitialPriceTitle>{t`Price B (${tokenA.symbol})`}</InitialPriceTitle>
                  <InitialPriceSum>{initialPrice.initialPrice[1]}</InitialPriceSum>
                </InitialPriceSumData>
              )}
            </SumWrapper>
          </InitialPriceWrapper>
        </Wrapper>
      )}
    </Box>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* column-gap: var(--spacing-3); */
  @media (min-width: 41.25rem) {
    flex-direction: row;
  }
`

const InputSwitchWrapper = styled(Box)`
  width: 100%;
  margin: 0 auto;
  @media (min-width: 41.25rem) {
    width: 50%;
  }
`

const SwitchWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-content: space-around;
  padding: var(--spacing-3) 0;
  margin: 2.15em var(--spacing-1) 0;
`

const StyledSwitchTokensButton = styled(SwitchTokensButton)`
  /* margin-top: var(--spacing-2); */
`

const DisabledMessage = styled.h5`
  text-align: center;
  padding: var(--spacing-narrow) var(--spacing-normal);
  margin: var(--spacing-normal) auto;
  background: var(--box--primary--background);
  color: var(--box--primary--color);
`

const InputsWrapper = styled(Box)`
  justify-content: space-around;
  width: 100%;
`

const InitialPriceInput = styled(NumberField)`
  label {
    margin-top: var(--spacing-2);
  }
  &.warning {
    input {
      box-shadow: inset 0 0 0 0.5px var(--danger-400);
      border: 1px solid var(--danger-400);
    }
  }
`

const InitialPriceWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-content: center;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  @media (min-width: 41.25rem) {
    width: 50%;
  }
`

const InitialPriceSumTitle = styled.p`
  margin: var(--spacing-4) auto var(--spacing-2) var(--spacing-2);
  font-size: var(--font-size-2);
  color: var(--box--primary--color);
  @media (min-width: 41.25rem) {
    margin: var(--spacing-2) auto var(--spacing-2) var(--spacing-2);
  }
`

const SumWrapper = styled.div`
  margin: auto 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const InitialPriceSumData = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--box--primary--color);
  background-color: var(--layout--home--background-color);
  border: 1px solid var(--border-600);
  color: var(--page--text-color);
  &:nth-child(2) {
    margin-top: var(--spacing-2);
  }
`

const InitialPriceTitle = styled.p`
  text-align: left;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-2);
`

const InitialPriceSum = styled.h4`
  font-weight: var(--semi-bold);
  text-align: left;
`

const InitialPriceTokenA = styled.h4`
  font-size: var(--font-size-3);
`

export default InitialPrice
