import styled from 'styled-components'
import { t } from '@lingui/macro'

import { formatNumber, formatDateFromTimestamp, convertToLocaleTimestamp } from '@/ui/utils/'
import SubTitleColumn, { SubTitleColumnData } from '@/components/SubTitleColumn'
import Box from '@/ui/Box'

interface UserStatsProps {
  veCrvHolder: VeCrvHolder
  holdersLoading: boolean
}

const UserStats = ({ veCrvHolder, holdersLoading }: UserStatsProps) => {
  return (
    <Wrapper>
      <SubTitleColumn
        loading={holdersLoading}
        title={t`veCRV`}
        data={
          <SubTitleColumnData>
            {formatNumber(veCrvHolder.weight, { showDecimalIfSmallNumberOnly: true })}
          </SubTitleColumnData>
        }
      />
      <SubTitleColumn
        loading={holdersLoading}
        title={t`Locked CRV`}
        data={
          <SubTitleColumnData>
            {formatNumber(veCrvHolder.locked, { showDecimalIfSmallNumberOnly: true })}
          </SubTitleColumnData>
        }
      />
      <SubTitleColumn
        loading={holdersLoading}
        title={t`Weight Ratio`}
        data={<SubTitleColumnData>{formatNumber(veCrvHolder.weight_ratio)}%</SubTitleColumnData>}
      />
      <SubTitleColumn
        loading={holdersLoading}
        title={t`Unlock Time`}
        data={
          <SubTitleColumnData>
            {veCrvHolder.unlock_time
              ? formatDateFromTimestamp(convertToLocaleTimestamp(new Date(veCrvHolder.unlock_time).getTime()))
              : 'N/A'}
          </SubTitleColumnData>
        }
      />
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-4);
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--gray-500a20);
`

export default UserStats
