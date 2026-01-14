import { useMemo } from 'react'
import { styled } from 'styled-components'
import { zeroAddress } from 'viem'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useAbiTotalSupply } from '@/lend/hooks/useAbiTotalSupply'
import { useSupplyTotalApr } from '@/lend/hooks/useSupplyTotalApr'
import { ChainId } from '@/lend/types/lend.types'
import { DetailInfo } from '@ui/DetailInfo'
import { Icon } from '@ui/Icon'
import { TooltipIcon } from '@ui/Tooltip/TooltipIcon'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Data = {
  label: string
  tooltip: string
  skeleton: [number, number]
  aprCurr: string
  aprNew: string
  ratio: number
}

export const DetailInfoCrvIncentives = ({
  rChainId,
  rOwmId,
  lpTokenAmount,
}: {
  rChainId: ChainId
  rOwmId: string
  lpTokenAmount: string
}) => {
  const { tooltipValues } = useSupplyTotalApr(rChainId, rOwmId)
  const gaugeAddress = useOneWayMarket(rChainId, rOwmId).data?.addresses?.gauge
  const gaugeTotalSupply = useAbiTotalSupply(rChainId, gaugeAddress)
  const isGaugeAddressInvalid = gaugeAddress === zeroAddress

  const { crvBase = '', incentivesObj = [] } = tooltipValues ?? {}

  const data = useMemo(() => {
    const data: Data[] = []

    if (!isGaugeAddressInvalid) {
      if (+crvBase > 0) {
        data.push({
          label: t`CRV APR:`,
          tooltip: t`As the number of staked vault shares increases, the CRV APR will decrease.`,
          skeleton: [50, 23],
          ..._getDataApr(crvBase, gaugeTotalSupply, lpTokenAmount),
        })
      }

      if (incentivesObj.length > 0) {
        incentivesObj.forEach(({ apy, symbol }) => {
          data.push({
            label: t`Incentives ${symbol} APR:`,
            tooltip: t`As the number of staked vault shares increases, the ${symbol} APR will decrease.`,
            skeleton: [60, 23],
            ..._getDataApr(apy, gaugeTotalSupply, lpTokenAmount),
          })
        })
      }
    }

    return data
  }, [crvBase, gaugeTotalSupply, incentivesObj, isGaugeAddressInvalid, lpTokenAmount])

  if (data.length === 0 || isGaugeAddressInvalid) {
    return null
  }

  return (
    <>
      {data.map(({ label, tooltip, skeleton, aprCurr, aprNew, ratio }, idx) => (
        <DetailInfo
          key={`${label}${idx}`}
          loading={aprCurr === ''}
          loadingSkeleton={skeleton ?? [140, 23]}
          label={label}
          tooltip={
            <StyledTooltipIcon minWidth="200px" textAlign="left" iconStyles={{ $svgTop: '0.2rem' }}>
              {tooltip}
            </StyledTooltipIcon>
          }
        >
          <strong>{aprCurr}</strong>
          {ratio > 1.25 && (
            <>
              <StyledIcon name="ArrowRight" size={16} /> <strong>{aprNew}</strong>
            </>
          )}{' '}
        </DetailInfo>
      ))}
    </>
  )
}

const StyledTooltipIcon = styled(TooltipIcon)`
  margin-left: var(--spacing-1);
`

const StyledIcon = styled(Icon)`
  margin: 0 var(--spacing-1);
`

function _getDataApr(
  currApr: string | number | undefined = '',
  gaugeTotalSupply: number | null,
  lpTokenAmount: string,
) {
  const resp = { aprCurr: formatNumber(currApr, FORMAT_OPTIONS.PERCENT), aprNew: '', ratio: 0 }

  if (+currApr > 0 && gaugeTotalSupply && +(gaugeTotalSupply || '0') > 0 && +lpTokenAmount > 0) {
    const newGaugeTotalLocked = Number(lpTokenAmount) + gaugeTotalSupply
    const aprNew = (gaugeTotalSupply / newGaugeTotalLocked) * +currApr
    resp.aprNew = formatNumber(aprNew, FORMAT_OPTIONS.PERCENT)
    resp.ratio = +currApr / aprNew
  }
  return resp
}
