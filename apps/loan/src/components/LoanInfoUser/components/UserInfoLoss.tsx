import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { getTokenName } from '@/utils/utilsLoan'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Chip from 'ui/src/Typography/Chip'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import ListInfoItem, { ListInfoItems } from '@/ui/ListInfo'
import TextCaption from '@/ui/TextCaption'

const SMALL_AMOUNT = 0.0001

const UserInfoLoss = ({
  llammaId,
  llamma,
  collateralAddress,
}: {
  llammaId: string
  llamma: Llamma | null
  collateralAddress: string
}) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const { current_collateral_estimation, deposited_collateral, loss, loss_pct } = userLoanDetails?.userLoss ?? {}

  const diff = useMemo(() => {
    if (typeof current_collateral_estimation === 'undefined' || typeof deposited_collateral === 'undefined') return null
    return Math.abs(Number(deposited_collateral) - Number(current_collateral_estimation)).toString()
  }, [current_collateral_estimation, deposited_collateral])

  return (
    <ListInfoItems>
      <ListInfoItem
        isFull
        title={
          <>
            {t`Collateral`} ({getTokenName(llamma)?.collateral})<br />
            {t`Current balance (est.) / Deposited`}
          </>
        }
      >
        {typeof current_collateral_estimation === 'undefined' ||
        typeof deposited_collateral === 'undefined' ||
        diff === null ? (
          '-'
        ) : (
          <Chip
            size="md"
            tooltip={
              <Box gridGap={3}>
                <Box gridGap={1} padding="0.25rem">
                  <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                    <strong>Deposited</strong> <Value>{formatNumber(deposited_collateral)}</Value>
                  </Box>
                  <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                    <strong>Current Bal. (est.)*</strong> <Value>- {formatNumber(current_collateral_estimation)}</Value>
                  </Box>
                  <hr />
                  <div className="right">
                    {formatNumber(diff)}
                    <br />
                    <InpChipUsdRate hideRate address={collateralAddress} amount={diff} />
                  </div>
                </Box>
                <TextCaption>{t`*current balance minus losses`}</TextCaption>
              </Box>
            }
          >
            {`${formatNumber(current_collateral_estimation, { trailingZeroDisplay: 'stripIfInteger' })}`}{' '}
            <TextCaption>/ {formatNumber(deposited_collateral, { trailingZeroDisplay: 'stripIfInteger' })}</TextCaption>
          </Chip>
        )}
      </ListInfoItem>
      <ListInfoItem title={t`Loss amount`}>
        {typeof loss === 'undefined' ? (
          '-'
        ) : Number(loss) <= SMALL_AMOUNT && Number(loss) !== 0 ? (
          <Chip tooltip={loss}>{SMALL_AMOUNT}</Chip>
        ) : (
          formatNumber(loss)
        )}
      </ListInfoItem>
      <ListInfoItem
        title={t`% lost`}
        tooltip={t`This metric measures the loss in collateral value caused by LLAMMA's soft liquidation process, which is activated when the oracle price falls within a user’s liquidation range.`}
        tooltipProps={{ minWidth: '300px' }}
      >
        {typeof loss_pct === 'undefined' ? (
          '-'
        ) : Number(loss_pct) <= SMALL_AMOUNT && Number(loss_pct) !== 0 ? (
          <Chip tooltip={loss_pct}>{SMALL_AMOUNT}</Chip>
        ) : (
          formatNumber(loss_pct, { ...FORMAT_OPTIONS.PERCENT })
        )}
      </ListInfoItem>
    </ListInfoItems>
  )
}

const Value = styled.div`
  text-align: right;
  white-space: nowrap;
`

export default UserInfoLoss
