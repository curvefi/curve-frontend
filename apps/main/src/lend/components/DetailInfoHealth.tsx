import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import ExternalLink from 'ui/src/Link/ExternalLink'
import { DEFAULT_HEALTH_MODE } from '@/lend/components/PageLoanManage/utils'
import { useOneWayMarket } from '@/lend/entities/chain'
import useStore from '@/lend/store/useStore'
import { HealthColorKey, HealthMode, PageContentProps } from '@/lend/types/lend.types'
import { getHealthMode } from '@/lend/utils/health.util'
import Box from '@ui/Box'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { useUserLoanDetails } from '../hooks/useUserLoanDetails'

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
  setHealthMode: Dispatch<SetStateAction<HealthMode>>
}) => {
  const market = useOneWayMarket(rChainId, rOwmId).data
  const oraclePriceBand = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId]?.prices?.oraclePriceBand)
  const {
    healthFull: healthFullCurrent,
    healthNotFull: healthNotFullCurrent,
    bands: bandsCurrent,
    status,
  } = useUserLoanDetails(userActiveKey)

  const [currentHealthMode, setCurrentHealthMode] = useState(DEFAULT_HEALTH_MODE)

  const currentHealthModeColorKey = status?.colorKey
  const newHealthModeColorKey = healthMode?.colorKey

  // new health mode
  useEffect(() => {
    if (typeof oraclePriceBand === 'number' && healthFull && healthNotFull) {
      setHealthMode(
        getHealthMode(
          market,
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
    market,
    setHealthMode,
  ])

  // current health mode
  useEffect(() => {
    if (typeof oraclePriceBand === 'number' && bandsCurrent && healthFullCurrent && healthNotFullCurrent) {
      setCurrentHealthMode(
        getHealthMode(
          market,
          oraclePriceBand,
          amount,
          bandsCurrent,
          formType,
          healthFullCurrent,
          healthNotFullCurrent,
          '',
          newHealthModeColorKey,
        ),
      )
    }
  }, [
    oraclePriceBand,
    amount,
    formType,
    newHealthModeColorKey,
    market,
    bandsCurrent,
    healthFullCurrent,
    healthNotFullCurrent,
  ])

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
              <ExternalLink href="https://resources.curve.finance/lending/overview/#health-hard-liquidation" $noStyles>
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

const HealthPercent = styled.span<{ colorKey: HealthColorKey }>`
  color: ${({ colorKey }) => `var(--health_mode_${colorKey}_darkBg--color)`};
`

export default DetailInfoHealth
