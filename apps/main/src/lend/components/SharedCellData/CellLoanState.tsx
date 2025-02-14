import React, { useMemo } from 'react'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'

import Box from '@ui/Box'
import Chip from 'ui/src/Typography/Chip'
import InpChipUsdRate from '@/lend/components/InpChipUsdRate'
import TextCaption from '@ui/TextCaption'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

const CellLoanState = ({ userActiveKey, market }: { userActiveKey: string; market: OneWayMarketTemplate }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { address } = market?.collateral_token ?? {}
  const { details, error } = resp ?? {}
  const { current_collateral_estimation, deposited_collateral } = details?.loss ?? {}

  const diff = useMemo(() => {
    if (typeof current_collateral_estimation === 'undefined' || typeof deposited_collateral === 'undefined') return null
    return Math.abs(Number(deposited_collateral) - Number(current_collateral_estimation)).toString()
  }, [current_collateral_estimation, deposited_collateral])

  const depositedCollateral = formatNumber(deposited_collateral, { trailingZeroDisplay: 'stripIfInteger' })
  const currentCollateralEst = formatNumber(current_collateral_estimation, { trailingZeroDisplay: 'stripIfInteger' })

  return (
    <>
      {typeof current_collateral_estimation === 'undefined' ||
      typeof deposited_collateral === 'undefined' ||
      diff === null ? (
        '-'
      ) : error ? (
        '?'
      ) : (
        <Chip
          size="md"
          tooltip={
            <Box gridGap={3}>
              <Box gridGap={1} padding="0.25rem">
                <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                  <strong>Deposited</strong> <StyledValue>{depositedCollateral}</StyledValue>
                </Box>
                <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                  <strong>Current Bal. (est.)*</strong> <StyledValue>- {currentCollateralEst}</StyledValue>
                </Box>
                <hr />
                <div className="right">
                  {formatNumber(diff)}
                  <br />
                  <InpChipUsdRate hideRate address={address} amount={diff} />
                </div>
              </Box>
              <TextCaption>{t`*current balance minus losses`}</TextCaption>
            </Box>
          }
        >
          {`${currentCollateralEst}`} <TextCaption>/ {depositedCollateral}</TextCaption>
        </Chip>
      )}
    </>
  )
}

const StyledValue = styled.div`
  text-align: right;
  white-space: nowrap;
`

export default CellLoanState
