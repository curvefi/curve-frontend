import { ReactNode } from 'react'
import styled from 'styled-components'
import AlertSoftLiquidation from '@/loan/components/LoanInfoUser/components/AlertSoftLiquidation'
import UserInfoDebt from '@/loan/components/LoanInfoUser/components/UserInfoDebt'
import UserInfoLiquidationRange from '@/loan/components/LoanInfoUser/components/UserInfoLiquidationRange'
import UserInfoLlammaBalances from '@/loan/components/LoanInfoUser/components/UserInfoLlammaBalances'
import UserInfoLoss from '@/loan/components/LoanInfoUser/components/UserInfoLoss'
import { HealthColorText } from '@/loan/components/LoanInfoUser/styles'
import { TITLE } from '@/loan/constants'
import useStore from '@/loan/store/useStore'
import { Llamma, HealthMode, TitleKey, TitleMapper } from '@/loan/types/loan.types'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const UserInfos = ({
  llammaId,
  llamma,
  isSoftLiquidation,
  healthMode,
  titleMapper,
}: {
  llammaId: string
  llamma: Llamma | null
  isSoftLiquidation: boolean
  healthMode: HealthMode
  titleMapper: TitleMapper
}) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const {
    coins: [stablecoin],
    coinAddresses: [stablecoinAddress],
  } = llamma ?? { coins: [], coinAddresses: [] }

  const { userBandsPct, userStatus } = userLoanDetails ?? {}
  const props = { llammaId, llamma }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: ReactNode; show?: boolean }[][] = [
    [
      { titleKey: TITLE.healthStatus, content: <HealthColorText colorKey={userStatus?.colorKey}>{userStatus?.label ?? '-'}</HealthColorText> },
      { titleKey: TITLE.healthPercent, content: <HealthColorText colorKey={userStatus?.colorKey}>{healthMode?.percent ? formatNumber(healthMode?.percent, FORMAT_OPTIONS.PERCENT) : '-'}</HealthColorText> },
    ],
    [
      { titleKey: TITLE.liquidationRange, content: <UserInfoLiquidationRange {...props} type='liquidationRange' /> },
      { titleKey: TITLE.liquidationBandRange, content: <UserInfoLiquidationRange {...props} type='liquidationBandRange' />, show: isAdvancedMode },
      { titleKey: TITLE.liquidationRangePercent, content: formatNumber(userBandsPct, FORMAT_OPTIONS.PERCENT) },
    ],
    [
      { titleKey: TITLE.lossCollateral, content: <UserInfoLoss {...props} type='lossCollateral' /> },
      { titleKey: TITLE.lossAmount, content: <UserInfoLoss {...props} type='lossAmount' /> },
      { titleKey: TITLE.lossPercent, content: <UserInfoLoss {...props} type='lossPercent' /> },
    ],
    [
      { titleKey: TITLE.llammaBalances, content: <UserInfoLlammaBalances {...props} /> }
    ]
  ]

  return (
    <>
      {isSoftLiquidation && <AlertSoftLiquidation {...props} />}

      <Wrapper>
        <ListInfoItemsWrapper>
          {contents.map((contentsGrouped, idx) => (
            <ListInfoItems key={`contents${idx}`}>
              {contentsGrouped.map(({ titleKey, content, show }, idx) => {
                if (typeof show !== 'undefined' && !show) return null

                return (
                  <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
                    {content}
                  </ListInfoItem>
                )
              })}
            </ListInfoItems>
          ))}
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

  @media (min-width: 840px) {
    position: relative;
    flex-direction: row;
    justify-content: space-between;
  }
`

export default UserInfos
