import { useUserLoanDetails } from '@/lend/hooks/useUserLoanDetails'

export const UserInfoLeverage = ({ userActiveKey }: { userActiveKey: string }) => {
  const { error, ...details } = useUserLoanDetails(userActiveKey)

  if (error) return '?'

  return (
    <>{!details?.leverage || !isFinite(Number(details.leverage)) ? '-' : `${Number(details.leverage).toFixed(2)}x`}</>
  )
}
