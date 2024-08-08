import React from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { HealthColorText } from '@/components/LoanInfoUser/styles'
import Box from '@/ui/Box'
import ExternalLink from 'ui/src/Link/ExternalLink'
import ListInfoItem from 'ui/src/ListInfo'

const UserInfoHealth = ({ llammaId, healthMode }: { llammaId: string; healthMode: HealthMode }) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const { userStatus } = userLoanDetails ?? {}

  return (
    <ListInfoItem
      title={t`Health`}
      tooltip={
        <Box grid gridGap={2}>
          <p>{t`The loan metric indicates the current health of your position.`}</p>
          <p>
            {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
            <ExternalLink href="https://resources.curve.fi/crvusd/loan-details/#hard-liquidations" $noStyles>
              Click here to learn more.
            </ExternalLink>
          </p>
        </Box>
      }
      tooltipProps={{ minWidth: '250px' }}
    >
      <HealthColorText colorKey={userStatus?.colorKey}>
        {healthMode?.percent ? formatNumber(healthMode?.percent, FORMAT_OPTIONS.PERCENT) : '-'}
      </HealthColorText>
    </ListInfoItem>
  )
}

export default UserInfoHealth
