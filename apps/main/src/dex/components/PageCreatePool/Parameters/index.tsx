import { BigNumber } from 'bignumber.js'
import { useState, useEffect, useMemo } from 'react'
import { styled } from 'styled-components'
import { NumberField } from '@/dex/components/PageCreatePool/components/NumberField'
import { Switch } from '@/dex/components/PageCreatePool/components/Switch'
import { WarningBox as TokenWarningBox } from '@/dex/components/PageCreatePool/components/WarningBox'
import {
  STABLESWAP_MIN_MAX_PARAMETERS,
  TWOCRYPTO_MIN_MAX_PARAMETERS,
  TRICRYPTO_MIN_MAX_PARAMETERS,
  STABLESWAP,
  POOL_PRESETS,
} from '@/dex/components/PageCreatePool/constants'
import { InitialPrice } from '@/dex/components/PageCreatePool/Parameters/InitialPrice'
import { SelectPreset } from '@/dex/components/PageCreatePool/Parameters/SelectPreset'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { CurveApi, ChainId } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  curve: CurveApi
  chainId: ChainId
  haveSigner: boolean
}

export const Parameters = ({ curve, chainId, haveSigner }: Props) => {
  const advanced = useStore((state) => state.createPool.advanced)
  const midFee = useStore((state) => state.createPool.parameters.midFee)
  const outFee = useStore((state) => state.createPool.parameters.outFee)
  const stableSwapFee = useStore((state) => state.createPool.parameters.stableSwapFee)
  const stableA = useStore((state) => state.createPool.parameters.stableA)
  const cryptoA = useStore((state) => state.createPool.parameters.cryptoA)
  const gamma = useStore((state) => state.createPool.parameters.gamma)
  const allowedExtraProfit = useStore((state) => state.createPool.parameters.allowedExtraProfit)
  const feeGamma = useStore((state) => state.createPool.parameters.feeGamma)
  const adjustmentStep = useStore((state) => state.createPool.parameters.adjustmentStep)
  const maHalfTime = useStore((state) => state.createPool.parameters.maHalfTime)
  const maExpTime = useStore((state) => state.createPool.parameters.maExpTime)
  const offpegFeeMultiplier = useStore((state) => state.createPool.parameters.offpegFeeMultiplier)
  const tokensInPool = useStore((state) => state.createPool.tokensInPool)
  const swapType = useStore((state) => state.createPool.swapType)
  const updateStableSwapFee = useStore((state) => state.createPool.updateStableSwapFee)
  const updateMidFee = useStore((state) => state.createPool.updateMidFee)
  const updateOutFee = useStore((state) => state.createPool.updateOutFee)
  const updateStableA = useStore((state) => state.createPool.updateStableA)
  const updateCryptoA = useStore((state) => state.createPool.updateCryptoA)
  const updateGamma = useStore((state) => state.createPool.updateGamma)
  const updateAllowedExtraProfit = useStore((state) => state.createPool.updateAllowedExtraProfit)
  const updateFeeGamma = useStore((state) => state.createPool.updateFeeGamma)
  const updateAdjustmentStep = useStore((state) => state.createPool.updateAdjustmentStep)
  const updateMaHalfTime = useStore((state) => state.createPool.updateMaHalfTime)
  const updateMaExpTime = useStore((state) => state.createPool.updateMaExpTime)
  const updateOffpegFeeMultiplier = useStore((state) => state.createPool.updateOffpegFeeMultiplier)
  const updateAdvanced = useStore((state) => state.createPool.updateAdvanced)
  const refreshInitialPrice = useStore((state) => state.createPool.refreshInitialPrice)
  const initialPrice = useStore((state) => state.createPool.initialPrice)
  const poolPresetIndex = useStore((state) => state.createPool.poolPresetIndex!)
  const { data: network } = useNetworkByChain({ chainId })

  const [stableFeeValue, setStableFeeValue] = useState<string>(stableSwapFee)
  const [midValue, setMidValue] = useState<string>(midFee)
  const [outValue, setOutValue] = useState<string>(outFee)

  const STABLESWAP_MIN_MAX = STABLESWAP_MIN_MAX_PARAMETERS(+stableSwapFee)

  const CRYPTOSWAP_MIN_MAX = useMemo(() => {
    if (tokensInPool.tokenA.address !== '' && tokensInPool.tokenB.address !== '' && tokensInPool.tokenC.address !== '')
      return TRICRYPTO_MIN_MAX_PARAMETERS
    return TWOCRYPTO_MIN_MAX_PARAMETERS
  }, [tokensInPool])

  const updateStableFeeValue = (value: number) => {
    updateStableSwapFee(new BigNumber(value).toString())
    setStableFeeValue(new BigNumber(value).toString())
  }
  const updateMidValue = (value: number) => {
    updateMidFee(new BigNumber(value).toString())
    setMidValue(new BigNumber(value).toString())
  }
  const updateOutValue = (value: number) => {
    updateOutFee(new BigNumber(value).toString())
    setOutValue(new BigNumber(value).toString())
  }

  useEffect(() => {
    setStableFeeValue(stableSwapFee)
    setMidValue(midFee)
    setOutValue(outFee)
    if (+offpegFeeMultiplier > STABLESWAP_MIN_MAX.offpegFeeMultiplier.max) {
      updateOffpegFeeMultiplier(STABLESWAP_MIN_MAX.offpegFeeMultiplier.max.toString())
    }
  }, [
    STABLESWAP_MIN_MAX.offpegFeeMultiplier.max,
    midFee,
    offpegFeeMultiplier,
    outFee,
    poolPresetIndex,
    stableSwapFee,
    updateOffpegFeeMultiplier,
  ])

  useEffect(() => {
    if (midFee > outValue) {
      updateOutFee(new BigNumber(midFee).toString())
      setOutValue(new BigNumber(midFee).toString())
    }
  }, [midFee, outValue, updateOutFee])

  // manage case where user removes value from input and unfocuses input
  useEffect(() => {
    if (swapType === STABLESWAP) {
      if (stableFeeValue === 'NaN') updateStableSwapFee(POOL_PRESETS[poolPresetIndex].defaultParams.stableSwapFee)
      if (stableA === 'NaN') updateStableA(POOL_PRESETS[poolPresetIndex].defaultParams.stableA)
      if (maExpTime === 'NaN') updateMaExpTime(POOL_PRESETS[poolPresetIndex].defaultParams.maExpTime)
      if (offpegFeeMultiplier === 'NaN')
        updateOffpegFeeMultiplier(POOL_PRESETS[poolPresetIndex].defaultParams.offpegFeeMultiplier)
    } else {
      if (midFee === 'NaN') {
        updateMidFee(POOL_PRESETS[poolPresetIndex].defaultParams.midFee)
        updateOutFee(POOL_PRESETS[poolPresetIndex].defaultParams.outFee)
      }
      if (outFee === 'NaN') {
        updateOutFee(POOL_PRESETS[poolPresetIndex].defaultParams.outFee)
        setMidValue(POOL_PRESETS[poolPresetIndex].defaultParams.midFee)
        setOutValue(POOL_PRESETS[poolPresetIndex].defaultParams.outFee)
      }
      if (cryptoA === 'NaN') updateCryptoA(POOL_PRESETS[poolPresetIndex].defaultParams.cryptoA)
      if (gamma === 'NaN') updateGamma(POOL_PRESETS[poolPresetIndex].defaultParams.gamma)
      if (allowedExtraProfit === 'NaN')
        updateAllowedExtraProfit(POOL_PRESETS[poolPresetIndex].defaultParams.allowedExtraProfit)
      if (feeGamma === 'NaN') updateFeeGamma(POOL_PRESETS[poolPresetIndex].defaultParams.feeGamma)
      if (adjustmentStep === 'NaN') updateAdjustmentStep(POOL_PRESETS[poolPresetIndex].defaultParams.adjustmentStep)
      if (maHalfTime === 'NaN') updateMaHalfTime(POOL_PRESETS[poolPresetIndex].defaultParams.maHalfTime)
    }
  }, [
    adjustmentStep,
    allowedExtraProfit,
    cryptoA,
    feeGamma,
    gamma,
    maExpTime,
    maHalfTime,
    midFee,
    offpegFeeMultiplier,
    outFee,
    poolPresetIndex,
    stableA,
    stableFeeValue,
    swapType,
    updateAdjustmentStep,
    updateAllowedExtraProfit,
    updateCryptoA,
    updateFeeGamma,
    updateGamma,
    updateMaExpTime,
    updateMaHalfTime,
    updateMidFee,
    updateOffpegFeeMultiplier,
    updateOutFee,
    updateStableA,
    updateStableSwapFee,
  ])

  const resetFees = (poolPresetIndex: number) => {
    if (swapType === STABLESWAP) {
      updateStableSwapFee(POOL_PRESETS[poolPresetIndex].defaultParams.stableSwapFee)
      setStableFeeValue(POOL_PRESETS[poolPresetIndex].defaultParams.stableSwapFee)
    } else {
      updateMidFee(POOL_PRESETS[poolPresetIndex].defaultParams.midFee)
      updateOutFee(POOL_PRESETS[poolPresetIndex].defaultParams.outFee)
      setMidValue(POOL_PRESETS[poolPresetIndex].defaultParams.midFee)
      setOutValue(POOL_PRESETS[poolPresetIndex].defaultParams.outFee)
    }
  }

  const resetAdvanced = () => {
    if (swapType === STABLESWAP) {
      updateStableA(POOL_PRESETS[poolPresetIndex].defaultParams.stableA)
      updateMaExpTime(POOL_PRESETS[poolPresetIndex].defaultParams.maExpTime)
      updateOffpegFeeMultiplier(POOL_PRESETS[poolPresetIndex].defaultParams.offpegFeeMultiplier)
    } else {
      updateCryptoA(POOL_PRESETS[poolPresetIndex].defaultParams.cryptoA)
      updateGamma(POOL_PRESETS[poolPresetIndex].defaultParams.gamma)
      updateAllowedExtraProfit(POOL_PRESETS[poolPresetIndex].defaultParams.allowedExtraProfit)
      updateFeeGamma(POOL_PRESETS[poolPresetIndex].defaultParams.feeGamma)
      updateAdjustmentStep(POOL_PRESETS[poolPresetIndex].defaultParams.adjustmentStep)
      updateMaHalfTime(POOL_PRESETS[poolPresetIndex].defaultParams.maHalfTime)
    }
  }

  const checkInitialPrice = useMemo(() => {
    if (tokensInPool.tokenAmount === 3) {
      return initialPrice.initialPrice[0] === '0' || initialPrice.initialPrice[1] === '0'
    }
    return initialPrice.initialPrice[0] === '0'
  }, [initialPrice.initialPrice, tokensInPool.tokenAmount])

  return (
    <>
      <Wrapper>
        {/* Presets */}
        <SelectPresetsWrapper>
          <SelectPreset setStableFeeValue={setStableFeeValue} setMidValue={setMidValue} setOutValue={setOutValue} />
        </SelectPresetsWrapper>
        {/* Fees */}
        <BlurWrapper blur={poolPresetIndex === null}>
          <TitleRow flex flexAlignItems={'center'}>
            <SectionTitle>{t`Fees`}</SectionTitle>
            <ResetButton size={'small'} onClick={() => resetFees(poolPresetIndex)}>
              {t`Reset Fees`}
            </ResetButton>
          </TitleRow>
          {swapType === STABLESWAP && (
            <>
              <NumberField
                label={t`Swap Fee (${STABLESWAP_MIN_MAX.swapFee.min}% - ${STABLESWAP_MIN_MAX.swapFee.max}%)`}
                value={+stableFeeValue}
                minValue={STABLESWAP_MIN_MAX.swapFee.min}
                maxValue={STABLESWAP_MIN_MAX.swapFee.max}
                formatOptions={{
                  maximumFractionDigits: 8,
                }}
                onChange={updateStableFeeValue}
              />
            </>
          )}
          {swapType !== STABLESWAP && (
            <>
              <NumberField
                isDisabled={poolPresetIndex === null}
                label={t`Mid Fee: (${CRYPTOSWAP_MIN_MAX.midFee.min}% - ${CRYPTOSWAP_MIN_MAX.midFee.max}%)`}
                value={+midValue}
                onChange={updateMidValue}
                minValue={CRYPTOSWAP_MIN_MAX.midFee.min}
                maxValue={CRYPTOSWAP_MIN_MAX.midFee.max}
                formatOptions={{
                  maximumFractionDigits: 8,
                }}
              />
              <Description>{t`Mid fee governs fees charged during low volatility.`}</Description>
              <NumberField
                isDisabled={poolPresetIndex === null}
                label={t`Out fee: (${midFee}% - ${CRYPTOSWAP_MIN_MAX.outFee.max}%)`}
                defaultValue={+outFee}
                value={+outValue}
                onChange={updateOutValue}
                minValue={+midFee}
                maxValue={CRYPTOSWAP_MIN_MAX.outFee.max}
                formatOptions={{
                  maximumFractionDigits: 8,
                }}
              />
              <Description>{t`Out fee governs fees charged during high volatility.`}</Description>
              <InitialPriceWrapper>
                <TitleRow flex flexAlignItems={'center'}>
                  <SectionTitle>{t`Initial Liquidity Concentration Price`}</SectionTitle>
                  <ResetButton size={'small'} onClick={() => refreshInitialPrice(curve)}>
                    {t`Update Quote`}
                  </ResetButton>
                </TitleRow>
                {(tokensInPool.tokenA.address && tokensInPool.tokenB.address) !== '' && (
                  <Description>{t`Dollar prices are fetched from coingecko.`}</Description>
                )}
                <InitialPrice curve={curve} haveSigner={haveSigner} />
              </InitialPriceWrapper>
              {checkInitialPrice && (
                <TokenWarningBox
                  message={t`Initial price can't be 0. The price fetch didn't return a price. Please enter the token dollar price manually in the input.`}
                />
              )}
            </>
          )}
          {/* Advanced */}
          <>
            <AdvancedParametersWrapper>
              <TitleRow flex flexAlignItems={'center'} flexJustifyContent="space-between">
                <SwitchWrapper>
                  <Switch isActive={!advanced} onChange={() => updateAdvanced(!advanced)} defaultSelected={advanced}>
                    {t`Advanced`}
                  </Switch>
                </SwitchWrapper>
                {advanced && (
                  <ResetButton size={'small'} onClick={() => resetAdvanced()}>
                    {t`Reset advanced`}
                  </ResetButton>
                )}
              </TitleRow>
              {advanced && swapType === STABLESWAP && (
                <>
                  <NumberField
                    label={t`A (${STABLESWAP_MIN_MAX.a.min} - ${STABLESWAP_MIN_MAX.a.max})`}
                    value={+stableA}
                    minValue={STABLESWAP_MIN_MAX.a.min}
                    maxValue={STABLESWAP_MIN_MAX.a.max}
                    onChange={updateStableA}
                  />
                  {network.stableswapFactory && (
                    <>
                      <NumberField
                        label={t`Offpeg Fee Multiplier (${STABLESWAP_MIN_MAX.offpegFeeMultiplier.min} - ${STABLESWAP_MIN_MAX.offpegFeeMultiplier.max})`}
                        value={+offpegFeeMultiplier}
                        minValue={STABLESWAP_MIN_MAX.offpegFeeMultiplier.min}
                        maxValue={STABLESWAP_MIN_MAX.offpegFeeMultiplier.max}
                        onChange={updateOffpegFeeMultiplier}
                      />
                      {/* maExpTime renamed to Moving Average Time to simplify for the user */}
                      <NumberField
                        label={t`Moving Average Time (${STABLESWAP_MIN_MAX.maExpTime.min} - ${STABLESWAP_MIN_MAX.maExpTime.max}) seconds`}
                        value={+maExpTime}
                        minValue={STABLESWAP_MIN_MAX.maExpTime.min}
                        maxValue={STABLESWAP_MIN_MAX.maExpTime.max}
                        onChange={updateMaExpTime}
                        description={`Contract interprets time at a different scale: so, 600 seconds is 600 / log(2), which is 866 when the contract's ma_exp_time method is queried.`}
                      />
                    </>
                  )}
                </>
              )}
              {advanced && swapType !== STABLESWAP && (
                <>
                  <NumberField
                    label={t`A (${CRYPTOSWAP_MIN_MAX.a.min} - ${CRYPTOSWAP_MIN_MAX.a.max})`}
                    value={+cryptoA}
                    minValue={CRYPTOSWAP_MIN_MAX.a.min}
                    maxValue={CRYPTOSWAP_MIN_MAX.a.max}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    onChange={updateCryptoA}
                  />
                  <NumberField
                    label={`Gamma (${new BigNumber(CRYPTOSWAP_MIN_MAX.gamma.min).toString()} - ${new BigNumber(
                      CRYPTOSWAP_MIN_MAX.gamma.max,
                    ).toString()})`}
                    value={+gamma}
                    minValue={CRYPTOSWAP_MIN_MAX.gamma.min}
                    maxValue={CRYPTOSWAP_MIN_MAX.gamma.max}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    onChange={updateGamma}
                  />
                  <NumberField
                    label={t`Allowed Extra Profit (${CRYPTOSWAP_MIN_MAX.allowedExtraProfit.min} - ${CRYPTOSWAP_MIN_MAX.allowedExtraProfit.max})`}
                    value={+allowedExtraProfit}
                    minValue={CRYPTOSWAP_MIN_MAX.allowedExtraProfit.min}
                    maxValue={CRYPTOSWAP_MIN_MAX.allowedExtraProfit.max}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    onChange={updateAllowedExtraProfit}
                  />
                  <NumberField
                    label={t`Fee Gamma (${CRYPTOSWAP_MIN_MAX.feeGamma.min} - ${CRYPTOSWAP_MIN_MAX.feeGamma.max})`}
                    value={+feeGamma}
                    minValue={CRYPTOSWAP_MIN_MAX.feeGamma.min}
                    maxValue={CRYPTOSWAP_MIN_MAX.feeGamma.max}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    onChange={updateFeeGamma}
                  />
                  <NumberField
                    label={t`Adjustment Step (${CRYPTOSWAP_MIN_MAX.adjustmentStep.min} - ${CRYPTOSWAP_MIN_MAX.adjustmentStep.max})`}
                    value={+adjustmentStep}
                    minValue={CRYPTOSWAP_MIN_MAX.adjustmentStep.min}
                    maxValue={CRYPTOSWAP_MIN_MAX.adjustmentStep.max}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    onChange={updateAdjustmentStep}
                  />
                  <NumberField
                    label={t`Moving Average Time (${CRYPTOSWAP_MIN_MAX.maHalfTime.min} - ${CRYPTOSWAP_MIN_MAX.maHalfTime.max}) seconds`}
                    value={+maHalfTime}
                    minValue={CRYPTOSWAP_MIN_MAX.maHalfTime.min}
                    maxValue={CRYPTOSWAP_MIN_MAX.maHalfTime.max}
                    formatOptions={{
                      maximumSignificantDigits: 21,
                      maximumFractionDigits: 21,
                    }}
                    onChange={updateMaHalfTime}
                  />
                </>
              )}
            </AdvancedParametersWrapper>
          </>
        </BlurWrapper>
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  padding: 0 var(--spacing-normal) var(--spacing-wide);
  margin-bottom: var(--spacing-normal);
  min-height: 380px;
  @media (min-width: 33.75rem) {
    padding: var(--spacing-narrow) var(--spacing-normal) var(--spacing-wide);
  }
`

const BlurWrapper = styled.div<{ blur: boolean }>`
  ${(props) => props.blur && 'opacity: 0.6; filter: blur(1px); pointer-events: none;'}
`

const Description = styled.p`
  padding: var(--spacing-2) 0;
  margin: var(--spacing-1) var(--spacing-narrow) var(--spacing-narrow);
  font-size: var(--font-size-1);
  font-style: italic;
  color: var(--box--primary--color);
`

const InitialPriceWrapper = styled.div`
  margin-top: var(--spacing-5);
`

const AdvancedParametersWrapper = styled.div`
  margin-top: var(--spacing-5);
`

const SelectPresetsWrapper = styled.div``

const TitleRow = styled(Box)`
  display: flex;
  flex-direction: row;
  margin-bottom: var(--spacing-narrow);
  margin-top: var(--spacing-5);
`

const ResetButton = styled(Button)`
  background: none;
  color: var(--box--primary--color);
  opacity: 0.7;
  font-size: var(--font-size-1);
  transition:
    background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
    opacity 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  &:hover:not(:disabled),
  &:active:not(:disabled) {
    color: var(--button_filled-hover-contrast--background-color);
  }
`

const SectionTitle = styled.h4`
  color: var(--box--primary--color);
  margin: 0 auto 0 0;
`

const SwitchWrapper = styled.div`
  height: 30.75px;
`
