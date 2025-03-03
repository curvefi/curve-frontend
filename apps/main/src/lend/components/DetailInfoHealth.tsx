import { t } from '@ui-kit/lib/i18n'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { DEFAULT_HEALTH_MODE } from '@/lend/components/PageLoanManage/utils'
import { formatNumber } from '@ui/utils'
import Box from '@ui/Box'
import DetailInfo from '@ui/DetailInfo'
import ExternalLink from 'ui/src/Link/ExternalLink'
import Icon from '@ui/Icon'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { useOneWayMarket } from '@/lend/entities/chain'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'
import { PageContentProps, HeathColorKey, HealthMode } from '@/lend/types/lend.types'

type FormType = 'create-loan' | 'collateral-decrease' | ''

const DetailInfoHealth = ({
  rChainId,
  rOwmId,
  amount,
  bands,
  formType,
  healthFull,
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
  setHealthMode: Dispatch<SetStateAction<HealthMode>>
}) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const oraclePriceBand = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices?.oraclePriceBand)
  const userLoanDetails = useStore((state) => state.user.loansDetailsMapper[userActiveKey]?.details)

  const [currentHealthMode, setCurrentHealthMode] = useState(DEFAULT_HEALTH_MODE)

  const currentHealthModeColorKey = userLoanDetails?.status?.colorKey
  const newHealthModeColorKey = healthMode?.colorKey

  // new health mode
  useEffect(() => {
    if (typeof oraclePriceBand === 'number' && healthFull) {
      setHealthMode(
        getHealthMode(
          market,
          oraclePriceBand,
          amount,
          bands,
          formType,
          healthFull,
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
    newHealthModeColorKey,
    market,
    setHealthMode,
  ])

  // current health mode
  useEffect(() => {
    if (typeof oraclePriceBand === 'number' && userLoanDetails) {
      const { healthFull, bands } = userLoanDetails
      setCurrentHealthMode(
        getHealthMode(market, oraclePriceBand, amount, bands, formType, healthFull, '', newHealthModeColorKey),
      )
    }
  }, [oraclePriceBand, amount, formType, newHealthModeColorKey, market, userLoanDetails])

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
        <IconTooltip placement="top end" textAlign="left" minWidth="250px">
          <Box grid gridGap={2}>
            <p>{t`The loan metric indicates the current health of your position.`}</p>
            <p>
              {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
              <ExternalLink href="https://resources.curve.fi/lending/overview/#health-hard-liquidation" $noStyles>
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
              {formatNumber(currentHealthMode.percent, { style: 'percent', maximumFractionDigits: 2 })}
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
  market: OneWayMarketTemplate | undefined,
  oraclePriceBand: number | null,
  amount: string,
  bands: [number, number] | number[],
  formType: FormType,
  healthFull: string,
  currColorKey: string,
  newColorKey: string,
) {
  let healthMode: HealthMode = {
    percent: healthFull,
    colorKey: 'healthy',
    icon: <Icon name="FavoriteFilled" size={20} />,
    message: null,
    warningTitle: '',
    warning: '',
  }

  if (helpers.getIsUserCloseToLiquidation(bands?.[0], null, oraclePriceBand)) {
    let message = ''

    if (newColorKey === 'close_to_liquidation') {
      if (currColorKey === newColorKey || currColorKey === 'soft_liquidation') {
        message = t`You are still close to soft liquidation.`
      } else if (newColorKey === 'close_to_liquidation') {
        const formattedAmount = formatNumber(amount)
        const borrowedToken = market?.borrowed_token?.symbol
        if (formType === 'collateral-decrease') {
          message = t`Removing ${formattedAmount} collateral, will put you close to soft liquidation.`
        } else if (formType === 'create-loan') {
          message = t`Borrowing ${formattedAmount} ${borrowedToken} will put you close to soft liquidation.`
        } else {
          message = t`Increasing your borrowed amount by ${formattedAmount} ${borrowedToken} will put you close to soft liquidation.`
        }
      }
    }

    healthMode = {
      percent: healthFull,
      colorKey: 'close_to_liquidation',
      icon: <Icon name="FavoriteHalf" size={20} />,
      message,
      warningTitle: t`Close to liquidation range!`,
      warning: message,
    }
  }

  return healthMode
}
