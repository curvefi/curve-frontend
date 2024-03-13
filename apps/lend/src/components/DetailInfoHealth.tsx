import { t } from '@lingui/macro'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_HEALTH_MODE } from '@/components/PageLoanManage/utils'
import { formatNumber } from '@/ui/utils'

import DetailInfo from '@/ui/DetailInfo'
import Icon from '@/ui/Icon'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { helpers } from '@/lib/apiLending'
import useStore from '@/store/useStore'

type FormType = 'create-loan' | 'collateral-decrease' | ''

const DetailInfoHealth = ({
  rChainId,
  rOwmId,
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
  userActiveKey,
  setHealthMode,
}: Pick<PageContentProps, 'rChainId' | 'rOwmId' | 'userActiveKey'> & {
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
  setHealthMode: React.Dispatch<React.SetStateAction<HealthMode>>
}) => {
  const loanDetailsBands = useStore((state) => state.markets.statsBandsMapper[rChainId]?.[rOwmId]?.bands)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)

  const [currentHealthMode, setCurrentHealthMode] = useState(DEFAULT_HEALTH_MODE)

  const { activeBand } = loanDetailsBands ?? {}
  const currentHealthModeColorKey = userLoanDetails?.status?.colorKey
  const newHealthModeColorKey = healthMode?.colorKey

  // new health mode
  useEffect(() => {
    if (typeof activeBand !== 'undefined' && healthFull && healthNotFull) {
      setHealthMode(
        getHealthMode(
          activeBand,
          amount,
          bands,
          formType,
          healthFull,
          healthNotFull,
          true,
          currentHealthModeColorKey ?? '',
          newHealthModeColorKey ?? ''
        )
      )
    } else {
      setHealthMode(DEFAULT_HEALTH_MODE)
    }
  }, [
    activeBand,
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
    if (typeof activeBand !== 'undefined' && userLoanDetails) {
      const { healthFull, healthNotFull, bands } = userLoanDetails
      setCurrentHealthMode(
        getHealthMode(activeBand, amount, bands, formType, healthFull, healthNotFull, false, '', newHealthModeColorKey)
      )
    }
  }, [activeBand, amount, formType, newHealthModeColorKey, userLoanDetails])

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
        <IconTooltip placement="top end">
          {t`The loan metric indicates the current health of your position.`}
        </IconTooltip>
      }
    >
      {isValidFormValues && isManage ? (
        healthPercent && currentHealthMode.percent ? (
          <span>
            <HealthPercent colorKey={currentHealthMode.colorKey}>
              {formatNumber(healthPercent, { style: 'percent', maximumFractionDigits: 2 })}
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

const HealthPercent = styled.span<{ colorKey: HeathColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}_darkBg--color)`};
`

export default DetailInfoHealth

// 1. If health(full=true) < loan_discount, user is at risk to go from healthy mode to soft liquidation mode (green —> orange).
// 2. If health(full=false) < liquidation_discount , user is at risk to go from soft liquidation mode to hard liquidation mode (orange —> red).
export function getHealthMode(
  activeBand: number | null,
  amount: string,
  bands: [number, number] | number[],
  formType: FormType,
  healthFull: string,
  healthNotFull: string,
  isNew: boolean,
  currColorKey: string,
  newColorKey: string
) {
  let healthMode: HealthMode = {
    percent: healthFull,
    colorKey: 'healthy',
    icon: <Icon name="FavoriteFilled" size={20} />,
    message: null,
    warningTitle: '',
    warning: '',
  }

  if (helpers.getIsUserCloseToLiquidation(bands?.[0], null, activeBand)) {
    let message = ''

    if (newColorKey === 'close_to_liquidation') {
      if (currColorKey === newColorKey || currColorKey === 'soft_liquidation') {
        message = t`You are still close to soft liquidation.`
      } else if (newColorKey === 'close_to_liquidation') {
        const formattedAmount = formatNumber(amount)
        if (formType === 'collateral-decrease') {
          message = t`Removing ${formattedAmount} collateral, will put you close to soft liquidation.`
        } else if (formType === 'create-loan') {
          message = t`Borrowing ${formattedAmount} will put you close to soft liquidation.`
        } else {
          message = t`Increasing your borrowed amount by ${formattedAmount} will put you close to soft liquidation.`
        }
      }
    }

    healthMode = {
      percent: healthNotFull,
      colorKey: 'close_to_liquidation',
      icon: <Icon name="FavoriteHalf" size={20} />,
      message,
      warningTitle: t`Close to liquidation range!`,
      warning: message,
    }
  }

  return healthMode
}
