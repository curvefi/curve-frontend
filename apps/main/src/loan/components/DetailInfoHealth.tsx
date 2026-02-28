import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { DEFAULT_HEALTH_MODE } from '@/llamalend/constants'
import { DEFAULT_BORROW_TOKEN_SYMBOL, getHealthMode } from '@/llamalend/health.util'
import type { HealthColorKey, HealthMode } from '@/llamalend/llamalend.types'
import { LoanDetails, UserLoanDetails } from '@/loan/types/loan.types'
import { parseHealthPercent } from '@/loan/utils/utilsLoan'
import { Box } from '@ui/Box'
import { DetailInfo } from '@ui/DetailInfo'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type FormType = 'create-loan' | 'collateral-decrease' | ''

export const DetailInfoHealth = ({
  amount,
  bands,
  formType,
  healthFull,
  healthNotFull,
  healthMode,
  isPayoff,
  isManage,
  isValidFormValues = true,
  loading,
  loanDetails,
  userLoanDetails,
  setHealthMode,
}: {
  amount: string
  bands: [number, number]
  formType: FormType
  healthFull: string
  healthNotFull: string
  healthMode: HealthMode
  isPayoff?: boolean
  isManage: boolean
  isValidFormValues?: boolean
  loading: boolean
  loanDetails: Partial<LoanDetails> | undefined
  userLoanDetails: UserLoanDetails | undefined
  setHealthMode: Dispatch<SetStateAction<HealthMode>>
}) => {
  const [currentHealthMode, setCurrentHealthMode] = useState(DEFAULT_HEALTH_MODE)

  const { oraclePriceBand } = loanDetails ?? {}
  const currentHealthModeColorKey = userLoanDetails?.userStatus?.colorKey
  const newHealthModeColorKey = healthMode?.colorKey

  // new health mode
  useEffect(() => {
    if (typeof oraclePriceBand !== 'undefined' && healthFull && healthNotFull) {
      setHealthMode(
        getHealthMode(
          DEFAULT_BORROW_TOKEN_SYMBOL,
          oraclePriceBand,
          amount,
          bands,
          formType,
          healthFull,
          healthNotFull,
          currentHealthModeColorKey ?? '',
          newHealthModeColorKey ?? '',
        ),
      )
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [
    oraclePriceBand,
    amount,
    bands,
    currentHealthModeColorKey,
    formType,
    healthFull,
    healthNotFull,
    newHealthModeColorKey,
    setHealthMode,
  ])

  // current health mode
  useEffect(() => {
    if (typeof oraclePriceBand !== 'undefined' && userLoanDetails) {
      const { healthFull, healthNotFull, userBands } = userLoanDetails
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentHealthMode(
        getHealthMode(
          DEFAULT_BORROW_TOKEN_SYMBOL,
          oraclePriceBand,
          amount,
          userBands,
          formType,
          healthFull,
          healthNotFull,
          '',
          newHealthModeColorKey,
        ),
      )
    }
  }, [oraclePriceBand, amount, formType, newHealthModeColorKey, userLoanDetails])

  const healthPercent = useMemo(() => {
    if (healthMode.percent) {
      return formatNumber(healthMode.percent, { style: 'percent', maximumFractionDigits: 2 })
    }
    return ''
  }, [healthMode.percent])

  return (
    <DetailInfo
      loading={loading}
      loadingSkeleton={[85, 20]}
      label={t`Health:`}
      tooltip={
        <IconTooltip clickable placement="top-end" textAlign="left" minWidth="250px">
          <Box grid gridGap={2}>
            <p>{t`The loan metric indicates the current health of your position.`}</p>
            <p>
              {t`Hard liquidation may be triggered when health is 0 or below.`}{' '}
              <ExternalLink href="https://docs.curve.finance/user/llamalend/liquidation-protection/how-it-works#stage-2-full-liquidation" $noStyles>
                Click here to learn more.
              </ExternalLink>
            </p>
          </Box>
        </IconTooltip>
      }
    >
      {isValidFormValues && isManage ? (
        healthPercent && currentHealthMode.percent ? (
          <span>
            <HealthPercent colorKey={currentHealthMode.colorKey}>
              {parseHealthPercent(currentHealthMode.percent)}
            </HealthPercent>{' '}
            <HealthPercent colorKey={healthMode.colorKey}>
              <Icon name="ArrowRight" size={16} className="svg-arrow" />{' '}
              {isPayoff ? '-' : <strong>{healthPercent}</strong>}
            </HealthPercent>
          </span>
        ) : (
          '-%'
        )
      ) : isValidFormValues && healthPercent ? (
        <strong>
          <HealthPercent colorKey={healthMode.colorKey}>{healthPercent}</HealthPercent>
        </strong>
      ) : (
        '-%'
      )}{' '}
    </DetailInfo>
  )
}

const HealthPercent = styled.span<{ colorKey: HealthColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}_darkBg--color)`};
`
