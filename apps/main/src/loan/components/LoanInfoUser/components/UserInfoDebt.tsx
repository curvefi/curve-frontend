import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import { formatNumber } from '@ui/utils'
import useStore from '@/loan/store/useStore'
import InpChipUsdRate from '@/loan/components/InpChipUsdRate'
import ListInfoItem from '@ui/ListInfo'

const UserInfoDebt = ({
  llammaId,
  stablecoin,
  stablecoinAddress,
}: {
  llammaId: string
  stablecoin: string | undefined
  stablecoinAddress: string | undefined
}) => {
  const userLoanDetails = useStore((state) => state.loans.userDetailsMapper[llammaId])

  const { userState } = userLoanDetails ?? {}

  return (
    <ListInfoItem title={t`Debt`} titleDescription={`(${stablecoin})`} mainValue={formatNumber(userState?.debt)}>
      <StyledInpChipUsdRate hideRate address={stablecoinAddress} amount={userState?.debt} />
    </ListInfoItem>
  )
}

const StyledInpChipUsdRate = styled(InpChipUsdRate)`
  margin-top: 0.2rem;
`

export default UserInfoDebt
