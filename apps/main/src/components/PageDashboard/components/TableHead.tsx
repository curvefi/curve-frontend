import Box from '@/ui/Box'
import { Th, Thead, TheadSortButton } from '@/ui/Table'
import type { TheadSortButtonProps } from '@/ui/Table/TheadSortButton'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { t } from '@lingui/macro'
import type { FormValues, Order, SortId, TableLabel } from '@/components/PageDashboard/types'

import useStore from '@/store/useStore'


const TableHead = ({
  loading,
  resultRewardsCrvCount,
  resultRewardsOtherCount,
  tableLabel,
  updateFormValues,
}: {
  loading: boolean
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  tableLabel: TableLabel
  updateFormValues: (updatedFormValues: Partial<FormValues>) => void
}) => {
  const isXSmDown = useStore((state) => state.isXSmDown)
  const formValues = useStore((state) => state.dashboard.formValues)

  const handleBtnClickSort = (sortBy: string, sortByOrder: Order) => {
    updateFormValues({ sortBy: sortBy as SortId, sortByOrder: sortByOrder as Order })
  }

  const props: Omit<TheadSortButtonProps<SortId>, 'sortIdKey'> = {
    loading,
    sortBy: formValues.sortBy,
    sortByOrder: formValues.sortByOrder,
    handleBtnClickSort,
  }

  return isXSmDown ? (
    <>
      <colgroup>
        <col className="left" />
      </colgroup>
      <Thead>
        <tr></tr>
      </Thead>
    </>
  ) : (
    <>
      <colgroup>
        <col className="poolName left" />
        <col className="right" />
        <col className="right" />
        <col className="right" />
        <col className="right" />
      </colgroup>
      <Thead>
        <tr>
          <Th className="left">
            <TheadSortButton sortIdKey="poolName" {...props} indicatorPlacement="right">
              {tableLabel.poolName.name}
            </TheadSortButton>
          </Th>
          <Th className="right">
            <Box grid gridRowGap={2}>
              <TheadSortButton sortIdKey="baseApy" {...props}>
                {tableLabel.baseApy.name}{' '}
                <IconTooltip placement="top">{t`Variable APY based on today's trading activity`}</IconTooltip>
              </TheadSortButton>

              <Box grid gridRowGap={1}>
                <div>
                  {t`Rewards tAPR`}{' '}
                  <IconTooltip placement="top">{t`Token APR based on current prices of tokens and reward rates`}</IconTooltip>
                </div>
                <Box grid gridAutoFlow="column" flexAlignItems="center" gridColumnGap={2}>
                  <TheadSortButton disabled={resultRewardsCrvCount === 0} sortIdKey="userCrvApy" nowrap {...props}>
                    {tableLabel.userCrvApy.name}
                  </TheadSortButton>
                  +
                  <TheadSortButton
                    disabled={resultRewardsOtherCount === 0}
                    sortIdKey="incentivesRewardsApy"
                    nowrap
                    {...props}
                  >
                    {tableLabel.incentivesRewardsApy.name}
                  </TheadSortButton>
                </Box>
              </Box>
            </Box>
          </Th>
          <Th className="right">
            <TheadSortButton sortIdKey="liquidityUsd" {...props} indicatorPlacement="left">
              {tableLabel.liquidityUsd.name}
            </TheadSortButton>
          </Th>
          <Th className="right">
            <Box grid gridRowGap={1}>
              <TheadSortButton sortIdKey="baseProfit" {...props}>
                {tableLabel.baseProfit.name}
              </TheadSortButton>
              <TheadSortButton sortIdKey="crvProfit" {...props}>
                {tableLabel.crvProfit.name}
              </TheadSortButton>
            </Box>
          </Th>
          <Th className="right">
            <TheadSortButton sortIdKey="claimableCrv" {...props}>
              {tableLabel.claimableCrv.name}
            </TheadSortButton>
          </Th>
        </tr>
      </Thead>
    </>
  )
}

TableHead.displayName = 'TableHead'

export default TableHead
