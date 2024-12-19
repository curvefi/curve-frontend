import { useRef, useMemo, useCallback } from 'react'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { useButton } from '@react-aria/button'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { getPath } from '@/utils/utilsRouter'

import useStore from '@/store/useStore'

import { breakpoints } from '@/ui/utils/responsive'
import { checkFormReady } from '@/components/PageCreatePool/utils'

import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import InternalLinkButton from '@/ui/InternalLinkButton'
import ExternalLink from '@/ui/Link/ExternalLink'
import { ROUTE } from '@/constants'
import Spinner from 'ui/src/Spinner/Spinner'
import ModalPendingTx from 'ui/src/ModalPendingTx'

import ModalDialog from '@/components/PageCreatePool/ConfirmModal/ModalDialog'
import CreatePoolButton from '@/components/PageCreatePool/ConfirmModal/CreatePoolButton'
import InfoLinkBar from '@/components/PageCreatePool/ConfirmModal/CreateInfoLinkBar'
import PoolTypeSummary from '@/components/PageCreatePool/Summary/PoolTypeSummary'
import TokensInPoolSummary from '@/components/PageCreatePool/Summary/TokensInPoolSummary'
import ParametersSummary from '@/components/PageCreatePool/Summary/ParametersSummary'
import PoolInfoSummary from '@/components/PageCreatePool/Summary/PoolInfoSummary'

type Props = {
  disabled?: boolean
  imageBaseUrl: string
  chainId: ChainId
  curve: CurveApi
  smallScreen?: boolean
  hideOnMediumSize?: boolean
  fixedNavButton?: boolean
}

const ConfirmModal = ({
  disabled,
  imageBaseUrl,
  chainId,
  curve,
  smallScreen,
  fixedNavButton,
  hideOnMediumSize,
}: Props) => {
  const {
    transactionState: { txStatus, txLink, transaction, poolId, fetchPoolStatus },
    tokensInPool,
    poolName,
    userAddedTokens,
    validation,
    resetState,
  } = useStore((state) => state.createPool)

  const navigate = useNavigate()
  const params = useParams()
  const overlayTriggerState = useOverlayTriggerState({})
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const { buttonProps: openButtonProps } = useButton(
    { onPressEnd: () => (!disabled ? overlayTriggerState.open() : null) },
    openButtonRef,
  )

  const modalTitle = useMemo(() => {
    if (txStatus === 'SUCCESS') return t`Pool Creation Complete`
    return t`Confirm Pool Setup`
  }, [txStatus])

  const checkIfUserAddedToken = useCallback(
    () =>
      [
        tokensInPool.tokenA.address,
        tokensInPool.tokenB.address,
        tokensInPool.tokenC.address,
        tokensInPool.tokenD.address,
      ].some((address) => userAddedTokens.some((item) => item.address === address)),
    [
      tokensInPool.tokenA.address,
      tokensInPool.tokenB.address,
      tokensInPool.tokenC.address,
      tokensInPool.tokenD.address,
      userAddedTokens,
    ],
  )

  return (
    <>
      {smallScreen && (
        <SummaryButton
          variant={'icon-outlined'}
          className={
            checkFormReady(validation.poolType, validation.tokensInPool, validation.parameters, validation.poolInfo)
              ? 'form-ready'
              : ''
          }
          onClick={() => overlayTriggerState.open()}
          ref={openButtonRef}
        >
          {t`Summary`}
        </SummaryButton>
      )}
      {fixedNavButton && (
        <NavCreateButton
          variant={'icon-filled'}
          disabled={
            !checkFormReady(validation.poolType, validation.tokensInPool, validation.parameters, validation.poolInfo)
          }
          className={
            checkFormReady(validation.poolType, validation.tokensInPool, validation.parameters, validation.poolInfo)
              ? 'form-ready'
              : ''
          }
          onClick={() => overlayTriggerState.open()}
          ref={openButtonRef}
        >
          {t`Create Pool`}
          {txStatus === 'LOADING' ? (
            <StyledButtonSpinner isDisabled size={14} />
          ) : (
            checkFormReady(
              validation.poolType,
              validation.tokensInPool,
              validation.parameters,
              validation.poolInfo,
            ) && <Icon name={'CheckmarkFilled'} size={16} aria-label={t`Checkmark filled`} />
          )}
        </NavCreateButton>
      )}
      {!fixedNavButton && !smallScreen && (
        <StyledCreateButton
          className={hideOnMediumSize ? 'hide-on-medium-screen-size' : ''}
          variant={'filled'}
          {...openButtonProps}
          ref={openButtonRef}
          disabled={
            !checkFormReady(validation.poolType, validation.tokensInPool, validation.parameters, validation.poolInfo)
          }
          fillWidth
        >
          {t`Create Pool`}
          {txStatus === 'LOADING' && <StyledButtonSpinner isDisabled size={14} />}
        </StyledCreateButton>
      )}
      {overlayTriggerState.isOpen && (
        <StyledModalDialog
          title={modalTitle}
          isOpen
          isDismissable
          onClose={() => overlayTriggerState.close()}
          maxWidth="29rem"
          state={overlayTriggerState}
        >
          <SummaryBox>
            {txStatus === 'SUCCESS' && (
              <>
                <SuccessWrapper>
                  <SuccessBox>
                    <SuccessMessage>{t`Pool ${poolName} was successfully created!`}</SuccessMessage>
                    {fetchPoolStatus === 'SUCCESS' && (
                      <>
                        <SuccessInfo>{t`Visit the new pool to deposit liquidity.`}</SuccessInfo>
                        <StyledLinkButtonWrapper>
                          <InternalLinkButton
                            onClick={() => {
                              navigate(getPath(params, `${ROUTE.PAGE_POOLS}/${poolId}/deposit`))
                              resetState()
                            }}
                            title={t`Go to pool`}
                          />
                        </StyledLinkButtonWrapper>
                      </>
                    )}
                    {fetchPoolStatus === 'LOADING' && (
                      <FetchPoolWrapper>
                        <StyledFetchingSpinner isDisabled size={14} />
                        <FetchingPoolMessage>{t`Fetching new pool...`}</FetchingPoolMessage>
                      </FetchPoolWrapper>
                    )}
                  </SuccessBox>
                </SuccessWrapper>
                {checkIfUserAddedToken() && (
                  <Box margin={'0 var(--spacing-normal)'}>
                    <StyledInfoLinkBar
                      link="https://github.com/curvefi/curve-assets"
                      description={t`Upload an icon for a new token`}
                      theme="plain"
                    />
                  </Box>
                )}
              </>
            )}
            <BlurWrapper>
              {txStatus === 'LOADING' && (
                <ModalPendingTx
                  transactionHash={transaction!.hash}
                  txLink={txLink}
                  pendingMessage={t`Deploying Pool ${poolName}...`}
                />
              )}
              {txStatus !== 'SUCCESS' && (
                <SummaryContent>
                  <PoolTypeSummary />
                  <TokensInPoolSummary imageBaseUrl={imageBaseUrl} chainId={chainId} />
                  <ParametersSummary chainId={chainId} />
                  <PoolInfoSummary chainId={chainId} />
                </SummaryContent>
              )}
            </BlurWrapper>
            <ButtonWrapper>
              <CreatePoolButton
                disabled={
                  !checkFormReady(
                    validation.poolType,
                    validation.tokensInPool,
                    validation.parameters,
                    validation.poolInfo,
                  )
                }
                curve={curve}
              />
            </ButtonWrapper>
          </SummaryBox>
        </StyledModalDialog>
      )}
    </>
  )
}

const StyledModalDialog = styled(ModalDialog)`
  width: 100%;
  min-width: 95vw;
  @media (min-width: 28.125rem) {
    min-width: 28.125rem;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    position: relative;
  }
`

const SummaryButton = styled(Button)`
  padding: var(--spacing-1) var(--spacing-2);
  color: var(--box--primary--color);
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

const NavCreateButton = styled(Button)`
  width: calc(50% - calc(var(--spacing-normal) / 2));
  display: flex;
  align-items: center;
  justify-content: center;
  @media (min-width: 33.75rem) {
    width: calc(50% - calc(var(--spacing-wide) / 2));
  }
  svg {
    margin-left: var(--spacing-1);
  }
`

const StyledCreateButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  &.hide-on-medium-screen-size {
    width: calc(50% - calc(var(--spacing-normal) / 2));
    display: flex;
    align-items: center;
    justify-content: center;
    @media (min-width: 33.75rem) {
      width: calc(50% - calc(var(--spacing-wide) / 2));
    }
    @media (min-width: 68.75rem) {
      display: none;
    }
  }
`

const SummaryBox = styled(Box)`
  padding: var(--spacing-3) 0 var(--spacing-normal);
  background: var(--dialog--background-color);
  /* min-height: 500px; */
  display: flex;
  flex-direction: column;
  margin-bottom: auto;
  @media (min-width: 28.125rem) {
    min-width: 28.125rem;
    margin-bottom: 0;
  }
`

const SummaryContent = styled.div`
  width: 100%;
  padding: 0 var(--spacing-normal);
`

const SuccessWrapper = styled.div`
  margin: auto 0;
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  display: flex;
  flex-direction: column;
`

const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledInfoLinkBar = styled(InfoLinkBar)`
  margin-bottom: var(--spacing-1);
`

const StyledLinkButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: var(--spacing-2) var(--spacing-2) var(--spacing-3);
`

const SuccessMessage = styled.h3`
  text-align: center;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-2);
`

const SuccessInfo = styled.p`
  text-align: center;
  font-size: var(--font-size-2);
  padding: var(--spacing-3) 0 var(--spacing-2);
`

const BlurWrapper = styled.div`
  position: relative;
`

const FetchPoolWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: var(--nav_link--active--hover--background-color);
  color: var(--box--primary--color);
  font-weight: var(--bold);
  padding: var(--spacing-narrow) var(--spacing-normal);
  margin: var(--spacing-3) auto var(--spacing-3);
`

const FetchingPoolMessage = styled.p`
  font-size: var(--font-size-2);
`

const StyledFetchingSpinner = styled(Spinner)`
  margin: 0 var(--spacing-1) 0.1rem 0;
  > div {
    border-color: var(--page--text-color) transparent transparent transparent;
  }
`

const StyledButtonSpinner = styled(Spinner)`
  margin: 0 0 0.1rem var(--spacing-2);
  > div {
    border-color: var(--button--color) transparent transparent transparent;
  }
`

const StyledPendingSpinner = styled(Spinner)`
  margin: var(--spacing-4) auto;
  > div {
    border-color: var(--page--text-color) transparent transparent transparent;
  }
`

const Transaction = styled(ExternalLink)`
  display: flex;
  align-items: center;
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  color: var(--page--text-color);
  text-transform: none;
  text-decoration: none;
  background-color: var(--page--background-color);
  padding: var(--spacing-2);
  p {
    font-weight: var(--bold);
    margin-right: var(--spacing-1);
  }
`

const StyledIcon = styled(Icon)`
  margin: auto 0 auto var(--spacing-1);
  color: var(--page--text-color);
`

const ButtonWrapper = styled.div`
  margin: 0 var(--spacing-normal);
`

export default ConfirmModal
