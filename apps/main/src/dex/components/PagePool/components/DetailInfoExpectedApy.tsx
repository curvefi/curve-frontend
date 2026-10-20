import { useMemo } from 'react'
import { styled } from 'styled-components'
import { getAddress } from 'viem'
import { usePoolTotalStaked } from '@/dex/queries/pool-total-staked.query'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { weiToEther } from '@evm-ui/utils'
import { Box } from '@legacy-ui/Box'
import { DetailInfo } from '@legacy-ui/DetailInfo'
import { TooltipIcon } from '@legacy-ui/Tooltip/TooltipIcon'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import type { QueryProp } from '@ui/features/queries/util'
import { ArrowRightIcon } from '@ui/icons/ArrowRightIcon'
import { t } from '@ui/lib/i18n'

export const DetailInfoExpectedApy = ({
  crvApr,
  lpTokenAmount,
  pool: { data: pool },
}: {
  crvApr: number | undefined
  lpTokenAmount: string
  pool: QueryProp<PoolTemplate>
}) => {
  const { data: staked } = usePoolTotalStaked({
    chainId: pool?.curve.chainId,
    poolAddress: maybe(pool?.address, getAddress),
  })
  const { gaugeTotalSupply } = staked ?? {}

  const newCrvApr = useMemo(() => {
    if (crvApr && gaugeTotalSupply && Number(gaugeTotalSupply) > 0 && Number(lpTokenAmount) > 0) {
      const gaugeTotalSupplyInEther = weiToEther(Number(gaugeTotalSupply))
      const newGaugeTotalLocked = Number(lpTokenAmount) + gaugeTotalSupplyInEther
      const newCrvApr = (gaugeTotalSupplyInEther / newGaugeTotalLocked) * crvApr
      return { ratio: crvApr / newCrvApr, apr: newCrvApr }
    }
    return null
  }, [crvApr, gaugeTotalSupply, lpTokenAmount])

  return (
    <>
      {crvApr && newCrvApr && newCrvApr.ratio > 1.25 ? (
        <DetailInfo
          isBold
          loading={false}
          loadingSkeleton={[140, 23]}
          label={t`Expected CRV tAPR:`}
          tooltip={
            <TooltipIcon minWidth="200px">{t`As the number of staked LP Tokens increases, the CRV tAPR will decrease.`}</TooltipIcon>
          }
        >
          <StyledBox>
            {formatNumber(crvApr, 'percent.value')}
            <ArrowRightIcon sx={{ fontSize: 16 }} className="svg-arrow" />
            {formatNumber(newCrvApr.apr, 'percent.value')}
          </StyledBox>
        </DetailInfo>
      ) : null}
    </>
  )
}

const StyledBox = styled(Box)`
  position: relative;
  top: -1px;

  svg {
    margin: 0 0.25rem;
  }
`
