import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { curveProps } from '@main/lib/utils'
import useStore from '@main/store/useStore'
import {
  checkSwapType,
  checkTokensInPool,
  checkParameters,
  checkFormReady,
  oraclesReady,
  checkPoolInfo,
} from '@main/components/PageCreatePool/utils'
import { STABLESWAP, CRYPTOSWAP } from '@main/components/PageCreatePool/constants'
import Spinner from '@ui/Spinner'
import Icon from '@ui/Icon'
import Box from '@ui/Box'
import Button from '@ui/Button'
import ConfirmModal from '@main/components/PageCreatePool/ConfirmModal'
import Navigation from '@main/components/PageCreatePool/components/Navigation'
import PoolType from '@main/components/PageCreatePool/PoolType'
import TokensInPool from '@main/components/PageCreatePool/TokensInPool'
import PoolInfo from '@main/components/PageCreatePool/PoolInfo'
import Summary from '@main/components/PageCreatePool/Summary'
import Parameters from '@main/components/PageCreatePool/Parameters'
import InfoBox from '@main/components/PageCreatePool/components/InfoBox'
import { CurveApi, ChainId } from '@main/types/main.types'

type Props = {
  curve: CurveApi
}

const CreatePool = ({ curve }: Props) => {
  const networks = useStore((state) => state.networks.networks)
  const { chainId, haveSigner } = curveProps(curve, networks) as { chainId: ChainId; haveSigner: boolean }
  const {
    poolSymbol,
    swapType,
    poolPresetIndex,
    tokensInPool,
    parameters,
    poolName,
    assetType,
    initialPrice,
    navigationIndex,
    setNavigationIndex,
    validation,
    updatePoolTypeValidation,
    updateTokensInPoolValidation,
    updateParametersValidation,
    updatePoolInfoValidation,
  } = useStore((state) => state.createPool)

  const isNavEnabled = useCallback(() => {
    if (navigationIndex === 0) {
      return validation.poolType
    }
    if (navigationIndex === 1) {
      return validation.tokensInPool
    }
    if (navigationIndex === 3) {
      return validation.parameters
    }
    return true
  }, [navigationIndex, validation.poolType, validation.tokensInPool, validation.parameters])

  useEffect(() => {
    updatePoolTypeValidation(checkSwapType(swapType))
  }, [swapType, updatePoolTypeValidation])

  useEffect(() => {
    if (!chainId) return
    if (swapType === CRYPTOSWAP) {
      updateTokensInPoolValidation(
        checkTokensInPool(
          swapType,
          tokensInPool.tokenA,
          tokensInPool.tokenB,
          tokensInPool.tokenC,
          tokensInPool.tokenD,
          tokensInPool.tokenE,
          tokensInPool.tokenF,
          tokensInPool.tokenG,
          tokensInPool.tokenH,
          networks[chainId].tricryptoFactory,
          networks[chainId].twocryptoFactory,
        ),
      )
    } else {
      updateTokensInPoolValidation(
        checkTokensInPool(
          swapType,
          tokensInPool.tokenA,
          tokensInPool.tokenB,
          tokensInPool.tokenC,
          tokensInPool.tokenD,
          tokensInPool.tokenE,
          tokensInPool.tokenF,
          tokensInPool.tokenG,
          tokensInPool.tokenH,
          networks[chainId].tricryptoFactory,
          networks[chainId].twocryptoFactory,
        ) &&
          oraclesReady([
            tokensInPool.tokenA,
            tokensInPool.tokenB,
            tokensInPool.tokenC,
            tokensInPool.tokenD,
            tokensInPool.tokenE,
            tokensInPool.tokenF,
            tokensInPool.tokenG,
            tokensInPool.tokenH,
          ]),
      )
    }
  }, [
    chainId,
    swapType,
    tokensInPool.tokenA,
    tokensInPool.tokenB,
    tokensInPool.tokenC,
    tokensInPool.tokenD,
    tokensInPool.tokenE,
    tokensInPool.tokenF,
    tokensInPool.tokenG,
    tokensInPool.tokenH,
    updateTokensInPoolValidation,
    networks,
  ])

  useEffect(() => {
    if (!chainId) return
    updateParametersValidation(
      checkParameters(
        swapType,
        parameters.stableSwapFee,
        parameters.midFee,
        initialPrice.initialPrice,
        tokensInPool.tokenAmount,
        tokensInPool.tokenA,
        tokensInPool.tokenB,
        tokensInPool.tokenC,
        networks[chainId].tricryptoFactory,
        poolPresetIndex,
      ),
    )
  }, [
    chainId,
    initialPrice.initialPrice,
    parameters.midFee,
    parameters.stableSwapFee,
    poolPresetIndex,
    swapType,
    tokensInPool.tokenA,
    tokensInPool.tokenAmount,
    tokensInPool.tokenB,
    tokensInPool.tokenC,
    updateParametersValidation,
    networks,
  ])

  useEffect(() => {
    if (!chainId) return
    updatePoolInfoValidation(
      checkPoolInfo(networks[chainId].stableswapFactory, swapType, poolSymbol, poolName, assetType),
    )
  }, [assetType, chainId, poolName, poolSymbol, swapType, updatePoolInfoValidation, networks])

  return (
    <Box flex padding={false} flexJustifyContent={'center'}>
      {!chainId ? (
        <NotAvailableWrapper>
          <StyledSpinner isDisabled size={24} />
          <LoadingMessage>{t`Connecting to network`}</LoadingMessage>
        </NotAvailableWrapper>
      ) : networks[chainId].hasFactory ? (
        <>
          <CreateWrapper>
            <TitleWrapper flex>
              <MainTitle>{t`Pool Creation`}</MainTitle>
              <SmallSummary
                smallScreen
                chainId={chainId}
                curve={curve}
                imageBaseUrl={networks[chainId]?.imageBaseUrl || ''}
              />
            </TitleWrapper>
            {/* Top nav */}
            <Navigation
              navigation={navigationIndex}
              setNavigation={setNavigationIndex}
              chainId={chainId}
              curve={curve}
              imageBaseUrl={networks[chainId]?.imageBaseUrl || ''}
            />
            <CreateBoxStyles flex flexColumn>
              {chainId && (
                <CreateFlowContainer>
                  {navigationIndex === 0 && <PoolType chainId={chainId} />}
                  {navigationIndex === 1 && <TokensInPool curve={curve} chainId={chainId} haveSigner={haveSigner} />}
                  {navigationIndex === 2 && <Parameters curve={curve} chainId={chainId} haveSigner={haveSigner} />}
                  {navigationIndex === 3 && <PoolInfo chainId={chainId} />}
                </CreateFlowContainer>
              )}
            </CreateBoxStyles>
            {navigationIndex === 0 && (
              <InfoBox
                link1={{
                  title: t`Learn more: Creating Stableswap pools`,
                  link: 'https://resources.curve.fi/pool-creation/creating-a-stableswap-pool/',
                }}
                link2={{
                  title: t`Learn more: Creating Cryptoswap pools`,
                  link: 'https://resources.curve.fi/pool-creation/creating-a-cryptoswap-pool/',
                }}
              />
            )}
            {swapType === CRYPTOSWAP && navigationIndex === 2 && (
              <InfoBox
                link1={{
                  title: t`Learn more: Understanding Cryptoswap`,
                  link: 'https://resources.curve.fi/pools/overview/',
                }}
                link2={{
                  title: t`Learn more: Read about Cryptoswap parameters`,
                  link: 'https://nagaking.substack.com/p/deep-dive-curve-v2-parameters',
                }}
              />
            )}
            {swapType === STABLESWAP && navigationIndex === 2 && (
              <InfoBox
                link1={{
                  title: t`Learn more: Understanding Stableswap`,
                  link: 'https://resources.curve.fi/pools/overview/',
                }}
              />
            )}
            {/* Regular nav */}
            <NavButtonsBox>
              {navigationIndex > 0 && (
                <NavButtonStyles variant={'icon-filled'} onClick={() => setNavigationIndex(navigationIndex - 1)}>
                  <Icon name={'ChevronLeft'} size={24} aria-label={t`Chevron left`} /> {t`Previous`}
                </NavButtonStyles>
              )}
              {navigationIndex < 3 && (
                <NavButtonStyles
                  className="next"
                  variant={'icon-filled'}
                  onClick={() => setNavigationIndex(navigationIndex + 1)}
                  disabled={!isNavEnabled()}
                >
                  {t`Next`} <Icon name={'ChevronRight'} size={24} aria-label={t`Chevron right`} />
                </NavButtonStyles>
              )}
              {navigationIndex === 3 && (
                <ConfirmModal
                  hideOnMediumSize
                  disabled={
                    !checkFormReady(
                      validation.poolType,
                      validation.tokensInPool,
                      validation.parameters,
                      validation.poolInfo,
                    )
                  }
                  chainId={chainId}
                  curve={curve}
                  imageBaseUrl={networks[chainId]?.imageBaseUrl || ''}
                />
              )}
            </NavButtonsBox>
          </CreateWrapper>
          {/* Nav for small viewport width */}
          <NavButtonsBoxFixed>
            {navigationIndex > 0 && (
              <NavButtonStyles variant={'icon-filled'} onClick={() => setNavigationIndex(navigationIndex - 1)}>
                <Icon name={'ChevronLeft'} size={24} aria-label={t`Chevron left`} /> {t`Previous`}
              </NavButtonStyles>
            )}
            {navigationIndex < 3 && (
              <NavButtonStyles
                className="next"
                variant={'icon-filled'}
                onClick={() => setNavigationIndex(navigationIndex + 1)}
                disabled={!isNavEnabled()}
              >
                {t`Next`} <Icon name={'ChevronRight'} size={24} aria-label={t`Chevron right`} />
              </NavButtonStyles>
            )}
            {navigationIndex === 3 && (
              <ConfirmModal
                fixedNavButton
                chainId={chainId}
                curve={curve}
                imageBaseUrl={networks[chainId]?.imageBaseUrl || ''}
              />
            )}
          </NavButtonsBoxFixed>
          <DetailsContainer>
            <Summary chainId={chainId} curve={curve} imageBaseUrl={networks[chainId]?.imageBaseUrl || ''} />
          </DetailsContainer>
        </>
      ) : (
        <NotAvailableWrapper>
          <NotAvailableTitle>{t`Pool creation is not yet available on this network.`}</NotAvailableTitle>
        </NotAvailableWrapper>
      )}
    </Box>
  )
}

const CreateWrapper = styled(Box)`
  background: var(--box--primary--content--background-color);
  margin-bottom: var(--footer-create-pool-height);
  justify-content: center;
  @media (min-width: 37.5rem) {
    margin-bottom: auto;
  }
  @media (min-width: 50rem) {
    min-width: 50.375rem;
  }
  @media (min-width: 68.75rem) {
    min-width: auto;
  }
`

const NotAvailableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-5) auto auto;
  background: var(--page--background-color);
  padding: var(--spacing-4) var(--spacing-4);
`

const NotAvailableTitle = styled.h4`
  color: var(--page--text-color);
  padding: 0 var(--spacing-4);
  text-align: center;
`

const LoadingMessage = styled.p`
  font-style: italic;
  font-size: var(--font-size-2);
  color: var(--page--text-color);
  text-align: center;
`

const StyledSpinner = styled(Spinner)`
  color: var(--page--text-color);
  margin: var(--spacing-2) auto;
  > div {
    border-color: var(--page--text-color) transparent transparent transparent;
  }
`

const TitleWrapper = styled(Box)`
  padding: var(--spacing-normal) var(--spacing-wide);
  background: var(--box_header--primary--background-color);
  justify-content: space-between;
  display: none;
  @media (min-width: 39.375rem) {
    display: flex;
    justify-content: space-between;
  }
`

const MainTitle = styled.h3`
  margin: auto 0;
  color: var(--box--primary--color);
`

const SmallSummary = styled(ConfirmModal)`
  padding: var(--spacing-1) var(--spacing-2);
  @media (min-width: 68.75rem) {
    display: none;
  }
  svg {
    margin-left: var(--spacing-1);
  }
  &.form-ready {
    color: var(--nav_link--active--hover--color);
    border-color: var(--nav_link--active--hover--color);
  }
`

const DetailsContainer = styled(Box)`
  display: none;
  @media (min-width: 68.75rem) {
    display: flex;
    background: var(--box--secondary--background-color);
    margin-left: var(--spacing-narrow);
    margin-bottom: auto;
  }
`

const CreateBoxStyles = styled(Box)`
  width: 100vw;
  margin: 0 auto;
  @media (min-width: 50rem) {
    padding: 0 var(--spacing-wide);
  }
  @media (min-width: 46.875rem) {
    width: 700px;
  }
`

const CreateFlowContainer = styled(Box)`
  padding-top: var(--spacing-wide);
`

const NavButtonsBoxFixed = styled.div`
  position: fixed;
  z-index: var(--z-index-page-nav);
  display: flex;
  justify-content: space-between;
  margin-top: calc(100vh - var(--footer-create-pool-height) - var(--header-height));
  width: 100%;
  padding: var(--spacing-narrow) var(--spacing-normal);
  background: var(--box_header--primary--background-color);
  @media (min-width: 39.375rem) {
    display: none;
  }
  .next {
    margin-left: auto;
  }
`

const NavButtonsBox = styled.div`
  display: none;
  @media (min-width: 39.375rem) {
    z-index: var(--z-index-page-nav);
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    width: 100%;
    position: static;
    padding: var(--spacing-3) var(--spacing-wide);
    background: var(--box_header--primary--background-color);
  }
  .next {
    margin-left: auto;
  }
`

const NavButtonStyles = styled(Button)`
  width: calc(50% - calc(var(--spacing-normal) / 2));
  @media (min-width: 39.375rem) {
    width: calc(50% - calc(var(--spacing-wide) / 2));
  }
`

export default CreatePool
