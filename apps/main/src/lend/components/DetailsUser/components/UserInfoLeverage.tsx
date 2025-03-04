import useStore from '@/lend/store/useStore'

export const UserInfoLeverage = ({ userActiveKey }: { userActiveKey: string }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  if (error) return '?'

  return <>{details?.leverage ? `${Number(details.leverage).toFixed(2)}x` : '-'}</>
}
