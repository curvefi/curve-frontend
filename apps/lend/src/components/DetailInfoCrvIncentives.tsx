import { t } from '@lingui/macro'

import React, { useMemo } from 'react'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { INVALID_ADDRESS } from '@/constants'
import useAbiTotalSupply from '@/hooks/useAbiTotalSupply'
import useStore from '@/store/useStore'
import useSupplyTotalApr from '@/hooks/useSupplyTotalApr'

import DetailInfo from '@/ui/DetailInfo'
import Icon from '@/ui/Icon'
import TooltipIcon from '@/ui/Tooltip/TooltipIcon'

type Data = {
  label: string
  tooltip: string
  skeleton: [number, number]
  aprCurr: string
  aprNew: string
  ratio: number
}

const DetailInfoCrvIncentives = ({
  rChainId,
  rOwmId,
  lpTokenAmount,
}: {
  rChainId: ChainId
  rOwmId: string
  lpTokenAmount: string
}) => {
  const { tooltipValues } = useSupplyTotalApr(rChainId, rOwmId)
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const { gauge: gaugeAddress } = owmData?.owm?.addresses ?? {}
  const gaugeTotalSupply = useAbiTotalSupply(rChainId, gaugeAddress)
  const isGaugeAddressInvalid = gaugeAddress === INVALID_ADDRESS

  const { crvBase = '', incentivesObj = [] } = tooltipValues ?? {}

  const data = useMemo(() => {
    let data: Data[] = []

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
      {data.map(({ label, tooltip, skeleton, aprCurr, aprNew, ratio }, idx) => {
        return (
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
        )
      })}
    </>
  )
}

const StyledTooltipIcon = styled(TooltipIcon)`
  margin-left: var(--spacing-1);
`

const StyledIcon = styled(Icon)`
  margin: 0 var(--spacing-1);
`

export default DetailInfoCrvIncentives

function _getDataApr(
  currApr: string | number | undefined = '',
  gaugeTotalSupply: number | null,
  lpTokenAmount: string
) {
  let resp = { aprCurr: formatNumber(currApr, FORMAT_OPTIONS.PERCENT), aprNew: '', ratio: 0 }

  if (+currApr > 0 && gaugeTotalSupply && +(gaugeTotalSupply || '0') > 0 && +lpTokenAmount > 0) {
    const newGaugeTotalLocked = Number(lpTokenAmount) + gaugeTotalSupply
    const aprNew = (gaugeTotalSupply / newGaugeTotalLocked) * +currApr
    resp.aprNew = formatNumber(aprNew, FORMAT_OPTIONS.PERCENT)
    resp.ratio = +currApr / aprNew
  }
  return resp
}
