
import Box from '@/ui/Box'
import useIntersectionObserver from '@/ui/hooks/useIntersectionObserver'
import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'
import { Tr, Td } from '@/ui/Table'
import { Chip } from '@/ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { tooltipProps } from '@/components/PageDashboard/components/Summary'
import TableCellProfit from '@/components/PageDashboard/components/TableCellProfit'
import TableCellRewards from '@/components/PageDashboard/components/TableCellRewards'
import type { TableLabel, WalletPoolData } from '@/components/PageDashboard/types'
import PoolLabel from '@/components/PoolLabel'
import { ROUTE } from '@/constants'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import { getPath } from '@/utils/utilsRouter'

const TableRow = ({
  rChainId,
  tableLabel,
  haveBoost,
  poolData,
  walletAddress,
  walletPoolData,
}: {
  rChainId: ChainId
  tableLabel: TableLabel
  haveBoost: boolean
  poolData: PoolData
  walletAddress: string
  walletPoolData: WalletPoolData
}) => {
  const navigate = useNavigate()
  const rowRef = useRef<HTMLTableRowElement>(null)
  const entry = useIntersectionObserver(rowRef, { freezeOnceVisible: true })

  const formValues = useStore((state) => state.dashboard.formValues)
  const isXSmDown = useStore((state) => state.isXSmDown)
  const routerProps = useStore((state) => state.routerProps)

  const [showDetail, setShowDetail] = useState(false)

  const { params } = routerProps || {}
  const isVisible = entry?.isIntersecting || false
  const imageBaseUrl = getImageBaseUrl(rChainId)

  const handleRowClick = (poolId: string) => {
    if (params) {
      const encodePoolId = encodeURIComponent(poolId)
      navigate(getPath(params, `${ROUTE.PAGE_POOLS}/${encodePoolId}${ROUTE.PAGE_POOL_DEPOSIT}`))
    }
  }

  const handleShowDetailClick = () => {
    setShowDetail((prev) => !prev)
  }

  const {
    poolRewardsApy,
    userCrvApy,
    liquidityUsd,
    baseProfit,
    crvProfit,
    tokensProfit,
    claimableCrv,
    claimableOther,
    percentStaked,
  } = walletPoolData

  const ClaimableTokens = () => (
    <>
      {claimableCrv &&
        claimableCrv.map((t, idx) => <Info key={`${t.symbol}-${idx}`}>{formatNumber(t.amount)} CRV</Info>)}
      {claimableOther?.map((t) => {
        return (
          <Info key={t.symbol}>
            {formatNumber(t.amount)} {t.symbol}
          </Info>
        )
      })}
      {isXSmDown && !claimableCrv && Array.isArray(claimableOther) && claimableOther.length === 0 && t`None`}
    </>
  )

  const LiquidityUsdComp = () => (
    <>
      <Chip isNumber size="md" tooltip={formatNumber(liquidityUsd, FORMAT_OPTIONS.USD)} tooltipProps={tooltipProps}>
        {formatNumber(liquidityUsd, { currency: 'USD', notation: 'compact' })}
      </Chip>
      <div>
        {percentStaked && (
          <DetailText>
            {formatNumber(percentStaked, { ...FORMAT_OPTIONS.PERCENT, trailingZeroDisplay: 'stripIfInteger' })} staked
          </DetailText>
        )}
      </div>
    </>
  )

  const fetchUserPoolBoost = {
    fetchUserPoolBoost: haveBoost
      ? () => networks[rChainId].api.wallet.userPoolBoost(poolData.pool, walletAddress)
      : null,
  }

  return (
    <>
      {isXSmDown ? (
        <Tr ref={rowRef}>
          <Td>
            {walletPoolData && (
              <Box flex flexJustifyContent="space-between">
                {imageBaseUrl && (
                  <PoolLabel
                    isVisible={isVisible}
                    imageBaseUrl={imageBaseUrl}
                    poolData={poolData}
                    poolListProps={{
                      onClick: () => handleRowClick(walletPoolData.poolId),
                    }}
                  />
                )}
                <IconButton onClick={handleShowDetailClick}>
                  {showDetail ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
                </IconButton>
              </Box>
            )}

            <MobileTableContentWrapper className={showDetail ? 'show' : ''}>
              <MobileTableContent>
                <Box grid gridRowGap={2}>
                  <div>
                    <MobileTableTitle>{tableLabel.baseApy.name}</MobileTableTitle>
                    <TableCellRewards
                      poolData={poolData}
                      rewardsApyKey="baseApy"
                      rewardsApy={poolRewardsApy}
                      sortBy={formValues.sortBy}
                      {...fetchUserPoolBoost}
                    />
                  </div>
                  <div>
                    <MobileTableTitle>{tableLabel.userCrvApy.name}</MobileTableTitle>
                    <TableCellRewards
                      poolData={poolData}
                      rewardsApyKey="rewardsApy"
                      rewardsApy={poolRewardsApy}
                      sortBy={formValues.sortBy}
                      userCrvApy={userCrvApy}
                      {...fetchUserPoolBoost}
                    />
                  </div>
                </Box>

                <Box grid gridRowGap={2}>
                  <div>
                    <MobileTableTitle>{tableLabel.baseProfit.name}</MobileTableTitle>
                    <TableCellProfit sortBy={formValues.sortBy} baseProfit={baseProfit} />
                  </div>

                  <div>
                    <MobileTableTitle>{tableLabel.crvProfit.name}</MobileTableTitle>
                    <TableCellProfit sortBy={formValues.sortBy} crvProfit={crvProfit} tokensProfit={tokensProfit} />
                  </div>
                </Box>

                <div className="grid-claimable">
                  <MobileTableTitle>{t`Claimable Tokens`}</MobileTableTitle>
                  <ClaimableTokens />
                </div>

                <div className="grid-balance">
                  <MobileTableTitle>{t`Balance`}</MobileTableTitle>
                  <LiquidityUsdComp />
                </div>
              </MobileTableContent>
            </MobileTableContentWrapper>
          </Td>
        </Tr>
      ) : (
        <Tr ref={rowRef} onClick={() => handleRowClick(walletPoolData.poolId)}>
          <Td>{poolData && <PoolLabel imageBaseUrl={imageBaseUrl} isVisible={isVisible} poolData={poolData} />}</Td>
          <Td className="right">
            <TableCellRewards
              poolData={poolData}
              rewardsApyKey="all"
              rewardsApy={poolRewardsApy}
              sortBy={formValues.sortBy}
              userCrvApy={userCrvApy}
              {...fetchUserPoolBoost}
            />
          </Td>
          <Td className="right">
            <LiquidityUsdComp />
          </Td>
          <Td className="right">
            <TableCellProfit
              sortBy={formValues.sortBy}
              baseProfit={baseProfit}
              crvProfit={crvProfit}
              tokensProfit={tokensProfit}
            />
          </Td>
          <Td className="right">
            <ClaimableTokens />
          </Td>
        </Tr>
      )}
    </>
  )
}

export const DetailText = styled.span`
  font-size: var(--font-size-1);
  opacity: 0.8;
`

TableRow.defaultProps = {
  poolData: {},
  tableData: {},
}

export const Info = styled.div`
  white-space: nowrap;
`

const MobileTableTitle = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--table_head--font-weight);
`

const MobileTableContent = styled.div`
  display: grid;
  padding: 1rem 0.5rem;

  grid-template-columns: repeat(2, 1fr);
  grid-gap: 2rem;
  grid-row-gap: 1rem;

  .grid-claimable {
    grid-column-start: 1;
    grid-column-end: 3;
  }
`

const MobileTableContentWrapper = styled.div`
  max-height: 0;
  overflow: hidden;

  &.show {
    max-height: 100rem;
    transition: max-height 0.5s ease-in;
  }
`

export default TableRow
