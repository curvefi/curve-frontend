import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Chip from 'ui/src/Typography/Chip'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import TextCaption from '@/ui/TextCaption'

const CellLoanState = ({
  userActiveKey,
  owmDataCachedOrApi,
}: {
  userActiveKey: string
  owmDataCachedOrApi: OWMDataCacheOrApi
}) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { address } = owmDataCachedOrApi?.owm?.collateral_token ?? {}
  const { details, error } = resp ?? {}
  const { current_collateral_estimation, deposited_collateral } = details?.loss ?? {}

  const diff = useMemo(() => {
    if (typeof current_collateral_estimation === 'undefined' || typeof deposited_collateral === 'undefined') return null
    return Math.abs(Number(deposited_collateral) - Number(current_collateral_estimation)).toString()
  }, [current_collateral_estimation, deposited_collateral])

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
                  <strong>Deposited</strong> <StyledValue>{formatNumber(deposited_collateral)}</StyledValue>
                </Box>
                <Box grid gridTemplateColumns="140px auto" gridGap={1}>
                  <strong>Current Bal. (est.)*</strong>{' '}
                  <StyledValue>- {formatNumber(current_collateral_estimation)}</StyledValue>
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
          {`${formatNumber(current_collateral_estimation, { trailingZeroDisplay: 'stripIfInteger' })}`}{' '}
          <TextCaption>/ {formatNumber(deposited_collateral, { trailingZeroDisplay: 'stripIfInteger' })}</TextCaption>
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
