import type { SignerPoolDetailsResp } from '@/entities/signer'

import React, { useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { usePoolContext } from '@/components/PagePool/contextPool'
import useStore from '@/store/useStore'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { Chip } from '@/ui/Typography'
import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import Table from '@/ui/Table'

type Props = {
  userCrvApy: SignerPoolDetailsResp['crvApy'] | undefined
  userBoostApy: SignerPoolDetailsResp['boostApy'] | undefined
}

const { PERCENT } = FORMAT_OPTIONS

const DetailsCrvApr: React.FC<Props> = ({ userCrvApy, userBoostApy }) => {
  const { rChainId, rPoolId, poolData } = usePoolContext()

  const { gauge } = poolData ?? {}
  const { rewardsNeedNudging, areCrvRewardsStuckInBridge } = gauge?.status || {}

  const rewardsApy = useStore((state) => state.pools.rewardsApyMapper[rChainId]?.[rPoolId])

  const poolCrvApy = rewardsApy?.crv?.[0] ?? 0

  const showStuckInBridgeOrNudge = useMemo(() => {
    const haveCrvRewards = Number(poolCrvApy) > 0
    return haveCrvRewards && (rewardsNeedNudging || areCrvRewardsStuckInBridge)
  }, [areCrvRewardsStuckInBridge, poolCrvApy, rewardsNeedNudging])

  const getCrvTooltipText = useCallback(() => {
    const showTooltip = rChainId === 1

    return (
      <>
        {showTooltip && (
          <CrvRewardsTooltipWrapper>
            <tbody>
              <tr>
                <td className="right">{formatNumber(poolCrvApy, PERCENT)}</td>
                <td>&nbsp;({t`min. CRV tAPR %`})</td>
              </tr>
              <tr>
                <td className="right">x {formatNumber(userBoostApy, PERCENT)}</td>
                <td>&nbsp;({t`your boost`})</td>
              </tr>
              <tr>
                <td className="right">= {formatNumber(userCrvApy, PERCENT)}</td>
                <td>%</td>
              </tr>
            </tbody>
          </CrvRewardsTooltipWrapper>
        )}
      </>
    )
  }, [poolCrvApy, rChainId, userBoostApy, userCrvApy])

  return (
    <>
      {showStuckInBridgeOrNudge && (
        <Chip size="md">
          {t`Your CRV Rewards tAPR:`} <PoolRewardsCrv isHighlight={false} poolData={poolData} rewardsApy={rewardsApy} />
        </Chip>
      )}
      {!showStuckInBridgeOrNudge && (
        <Chip
          size="md"
          tooltip={Number(userCrvApy) > 0 ? getCrvTooltipText() : null}
          tooltipProps={{ minWidth: '350px' }}
        >
          {t`Your CRV Rewards tAPR:`} <strong>{formatNumber(userCrvApy, PERCENT)}</strong>
        </Chip>
      )}
    </>
  )
}

const CrvRewardsTooltipWrapper = styled(Table)`
  tr:last-of-type {
    border-top: 1px solid var(--tooltip--border-color);
  }
  td {
    padding: 0.25rem 0;
  }
`

export default DetailsCrvApr
