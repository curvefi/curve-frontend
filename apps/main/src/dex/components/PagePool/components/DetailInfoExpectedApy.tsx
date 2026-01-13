import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import usePoolTotalStaked from '@/dex/hooks/usePoolTotalStaked'
import { PoolDataCacheOrApi } from '@/dex/types/main.types'
import Box from '@ui/Box'
import { DetailInfo } from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import TooltipIcon from '@ui/Tooltip/TooltipIcon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { weiToEther } from '@ui-kit/utils'

const DetailInfoExpectedApy = ({
  crvApr,
  lpTokenAmount,
  poolDataCacheOrApi,
}: {
  crvApr: number | undefined
  lpTokenAmount: string
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const staked = usePoolTotalStaked(poolDataCacheOrApi)
  const { gaugeTotalSupply } = staked ?? {}

  const [newCrvApr, setNewCrvApr] = useState<{ ratio: number; apr: number } | null>(null)

  useEffect(() => {
    if (crvApr && gaugeTotalSupply && Number(gaugeTotalSupply) > 0 && Number(lpTokenAmount) > 0) {
      const gaugeTotalSupplyInEther = weiToEther(Number(gaugeTotalSupply))
      const newGaugeTotalLocked = Number(lpTokenAmount) + gaugeTotalSupplyInEther
      const newCrvApr = (gaugeTotalSupplyInEther / newGaugeTotalLocked) * crvApr
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewCrvApr({ ratio: crvApr / newCrvApr, apr: newCrvApr })
    } else {
      setNewCrvApr(null)
    }
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
            {formatNumber(crvApr, { style: 'percent', defaultValue: '-' })}
            <Icon name="ArrowRight" size={16} className="svg-arrow" />
            {formatNumber(newCrvApr.apr, { style: 'percent', defaultValue: '-' })}
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

export default DetailInfoExpectedApy
