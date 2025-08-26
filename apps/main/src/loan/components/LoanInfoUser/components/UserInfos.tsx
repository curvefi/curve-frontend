import { ReactNode } from 'react'
import { styled } from 'styled-components'
import AlertSoftLiquidation from '@/loan/components/LoanInfoUser/components/AlertSoftLiquidation'
import UserInfoDebt from '@/loan/components/LoanInfoUser/components/UserInfoDebt'
import UserInfoLiquidationRange from '@/loan/components/LoanInfoUser/components/UserInfoLiquidationRange'
import UserInfoLlammaBalances from '@/loan/components/LoanInfoUser/components/UserInfoLlammaBalances'
import UserInfoLoss from '@/loan/components/LoanInfoUser/components/UserInfoLoss'
import { HealthColorText } from '@/loan/components/LoanInfoUser/styles'
import { TITLE } from '@/loan/constants'
import { useMintMarketUserLeverage } from '@/loan/entities/mint-market-user-leverage'
import { useUserLoanDetails, useUserLoanStatus } from '@/loan/hooks/useUserLoanDetails'
import { ChainId, Llamma, HealthMode, TitleKey, TitleMapper } from '@/loan/types/loan.types'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import UserInfoLeverage from '@ui-kit/shared/ui/UserInfoLeverage'

const UserInfos = ({
  llammaId,
  llamma,
  rChainId,
  isSoftLiquidation,
  healthMode,
  titleMapper,
}: {
  llammaId: string
  llamma: Llamma | null
  rChainId: ChainId
  isSoftLiquidation: boolean
  healthMode: HealthMode
  titleMapper: TitleMapper
}) => {
  const { userBandsPct, userStatus } = useUserLoanDetails(llammaId) ?? {}
  const colorKey = useUserLoanStatus(llammaId)
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const { llamaApi: curve } = useConnection()
  const { data: userLeverage, isLoading: isLeverageLoading } = useMintMarketUserLeverage({
    chainId: rChainId,
    marketId: llammaId,
    userAddress: curve?.signerAddress,
  })

  const {
    coins: [stablecoin],
    coinAddresses: [stablecoinAddress],
  } = llamma ?? { coins: [], coinAddresses: [] }

  const props = { llammaId, llamma }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: ReactNode; show?: boolean }[][] = [
    [
      { titleKey: TITLE.healthStatus, content: <HealthColorText colorKey={colorKey}>{userStatus?.label ?? '-'}</HealthColorText> },
      { titleKey: TITLE.healthPercent, content: <HealthColorText colorKey={colorKey}>{healthMode?.percent ? formatNumber(healthMode?.percent, FORMAT_OPTIONS.PERCENT) : '-'}</HealthColorText> },
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
    ],
    [
      { titleKey: TITLE.leverage, content: <UserInfoLeverage currentLeverage={userLeverage?.value} loading={isLeverageLoading} />, show: !!userLeverage?.value }
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
