import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'
import { formatNumber } from '@ui-kit/utils'

export const UserInfoLeverage = ({ userActiveKey }: { userActiveKey: string }) => {
  const { error, ...details } = useUserLoanDetails(userActiveKey)

  if (error) return '?'

  return (
    <>
      {!details?.leverage || !isFinite(Number(details.leverage))
        ? '-'
        : `${formatNumber(Number(details.leverage), { unit: 'multiplier', abbreviate: false })}x`}
    </>
  )
}
