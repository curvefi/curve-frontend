import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { HealthColorText } from '@/components/LoanInfoUser/styles'
import AlertSoftLiquidation from '@/components/LoanInfoUser/components/AlertSoftLiquidation'
import Box from '@/ui/Box'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import UserInfoLiquidationRange from '@/components/LoanInfoUser/components/UserInfoLiquidationRange'
import UserInfoHealth from '@/components/LoanInfoUser/components/UserInfoHealth'
import UserInfoDebt from '@/components/LoanInfoUser/components/UserInfoDebt'
import UserInfoLoss from '@/components/LoanInfoUser/components/UserInfoLoss'

const UserInfos = ({
  llammaId,
  llamma,
  isSoftLiquidation,
  healthMode,
}: {
  llammaId: string
  llamma: Llamma | null
  isSoftLiquidation: boolean
  healthMode: HealthMode
}) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const {
    coins: [stablecoin, collateral],
    coinAddresses: [stablecoinAddress, collateralAddress],
  } = llamma ?? { coins: [], coinAddresses: [] }

  const { userBandsPct, userState, userStatus } = userLoanDetails ?? {}

  return (
    <>
      {isSoftLiquidation && <AlertSoftLiquidation llammaId={llammaId} llamma={llamma} />}

      <Wrapper>
        <ListInfoItemsWrapper>
          {/* health's status, percent; debt; borrow rate */}
          <ListInfoItems>
            <ListInfoItem title={t`Status`}>
              <HealthColorText colorKey={userStatus?.colorKey}>{userStatus?.label ?? '-'}</HealthColorText>
            </ListInfoItem>
            <UserInfoHealth llammaId={llammaId} healthMode={healthMode} />
            <ListInfoItem title={t`Borrow rate`}>
              <TableCellRate isBold collateralId={llammaId} />
            </ListInfoItem>
          </ListInfoItems>

          {/* liquidation's range, price, percent */}
          <ListInfoItems>
            <UserInfoLiquidationRange llammaId={llammaId} />
            <ListInfoItem title={t`Range %`}>{formatNumber(userBandsPct, FORMAT_OPTIONS.PERCENT)}</ListInfoItem>
          </ListInfoItems>

          {/* collateral's balance, loss, loss percent */}
          <UserInfoLoss llammaId={llammaId} llamma={llamma} collateralAddress={collateralAddress} />

          {/* LLAMMA balances */}
          <ListInfoItems>
            <ListInfoItem title={t`LLAMMA Balances`}>
              <Box flex gridGap={3}>
                <ListInfoItem title={collateral}>
                  <Box grid>
                    {formatNumber(userState?.collateral, { defaultValue: '-' })}
                    <InpChipUsdRate hideRate address={collateralAddress} amount={userState?.collateral} />
                  </Box>
                </ListInfoItem>
                <ListInfoItem title={stablecoin}>
                  <Box grid>
                    {formatNumber(userState?.stablecoin, { defaultValue: '' })}
                    <InpChipUsdRate hideRate address={stablecoinAddress} amount={userState?.stablecoin} />
                  </Box>
                </ListInfoItem>
              </Box>
            </ListInfoItem>
          </ListInfoItems>
        </ListInfoItemsWrapper>

        <UserInfoDebt llammaId={llammaId} stablecoin={stablecoin} stablecoinAddress={stablecoinAddress} />
      </Wrapper>
    </>
  )
}

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column-reverse;

  @media (min-width: ${breakpoints.sm}rem) {
    position: relative;
    flex-direction: row;
    justify-content: space-between;
  }
`

export default UserInfos
