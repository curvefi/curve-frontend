import type { FormValues, FormStatus, StepKey } from '@/components/PageLoanCreate/LoanFormCreate/types'
import type { Step } from '@/ui/Stepper/types'

import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { formatNumber } from '@/ui/utils'
import { helpers } from '@/lib/apiLending'
import { getLoanManagePathname } from '@/utils/utilsRouter'
import { useParams } from 'react-router-dom'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { StyledInpChip } from '@/components/PageLoanManage/styles'
import Accordion from '@/ui/Accordion'
import AlertBox from '@/ui/AlertBox'
import AlertFormError from '@/components/AlertFormError'
import Box from '@/ui/Box'
import DetailInfo from '@/components/PageLoanCreate/LoanFormCreate/components/DetailInfo'
import DialogHealthWarning from '@/components/DialogHealthWarning'
import InputProvider, { InputDebounced, InputMaxBtn } from '@/ui/InputComp'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import InternalLink from '@/ui/Link/InternalLink'
import LinkButton from '@/ui/LinkButton'
import LoanFormConnect from '@/components/LoanFormConnect'
import MarketParameters from '@/components/DetailsMarket/components/MarketParameters'
import Stepper from '@/ui/Stepper'
import TextCaption from '@/ui/TextCaption'
import TxInfoBar from '@/ui/TxInfoBar'

const LoanCreate = (props: PageContentProps) => {
  const { rChainId, rOwmId, isLoaded, api, owmData, userActiveKey, borrowed_token, collateral_token } = props
  const isSubscribed = useRef(false)
  const params = useParams()

  const activeKey = useStore((state) => state.loanCreate.activeKey)
  const activeKeyLiqRange = useStore((state) => state.loanCreate.activeKeyLiqRange)
  const formEstGas = useStore((state) => state.loanCreate.formEstGas[activeKey])
  const formStatus = useStore((state) => state.loanCreate.formStatus)
  const formValues = useStore((state) => state.loanCreate.formValues)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])
  const maxRecv = useStore((state) => state.loanCreate.maxRecv[activeKey])
  const maxSlippage = useStore((state) => state.maxSlippage)
  const userBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const fetchStepApprove = useStore((state) => state.loanCreate.fetchStepApprove)
  const fetchStepCreate = useStore((state) => state.loanCreate.fetchStepCreate)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const resetState = useStore((state) => state.loanCreate.resetState)

  const [confirmedHealthWarning, setConfirmHealthWarning] = useState(false)
  const [healthMode, setHealthMode] = useState(DEFAULT_HEALTH_MODE)
  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = api ?? {}
  const { owm } = owmData ?? {}

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues(rChainId, isLoaded ? api : null, owmData, updatedFormValues, maxSlippage, isAdvanceMode)
    },
    [setFormValues, rChainId, isLoaded, api, owmData, maxSlippage, isAdvanceMode]
  )

  const reset = useCallback(
    (updatedFormValues: Partial<FormValues>, isFullReset: boolean) => {
      setConfirmHealthWarning(false)
      setTxInfoBar(null)
      updateFormValues(updatedFormValues)

      if (isFullReset) {
        setHealthMode(DEFAULT_HEALTH_MODE)
      }
    },
    [updateFormValues]
  )

  const handleInpChange = (name: 'collateral' | 'debt', value: string) => {
    const updatedFormValues: Partial<FormValues> = { [name]: value }
    reset(updatedFormValues, formStatus.isComplete)
  }

  const handleClickCreate = useCallback(
    async (payloadActiveKey: string, api: Api, formValues: FormValues, owmData: OWMData, maxSlippage: string) => {
      const { owm } = owmData

      const notifyMessage = t`deposit ${formValues.collateral} ${owm.collateral_token.symbol}, borrowing ${formValues.debt} ${owm.borrowed_token.symbol}`
      const notify = notifyNotification(`Please confirm ${notifyMessage}`, 'pending')
      setTxInfoBar(<AlertBox alertType="info">Pending {notifyMessage}</AlertBox>)

      const resp = await fetchStepCreate(payloadActiveKey, api, owmData, formValues, maxSlippage)

      if (isSubscribed.current && resp && resp.hash && resp.activeKey === activeKey && !resp.error) {
        const txMessage = t`Transaction complete.`
        setTxInfoBar(<TxInfoBar description={txMessage} txHash={networks[rChainId].scanTxPath(resp.hash)} />)
      }
      if (resp?.error) setTxInfoBar(null)
      if (notify && typeof notify.dismiss === 'function') notify.dismiss()
    },
    [activeKey, fetchStepCreate, notifyNotification, rChainId]
  )

  const getSteps = useCallback(
    (
      payloadActiveKey: string,
      api: Api,
      owmData: OWMData,
      healthMode: HealthMode,
      confirmedHealthWarning: boolean,
      formStatus: FormStatus,
      formValues: FormValues,
      maxSlippage: string,
      steps: Step[]
    ) => {
      const { signerAddress } = api
      const { owm } = owmData
      const { collateral, collateralError, debt, debtError, n } = formValues
      const { isApproved, isComplete, isInProgress, error, step } = formStatus

      const isValid =
        !!signerAddress &&
        +collateral > 0 &&
        !collateralError &&
        +debt > 0 &&
        !debtError &&
        !error &&
        +maxRecv > 0 &&
        !!healthMode.percent

      const stepsObj: { [key: string]: Step } = {
        APPROVAL: {
          key: 'APPROVAL',
          status: helpers.getStepStatus(isApproved, step === 'APPROVAL', isValid),
          type: 'action',
          content: isApproved ? t`Spending Approved` : t`Approve Spending`,
          onClick: async () => {
            const notifyMessage = t`Please approve spending your ${owm.collateral_token.symbol}.`
            const notify = notifyNotification(notifyMessage, 'pending')

            await fetchStepApprove(payloadActiveKey, api, owmData, formValues, maxSlippage)
            if (notify && typeof notify.dismiss === 'function') notify.dismiss()
          },
        },
        CREATE: {
          key: 'CREATE',
          status: helpers.getStepStatus(isComplete, step === 'CREATE', isValid && !!n && isApproved),
          type: 'action',
          content: isComplete ? t`Loan Received` : t`Get Loan`,
          ...(healthMode.message
            ? {
                modal: {
                  title: t`Warning!`,
                  content: (
                    <DialogHealthWarning
                      {...healthMode}
                      confirmed={confirmedHealthWarning}
                      setConfirmed={(val) => setConfirmHealthWarning(val)}
                    />
                  ),
                  isDismissable: false,
                  cancelBtnProps: {
                    label: t`Cancel`,
                    onClick: () => setConfirmHealthWarning(false),
                  },
                  primaryBtnProps: {
                    onClick: () => handleClickCreate(payloadActiveKey, api, formValues, owmData, maxSlippage),
                    disabled: !confirmedHealthWarning,
                  },
                  primaryBtnLabel: 'Create anyway',
                },
              }
            : {
                onClick: async () => handleClickCreate(payloadActiveKey, api, formValues, owmData, maxSlippage),
              }),
        },
      }

      let stepsKey: StepKey[]

      if (isInProgress || isComplete) {
        stepsKey = steps.map((s) => s.key as StepKey)
      } else {
        stepsKey = isApproved ? ['CREATE'] : ['APPROVAL', 'CREATE']
      }

      return stepsKey.map((k) => stepsObj[k])
    },
    [fetchStepApprove, handleClickCreate, maxRecv, notifyNotification]
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
      resetState()
    }
  }, [resetState])

  // steps
  useEffect(() => {
    if (isLoaded && api && owmData) {
      let updatedSteps = getSteps(
        activeKey,
        api,
        owmData,
        healthMode,
        confirmedHealthWarning,
        formStatus,
        formValues,
        maxSlippage,
        steps
      )
      setSteps(updatedSteps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    confirmedHealthWarning,
    healthMode?.percent,
    owmData?.owm?.id,
    signerAddress,
    formEstGas?.loading,
    formStatus,
    formValues,
    maxRecv,
    maxSlippage,
  ])

  // signerAddress, maxSlippage state change
  useEffect(() => {
    if (isLoaded) updateFormValues({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, maxSlippage, isAdvanceMode])

  const disabled = formStatus.isInProgress

  return (
    <>
      {/* field collateral */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.collateralError ? 'error' : undefined}
          disabled={disabled}
          id="collateral"
        >
          <InputDebounced
            id="inpCollateralAmt"
            type="number"
            labelProps={{
              label: t`${collateral_token?.symbol} Avail.`,
              descriptionLoading: !!signerAddress && typeof userBalances === 'undefined',
              description: formatNumber(userBalances?.collateral, { defaultValue: '-' }),
            }}
            value={formValues.collateral}
            onChange={(val) => handleInpChange('collateral', val)}
          />
          <InputMaxBtn onClick={() => handleInpChange('collateral', userBalances?.collateral ?? '')} />
        </InputProvider>
        <InpChipUsdRate address={collateral_token?.address} amount={formValues.collateral} />

        <StyledInpChip size="xs" isDarkBg isError>
          {formValues.collateralError === 'too-much-wallet' &&
            t`Amount > wallet balance ${formatNumber(userBalances?.collateral)}`}
        </StyledInpChip>
      </Box>

      {/* field debt */}
      <Box grid gridRowGap={1}>
        <InputProvider
          grid
          gridTemplateColumns="1fr auto"
          padding="4px 8px"
          inputVariant={formValues.debtError ? 'error' : undefined}
          disabled={disabled}
          id="debt"
        >
          <InputDebounced
            id="inpDebt"
            type="number"
            labelProps={{
              label: t`${borrowed_token?.symbol} borrow amount`,
            }}
            value={formValues.debt}
            onChange={(val) => handleInpChange('debt', val)}
          />
          <InputMaxBtn onClick={() => handleInpChange('debt', maxRecv ?? '')} />
        </InputProvider>
        <InpChipUsdRate address={borrowed_token?.address} amount={formValues.debt} />
        {formValues.debtError === 'too-much-debt' ? (
          <StyledInpChip size="xs" isDarkBg isError>
            {t`Amount > max borrow amount`} {formatNumber(maxRecv, { defaultValue: '-' })}
          </StyledInpChip>
        ) : (
          <StyledInpChip size="xs">
            {t`Max borrow amount`} {formatNumber(maxRecv, { defaultValue: '-' })}
          </StyledInpChip>
        )}
      </Box>

      {/* detail info */}
      <DetailInfo
        {...props}
        activeKey={activeKey}
        activeKeyLiqRange={activeKeyLiqRange}
        formEstGas={formEstGas}
        formValues={formValues}
        healthMode={healthMode}
        isAdvanceMode={isAdvanceMode}
        steps={steps}
        setHealthMode={setHealthMode}
        updateFormValues={updateFormValues}
      />

      {/* actions */}
      {signerAddress && typeof loanExistsResp !== 'undefined' && loanExistsResp.loanExists && !formStatus.isComplete ? (
        <AlertBox alertType="info">
          <div>
            A loan has been found for this market.{' '}
            <InternalLink $noStyles href={getLoanManagePathname(params, rOwmId, 'loan')}>
              Click here
            </InternalLink>{' '}
            to manage it.
          </div>
        </AlertBox>
      ) : (
        <LoanFormConnect haveSigner={!!signerAddress} loading={!api}>
          {formStatus.warning === 'warning-loan-exists' && owm ? (
            <AlertBox alertType="info">{t`Transaction complete`}</AlertBox>
          ) : healthMode.message ? (
            <AlertBox alertType="warning">{healthMode.message}</AlertBox>
          ) : formStatus.error ? (
            <AlertFormError errorKey={formStatus.error} handleBtnClose={() => reset({}, false)} />
          ) : null}

          {txInfoBar}
          {steps && <Stepper steps={steps} />}
          {formStatus.isComplete && owm && (
            <LinkButton variant="filled" size="large" to={getLoanManagePathname(params, owm.id, 'loan')}>
              Manage loan
            </LinkButton>
          )}
        </LoanFormConnect>
      )}

      {!isAdvanceMode && (
        <Accordion btnLabel={<TextCaption isCaps isBold>{t`Market details`}</TextCaption>}>
          <MarketParameters rChainId={rChainId} rOwmId={rOwmId} type="borrow" />
        </Accordion>
      )}
    </>
  )
}

export default LoanCreate
